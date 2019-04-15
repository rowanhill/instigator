interface ReactiveFn<R> {
    (updated?: R): R;
    registerConsumer: (consumer: () => void) => void;
}

function activeSource<R>(initial: R): ReactiveFn<R> {
    let latest: R = initial;
    const consumers: Set<() => void> = new Set();
    const fn: ReactiveFn<R> = function(updated?: R) {
        if (arguments.length === 1 && latest !== updated) {
            latest = updated!;
            // console.log('reactive updated: ' + latest);
            consumers.forEach(c => c());
        }
        return latest;
    };
    fn.registerConsumer = (consumer: () => void) => {
        consumers.add(consumer);
    };

    return fn;
}

function consumer<T1>(
    inputs: [ReactiveFn<T1>],
    execute: (...args: [T1]) => void
): () => void;
function consumer<T1, T2>(
    inputs: [ReactiveFn<T1>, ReactiveFn<T2>],
    execute: (...args: [T1, T2]) => void
): () => void;
function consumer<T1, T2, T3>(
    inputs: [ReactiveFn<T1>, ReactiveFn<T2>, ReactiveFn<T3>],
    execute: (...args: [T1, T2, T3]) => void
): () => void;
function consumer<T1, T2, T3, T4>(
    inputs: [ReactiveFn<T1>, ReactiveFn<T2>, ReactiveFn<T3>, ReactiveFn<T4>],
    execute: (...args: [T1, T2, T3, T4]) => void
): () => void;
function consumer<T1, T2, T3, T4, T5>(
    inputs: [ReactiveFn<T1>, ReactiveFn<T2>, ReactiveFn<T3>, ReactiveFn<T4>, ReactiveFn<T5>],
    execute: (...args: [T1, T2, T3, T4, T5]) => void
): () => void;
function consumer(inputs: ReactiveFn<any>[], execute: (...args: any[]) => void): () => void {
    const fn = () => {
        const args = inputs.map(d => d());
        execute(...args);
        // console.log('observe executed');
    };
    inputs.forEach(d => d.registerConsumer(fn));
    return fn;
}

function transformer<R>(inputs: ReactiveFn<any>[], execute: (...args: any[]) => R): ReactiveFn<R> {
    let lastArgs = inputs.map(_ => undefined);
    let latest: R = undefined as unknown as R;
    
    const fn = () => {
        const args = inputs.map(d => d());
        for (let i = 0; i < args.length; i++) {
            if (lastArgs[i] !== args[i]) {
                latest = execute(...args);
                // console.log('computed updated: ' + latest, lastArgs[i], args[i]);
                lastArgs = args;
                break;
            }
        }
        // console.log('computed returned: ' + latest);
        return latest;
    };
    fn.registerConsumer = (consumer: () => void) => {
        inputs.forEach(input => input.registerConsumer(consumer));
    };

    inputs.forEach(input => input.registerConsumer(fn));
    
    return fn;
}

const foo: ReactiveFn<number> = activeSource(1);
const bar: ReactiveFn<string> = activeSource('Hello');

const twoFoo = transformer([foo], (fooVal) => fooVal * 2);
const threeFoo = transformer([foo], (fooVal) => fooVal * 3);
const combinedFoos = transformer([twoFoo, threeFoo], (twoVal, threeVal) => twoVal + threeVal);

const printFoo = consumer([foo], (fooVal) => console.log('printFoo: ', fooVal));
const printTwoFoo = consumer([twoFoo], (twoFooVal) => console.log('printTwoFoo: ', twoFooVal));
const printCombinedFoo = consumer([combinedFoos], (combinedVal) => console.log('printCombinedFoo: ', combinedVal));
const printBar = consumer([bar], (barVal) => console.log('printBar: ', barVal));
const printAll = consumer([foo, twoFoo, threeFoo, combinedFoos, bar], (fooVal, twoFooVal, threeFooVal, combinedFooVal, barVal) => console.log('printAll: ', fooVal, twoFooVal, threeFooVal, combinedFooVal, barVal));

printAll();
console.log('');

console.log('foo(1)');
foo(1);
console.log('');

console.log('foo(2)');
foo(2);
console.log('');

console.log('foo(3)');
foo(3);
console.log('');

console.log('bar(World)');
bar('World');
console.log('');

console.log('foo(3)');
foo(3);
console.log('');

console.log('foo(30)');
foo(30);
console.log('');

// printFoo();