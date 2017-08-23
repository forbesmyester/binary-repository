# t-fp-dissoc

## Usage

Simple `dissoc()` function wrote in Typescript.

    import dissoc from 't-fp-assoc';

    let input1: Letter = {a: false, b: 1, c: 'hi'};
    let input2: {a: boolean, b: number, c: string}  = {a: false, b: 1, c: 'hi'};
    let input3: {[k: string]: number|string|boolean}  = {a: false, b: 1, c: 'hi'};

    let result1 = dissoc('c', input1); // {a: false, b: 1}
    let result2 = dissoc('c', input2); // {a: false, b: 1}
    let result3 = dissoc('c', input3); // {a: false, b: 1}

The type for `result1` and `result2` is:

    {
        a?: boolean | undefined;
        b?: number | undefined;
        c?: string | undefined;
    }`.

The type for `result3` is:

    {
        [x: string]: string | number | boolean | undefined;
    }

## Installation

Use `npm install t-fp-dissoc` to install.
