import { Callback } from './Types';
import { Transform } from 'stronger-typed-streams';
export { Duplex, Writable, Transform, Readable } from 'stronger-typed-streams';
export interface JoinStorage<T> {
    find(qry: Partial<T>, next: Callback<T[]>): void;
    add(t: T, next: (e?: null) => void): any;
}
export declare class MemoryJoinStorage<T> implements JoinStorage<T> {
    private obs;
    find(qry: Partial<T>, next: Callback<T[]>): void;
    add(t: T, next: (e?: null) => void): void;
}
export interface KVStore<K, V> {
    get(k: K, next: Callback<V | null>): void;
    add(k: K, v: V, next: (e?: null) => void): any;
}
export declare class MemoryKVStore<K, V> implements KVStore<K, V> {
    private data;
    get(k: K, next: Callback<V | null>): void;
    add(k: K, v: V, next: (e?: null) => void): void;
}
export declare enum LeftOrRight {
    Left = 1,
    Right = 2,
}
export interface LeftOrRightDecider<L, R> {
    (lOrR: L | R): LeftOrRight.Left | LeftOrRight.Right;
}
export interface JoinTransformOut<L, R> {
    l: L[];
    r: R[];
}
export interface JTQry {
    lQry: any;
    rQry: any;
}
export declare class JoinTransform<L, R> extends Transform<L | R, JoinTransformOut<L, R>> {
    private leftOrRight;
    private leftStorage;
    private rightStorage;
    private lToQrys;
    private rToQrys;
    constructor(leftOrRight: LeftOrRightDecider<L, R>, lToQrys: (l: L) => JTQry, rToQrys: (r: R) => JTQry, opts: any);
    doQry({lQry, rQry}: JTQry, next: Callback<JoinTransformOut<L, R>>): void;
    _transform(a: L | R, encoding: any, cb: any): void;
}
export declare class InnerJoinTransform<L, R, O, K> extends Transform<JoinTransformOut<L, R>, O> {
    private joinStorage;
    private merge;
    private indexer;
    constructor(merge: (l: L, r: R) => O, indexer: (o: O) => K, opts: any);
    _transform(a: JoinTransformOut<L, R>, encoding: any, cb: any): void;
}
