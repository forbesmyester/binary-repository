# t-fp-from-pairs

## Usage

Simple `fromPairs()` function wrote in Typescript.

    import fromPairs from 't-fp-from-pairs';

    let input: [string, boolean|string][] = [['a', false], ['b', 'bob']];
    let result = fromPairs(input);

The type for result is `{[k: string]: string | boolean}`.

## Installation

Use `npm install t-fp-from-pairs` to install.
