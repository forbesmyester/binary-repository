import test from 'ava';
import { Callback } from '../src/Types';
import { JoinTransformOut, InnerJoinTransform, JoinTransform, LeftOrRight, MemoryJoinStorage, LeftOrRightDecider } from '../src/join';
import { Writable, ArrayReadable } from 'streamdash';

interface Thing { name: string; type: string; }


class Outer<T> extends Writable<T> {
    private out: T[] = [];
    _write(thing: T, encoding, cb) {
        this.out.push(thing);
        cb();
    }
    get() {
        return this.out;
    }
}

function aReduce<R, X>(f: (acc: R, xs: X, cb: Callback<R>) => void, acc: R, xs: X[], next: Callback<R>): void {
    let myXs: X[] = xs.concat([]);

    let initiator = () => {
        if (myXs.length == 0) { return next(null, acc); }
        f(acc, <X>myXs.shift(), (err, newAcc) => {
            if (err) { return next(err); }
            acc = <R>newAcc;
            initiator();
        });
    };

    initiator();
}

test.cb('Can find things in storage', function(tst) {

    let worker = (acc: MemoryJoinStorage<Thing>, x: Thing, next) => {
        acc.add(x, (e) => {
            next(null, acc);
        });
    };

    let items = [
        { name: "A", type: "Letter" },
        { name: "B", type: "Letter" },
        { name: "C", type: "Letter" }
    ];

    let initial = new MemoryJoinStorage<Thing>();

    aReduce(worker, initial, items, (e, storage: MemoryJoinStorage<Thing>) => {
        storage.find({name: "B"}, (e, vs) => {
            tst.deepEqual(vs, [{ name: "B", type: "Letter" }]);
            tst.end();
        });
    });

});

const CUSTOMER = "customer";

interface Item { customerId: string; type: string; item: string; }
interface Customer { id: string; type: string; name: string; }

function getJoin() {

    let input: (Customer|Item)[] = [
        { customerId: "A", type: "order", item: "Shoe" },
        { type: "customer", id: "A", name: "Jack" },
        { customerId: "B", type: "order", item: "Ruler" },
        { type: "customer", id: "B", name: "Jane" },
        { customerId: "A", type: "order", item: "Car" },
    ];

    let src: ArrayReadable<Customer|Item> = new ArrayReadable(input);

    let isLeft: LeftOrRightDecider<Customer, Item> = (t) => {
        if (t.type == CUSTOMER) {
            return LeftOrRight.Left;
        }
        return LeftOrRight.Right;
    };
    let qb = (t: Customer|Item) => {

        if (t.type == CUSTOMER) {
            return {
                lQry: { id: (<Customer>t).id },
                rQry: { customerId: (<Customer>t).id }
            };
        }

        return {
            lQry: { id: (<Item>t).customerId },
            rQry: { customerId: (<Item>t).customerId }
        };

    };
    let jt = new JoinTransform<Customer, Item>(isLeft, qb, qb, {objectMode: true});

    src.pipe(jt);

    return jt;
}

test.cb('Can join', function(tst) {

    let jt = getJoin();
    let dst = new Outer<JoinTransformOut<Customer, Item>>({objectMode: true});

    let expected = [
        { l: [], r: [{ customerId: "A", type: "order", item: "Shoe" }] },
        {
            l: [{ type: "customer", id: "A", name: "Jack" }],
            r: [{ customerId: "A", type: "order", item: "Shoe" }]
        },
        { l: [], r: [{ customerId: "B", type: "order", item: "Ruler" }] },
        {
            l: [{ type: "customer", id: "B", name: "Jane" }],
            r: [{ customerId: "B", type: "order", item: "Ruler" }]
        },
        {
            l: [{ type: "customer", id: "A", name: "Jack" }],
            r: [
                { customerId: "A", type: "order", item: "Shoe" },
                { customerId: "A", type: "order", item: "Car" }
            ]
        }
    ];

    jt.pipe(dst);

    dst.on('finish', () => {
        tst.deepEqual(dst.get(), expected);
        tst.end();
    });

});

interface Order { customerId: string; name: string; item: string; }

test.cb('Can get as inner join', function(tst) {

    let jt = getJoin();

    let expected = [
        { customerId: "A", name: "Jack", item: "Shoe" },
        { customerId: "B", name: "Jane", item: "Ruler" },
        { customerId: "A", name: "Jack", item: "Car" }
    ];

    let makeOrder = new InnerJoinTransform<Customer, Item, Order, string>(
        (l: Customer, r: Item): Order => {
            return { customerId: l.id, name: l.name, item: r.item };
        },
        (o: Order) => `${o.customerId}:${o.item}`,
        {objectMode: true}
    );

    let dst = new Outer<Order>({objectMode: true});

    jt.pipe(makeOrder).pipe(dst);

    dst.on('finish', () => {
        tst.deepEqual(dst.get(), expected);
        tst.end();
    });

});


