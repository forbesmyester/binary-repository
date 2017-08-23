# t-fp-merge

## Usage

Simple `merge()` function wrote in Typescript.

    let a: {[k: string]: boolean} = {a: false};
    let b: {[k: string]: number} = {b: 1};
    let c: {[k: string]: string} = {c: 'hi'};

    let result = merge(a, b, c); // {a: false, b: 1, c: 'hi'}

The type for result is `{ [k: string]: string | number | boolean }`.

## Installation

Use `npm install t-fp-merge` to install.
