# instigator
A minimal memoization / observer pattern library

## Usage

Instigator lets you define networks of sources, transformers, and consumers. Consumers are
automatically triggered when their inputs change.

```js
import { activeSource, transformer, consumer } from 'instantiator';

// Sources can any (single) value
const number = activeSource(1);

// Transformers take sources (or other transformers) as inputs, and return outputs
const double = transformer([number], (n) => n * 2);
const triple = transformer([number], (n) => n * 3);
const sumOfAllThree = transformer([number, double, triple], (n, d, t) => n + d + t);

// Consumers take transformers/sources as inputs, and produce side-effects (no outputs)
const logSum = consumer([sumOfAllThree], (sum) => console.log(sumOfAllThree));

// Consumers do not trigger when created, but can be invoked manually if you like
logSum(); // prints 6 (because number is set to 1, so 1 + 2 + 3 = 6)

// Consumers are invoked automatically when an input they (or their inputs,
// or their inputs' inputs, etc) rely on
number(2); // Triggers logSum, which prints 12 (from 2 + 4 + 6).

// The current value of sources and transformers can be retrieved at any time
console.log(number(), double(), triple()); // prints 2, 4, 6

// Setting a source to the same value has no effect
number(2); // Nothing happens
```

Tranformers and consumers are memoised, and only execute their functions if their inputs
have changed (based on a shallow equality check)