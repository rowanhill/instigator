interface ReactiveFn<R> {
    (updated?: R): R;
    registerDep: (dep: () => void) => void;
}

function activeSource<R>(initial: R): ReactiveFn<R> {
    let latest: R = initial;
    const deps: Array<() => void> = [];
    const fn: ReactiveFn<R> = function(updated?: R) {
        if (arguments.length === 1 && latest !== updated) {
            latest = updated!;
            // console.log('reactive updated: ' + latest);
            deps.forEach(d => d());
        }
        return latest;
    };
    fn.registerDep = (dep: () => void) => {
        deps.push(dep);
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
    inputs.forEach(d => d.registerDep(fn));
    return fn;
}

function transformer<R>(inputs: ReactiveFn<any>[], execute: (...args: any[]) => R): ReactiveFn<R> {
    const deps: Array<() => void> = [];
    let lastArgs = inputs.map(_ => undefined);
    let latest: R = undefined as unknown as R;
    
    const fn = () => {
        const args = inputs.map(d => d());
        for (let i = 0; i < args.length; i++) {
            if (lastArgs[i] !== args[i]) {
                lastArgs = args;
                latest = execute(...args);
                // console.log('computed updated: ' + latest, lastArgs[i], args[i]);
                deps.forEach(d => d());
                break;
            }
        }
        // console.log('computed returned: ' + latest);
        return latest;
    };
    fn.registerDep = (dep: () => void) => {
        deps.push(dep);
    };

    inputs.forEach(input => input.registerDep(fn));
    
    return fn;
}

const foo: ReactiveFn<number> = activeSource(1);
const bar: ReactiveFn<string> = activeSource('Hello');

const twoFoo = transformer([foo], (fooVal) => fooVal * 2);

const printFoo = consumer([foo], (fooVal) => console.log('printFoo: ', fooVal));
const printTwoFoo = consumer([twoFoo], (twoFooVal) => console.log('printTwoFoo: ', twoFooVal));
const printBar = consumer([bar], (barVal) => console.log('printBar: ', barVal));
const printAll = consumer([foo, twoFoo, bar], (fooVal, twoFooVal, barVal) => console.log('printAll: ', fooVal, twoFooVal, barVal));

// console.log(twoFoo());

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