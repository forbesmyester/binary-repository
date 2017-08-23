# t-fp-assoc

Simple Functional `assoc` function that can be used against typed Interfaces or loose KV pairs.

## Types

The following function signatures exist:

    export interface Assoc {
        <Ob, K extends keyof Ob>(k: K, v: Ob[K], a: Ob): Ob;
        <A, B>(k: string, v: A, ob: {[k: string]: B}): {[k: string]: B|A};
        <Ob, V, K extends keyof Ob>(k: string, v: V, a: Ob): Ob & {[k: string]: Ob[K]|V};
    }

## Usage - Interfaces

    import assoc from 't-fp-assoc-single-type';
    interface XX { a: string; b: number; };

    let xx1: XX = {a: 'str', b: -1};
    let xx2: XX = assoc('b', 10, xx1);
    let result = assoc('b', 10, xx2);

The type for result is `XX`.

## Usage - Extended Interface

    import assoc from 't-fp-assoc-single-type';
    interface XX { a: string; b: number; };

    let xx1: XX = {a: 'str', b: -1};
    let result = assoc('c', null, xx1);

The type for result is `XX & { [k: string]: string | number | null; }`

## Usage - KV Pairs

    import assoc from 't-fp-assoc';

    let input: {[k: string]: number} = {b: 2};
    let result = assoc('a', 'one', input); // {a: 'one', b: 2}

The type for result is `{ [k: string]: string | number }`.

## Installation

Use `npm install t-fp-assoc` to install.
