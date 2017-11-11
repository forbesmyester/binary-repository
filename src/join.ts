import { Callback } from './Types';
import { flatten, xprod, merge, equals } from 'ramda';
import { Transform } from 'stronger-typed-streams';
export { Duplex, Writable, Transform, Readable } from 'stronger-typed-streams';
import { asyncMap } from 'streamdash';

export interface JoinStorage<T> {
    find(qry: Partial<T>, next: Callback<T[]>): void;
    add(t: T, next: (e?: null) => void);
}

export class MemoryJoinStorage<T> implements JoinStorage<T> {

    private obs: T[] = [];

    find(qry: Partial<T>, next: Callback<T[]>): void {
        next(null, this.obs.filter((o) => {
            return equals(o, merge(o, qry));
        }));
    }

    add(t: T, next: (e?: null) => void) {
        this.obs.push(t);
        next();
    }
}

export interface KVStore<K, V> {
    get(k: K, next: Callback<V|null>): void;
    add(k: K, v: V, next: (e?: null) => void);
}

export class MemoryKVStore<K, V> implements KVStore<K, V> {

    private data: {k: K, v: V}[] = [];

    get(k: K, next: Callback<V|null>): void {
        let r = this.data.filter(({k: myK}) => {
            return equals(myK, k);
        }).map(({v}) => v);
        if (r.length) { return next(null, r[0]); }
        return next(null, null);
    }

    add(k: K, v: V, next: (e?: null) => void) {
        this.data = this.data.filter(({k: myK}) => {
            return !equals(myK, k);
        });
        this.data.push({k, v});
        next(null);
    }
}

export enum LeftOrRight { Left = 1, Right = 2 }

export interface LeftOrRightDecider<L, R> {
    (lOrR: L | R): LeftOrRight.Left | LeftOrRight.Right;
}

export interface JoinTransformOut<L, R> {
    l: L[];
    r: R[];
}

export interface JTQry { lQry: any; rQry: any; }

export class JoinTransform<L, R> extends Transform<L | R, JoinTransformOut<L, R>> {

    private leftOrRight: LeftOrRightDecider<L, R>;
    private leftStorage = new MemoryJoinStorage<L>();
    private rightStorage = new MemoryJoinStorage<R>();
    private lToQrys: (l: L) => JTQry;
    private rToQrys: (r: R) => JTQry;

    constructor(leftOrRight: LeftOrRightDecider<L, R>, lToQrys: (l: L) => JTQry, rToQrys: (r: R) => JTQry, opts) {
        super(opts);
        this.leftOrRight = leftOrRight;
        this.lToQrys = lToQrys;
        this.rToQrys = rToQrys;
    }

    doQry({lQry, rQry}: JTQry, next: Callback<JoinTransformOut<L, R>>): void {
        let r: Partial<JoinTransformOut<L, R>> = {};
        let isDone = (a: Partial<JoinTransformOut<L, R>>): boolean => {
            return (Object.keys(a).length == 2);
        };
        let perhaps = (e) => {
            if (e) { return next(e); }
            if (isDone(r)) {
                next(null, <JoinTransformOut<L, R>>r);
            }
        };
        this.leftStorage.find(lQry, (e, items) => {
            r.l = items;
            perhaps(e);
        });

        this.rightStorage.find(rQry, (e, items) => {
            r.r = items;
            perhaps(e);
        });
    }

    _transform(a: L|R, encoding, cb) {
        let qry = this.leftOrRight(a) == LeftOrRight.Left ?
            this.lToQrys(<L>a) :
            this.rToQrys(<R>a);
        let stored = (e) => {
            if (e) { return cb(e); } // TODO: Test Errors
            this.doQry(qry, (e, r: JoinTransformOut<L, R>) => {
                if (e) { return cb(e); } // TODO: Test Errors
                this.push(r);
                cb();
            });
        };
        if (this.leftOrRight(a) == LeftOrRight.Left) {
            return this.leftStorage.add(<L>a, stored);
        }
        this.rightStorage.add(<R>a, stored);
    }

}

export class InnerJoinTransform<L, R, O, K> extends Transform<JoinTransformOut<L, R>, O> {

    private joinStorage = new MemoryKVStore<K, O>();
    private merge: (l: L, r: R) => O;
    private indexer: (o: O) => K;

    constructor(merge: (l: L, r: R) => O, indexer: (o: O) => K, opts) {
        super(opts);
        this.merge = merge;
        this.indexer = indexer;
    }

    _transform(a: JoinTransformOut<L, R>, encoding, cb) {

        let worker = ([l, r]: [L, R], cb: Callback<O[]>) => {
            let v = this.merge(l, r);
            let k = this.indexer(v);
            this.joinStorage.get(k, (e, o: O|null) => {
                if (e) { return cb(e); }
                if (o !== null) { return cb(null, []); }
                this.joinStorage.add(k, v, (e) => {
                    cb(null, [v]);
                });
            });
        };

        let pairs  = xprod(a.l, a.r);
        asyncMap(worker, pairs, (e, os: O[][]) => { // TODO: Swap for more parallel!
            if (e) { return cb(e); }
            if (os.length > 0) {
                flatten(os).map((o) => {
                    this.push(o);
                });
            }
            return cb();
        });
        // pairs.map(this.worker);
    }
}


