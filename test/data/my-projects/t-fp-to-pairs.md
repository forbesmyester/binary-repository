# t-fp-to-pairs

## Usage

Simple `toPairs()` function wrote in Typescript.

    import toPairs from 't-fp-to-pairs';

    let a: {[k: string]: boolean|string} = {a: false, b: 'bob'};
    let result = toPairs(a); // [['a', false], ['b', 'bob']]

The type for result is `[string, string | boolean][]`.

## Installation

Use `npm install t-fp-to-pairs` to install.
