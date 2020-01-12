import { Comparator, consumer, activeSource, transformer, batch, ActiveSource, mergeTransformer } from './index';

// Set up a global fake console.log
const console = {
    log: jest.fn(),
};

function expectLogAndReset(...args: any[]) {
    expect(console.log).toHaveBeenCalledWith(...args);
    console.log.mockReset();
}

describe('Summary example', () => {
    it('executes as per the comments', () => {
        // Sources can any (single) value
        const number = activeSource(1);

        // Transformers take sources (or other transformers) as inputs, and return outputs
        const double = transformer([number], (n) => n * 2);
        const triple = transformer([number], (n) => n * 3);
        const sumOfAllThree = transformer([number, double, triple], (n, d, t) => n + d + t);

        // Consumers take transformers/sources as inputs, and produce side-effects (no outputs)
        const logSum = consumer([sumOfAllThree], (sum) => console.log(sum));

        // Consumers do not trigger when created, but can be invoked manually if you like
        logSum(); // prints 6 (because number is set to 1, so 1 + 2 + 3 = 6)
        expectLogAndReset(6);

        // Consumers are invoked automatically when an input they (or their inputs,
        // or their inputs' inputs, etc) rely on changes
        number(2); // Triggers logSum, which prints 12 (from 2 + 4 + 6).
        expectLogAndReset(12);

        // The current value of sources and transformers can be retrieved at any time
        console.log(number(), double(), triple()); // prints 2, 4, 6
        expectLogAndReset(2, 4, 6);

        // Setting a source to the same value has no effect
        number(2); // Nothing happens
        expect(console.log).not.toHaveBeenCalled();
    });
});

describe('Custom comparitors example', () => {
    it('executes as per the comments', () => {
        // Without a custom equality check, all simple functions are considered equal
        const fnSource: ActiveSource<() => number> = activeSource(() => 1);
        const doubler = transformer([fnSource], (fn) => (() => fn() * 2));
        consumer([doubler], (fn) => console.log(fn()));
        fnSource(() => 1); // Does nothing
        fnSource(() => 2); // Does nothing
        expect(console.log).not.toHaveBeenCalled();

        // We can override the default shallow equality check and use a simple reference equality test
        // Note the source, transformer and consumer all receive functions as inputs, so all need a custom
        // comparitor
        const refEquals: Comparator<() => number> = (a, b) => a === b;
        const fnSourceCustom = activeSource(() => 1, refEquals);
        const doublerCustom = transformer([fnSourceCustom], (fn) => (() => fn() * 2), refEquals);
        consumer([doublerCustom], (fn) => console.log(fn()), refEquals);
        fnSourceCustom(() => 1); // Prints 2
        expectLogAndReset(2);
        fnSourceCustom(() => 2); // Prints 4
        expectLogAndReset(4);
    });
});

describe('Batching example', () => {
    it('executes as per the comments', () => {
        const source1 = activeSource('1a');
        const source2 = activeSource('2a');
        const source3 = activeSource('3a');
        consumer([source1, source2, source3], console.log);
        
        // Without batch, an update to any source will trigger the consumer
        source1('1b'); // prints 1b, 2a, 3a
        expectLogAndReset('1b', '2a', '3a');
        source2('2b'); // prints 1b, 2b, 3a
        expectLogAndReset('1b', '2b', '3a');
        source3('3b'); // prints 1b, 2b, 3b
        expectLogAndReset('1b', '2b', '3b');
        
        // With batch, updates are held until the end
        batch(() => { // The function passed to batch is executed immediately and synchronously
            source1('1c'); // Nothing is printed
            source2('2c'); // Nothing is printed
            source3('3c'); // Nothing is printed
            expect(console.log).not.toHaveBeenCalled();
        }); // Once the batch function completes consumers trigger, so logger prints 1c, 2c, 3c
        expectLogAndReset('1c', '2c', '3c');
    });
});

describe('deregistering example', () => {
    it('executes as per the comments', () => {
        const source1 = activeSource('1a');
        const source2 = activeSource('2a');
        const source3 = activeSource('3a');
        const logConsumer = consumer([source1, source2, source3], console.log);
        
        // After deregistering a consumer, it is not triggered by changes to its sources
        logConsumer.deregister();
        source1('1d'); // Nothing is printed
        source2('2d'); // Nothing is printed
        source3('3d'); // Nothing is printed
        expect(console.log).not.toHaveBeenCalled();
    });
});

describe('mergeTransformer example', () => {
    it('executes as per the comments', () => {
        const source = activeSource(1);
        const double = transformer([source], (i) => i * 2);
        
        const merged = mergeTransformer({ source, double });
        
        console.log(JSON.stringify(merged())); // Prints { source: 1, double: 2 }

        expect(console.log).toHaveBeenCalledWith('{"source":1,"double":2}');
    });
});