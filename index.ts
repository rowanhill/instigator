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
            consumers.forEach(c => c());
        }
        return latest;
    };
    fn.registerConsumer = (consumer: () => void) => {
        consumers.add(consumer);
    };

    return fn;
}

function transformer<T1, R>(
    inputs: [ReactiveFn<T1>],
    execute: (...args: [T1]) => R
): ReactiveFn<R>;
function transformer<T1, T2, R>(
    inputs: [ReactiveFn<T1>, ReactiveFn<T2>],
    execute: (...args: [T1, T2]) => R
): ReactiveFn<R>;
function transformer<T1, T2, T3, R>(
    inputs: [ReactiveFn<T1>, ReactiveFn<T2>, ReactiveFn<T3>],
    execute: (...args: [T1, T2, T3]) => R
): ReactiveFn<R>;
function transformer<T1, T2, T3, T4, R>(
    inputs: [ReactiveFn<T1>, ReactiveFn<T2>, ReactiveFn<T3>, ReactiveFn<T4>],
    execute: (...args: [T1, T2, T3, T4]) => R
): ReactiveFn<R>;
function transformer<T1, T2, T3, T4, T5, R>(
    inputs: [ReactiveFn<T1>, ReactiveFn<T2>, ReactiveFn<T3>, ReactiveFn<T4>, ReactiveFn<T5>],
    execute: (...args: [T1, T2, T3, T4, T5]) => R
): ReactiveFn<R>;
function transformer<R>(inputs: ReactiveFn<any>[], execute: (...args: any[]) => R): ReactiveFn<R> {
    let lastArgs = inputs.map(_ => undefined);
    let latest: R = undefined as unknown as R;
    
    const fn: ReactiveFn<R> = () => {
        const args = inputs.map(d => d());
        for (let i = 0; i < args.length; i++) {
            if (lastArgs[i] !== args[i]) {
                latest = execute(...args);
                lastArgs = args;
                break;
            }
        }
        return latest;
    };
    fn.registerConsumer = (consumer: () => void) => {
        inputs.forEach(input => input.registerConsumer(consumer));
    };

    inputs.forEach(input => input.registerConsumer(fn));
    
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
    };
    inputs.forEach(d => d.registerConsumer(fn));
    return fn;
}