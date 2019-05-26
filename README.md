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
have changed (based on a shallow equality check).

If you want to update multiple sources but only trigger downstream consumers once, you can use batch:

```js
import { batch, activeSource, consumer } from 'instantiator';

const source1 = activeSource('1a');
const source2 = activeSource('2a');
const source3 = activeSource('3a');
const logConsumer = consumer([source1, source2, source3], console.log);

// Without batch, an update to any source will trigger the consumer
source1('1b'); // prints 1b, 2a, 3a
source2('2b'); // prints 1b, 2b, 3a
source3('3b'); // prints 1b, 2b, 3b

// With batch, updates are held until the end
batch(() => { // The function passed to batch is executed immediately and synchronously
    source1('1c'); // Nothing is printed
    source2('2c'); // Nothing is printed
    source3('3c'); // Nothing is printed
}); // Once the batch function completes consumers trigger, so logger prints 1c, 2c, 3c

// After deregistering a consumer, it is not triggered by changes to its sources
logConsumer.deregister();
source1('1d'); // Nothing is printed
source2('2d'); // Nothing is printed
source3('3d'); // Nothing is printed

```