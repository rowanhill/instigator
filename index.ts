import shallowEqual from 'shallow-equals';

export interface ActiveSource<R> {
    (updated?: R): R;
    registerConsumer: (consumer: () => void) => void;
    deregisterConsumer: (consumer: () => void) => void;
}

export interface ReactiveFn<R> {
    (): R;
    registerConsumer: (consumer: () => void) => void;
    deregisterConsumer: (consumer: () => void) => void;
}

export interface ReactiveConsumer {
    (): void;
    deregister: () => void;
}

let batchedConsumers: Set<() => void>|null = null;

export function activeSource<R>(initial: R): ActiveSource<R> {
    let latest: R = initial;
    const consumers: Set<() => void> = new Set();
    const fn: ActiveSource<R> = function(updated?: R) {
        if (arguments.length === 1 && !shallowEqual(latest, updated)) {
            latest = updated!;
            if (batchedConsumers !== null) {
                for (const c of consumers) {
                    batchedConsumers.add(c)
                }
            } else {
                for (const c of consumers) {
                    c();
                }
            }
        }
        return latest;
    };
    fn.registerConsumer = (consumer: () => void) => {
        consumers.add(consumer);
    };
    fn.deregisterConsumer = (consumer: () => void) => {
        consumers.delete(consumer);
    };

    return fn;
}

export function transformer<T1, R>(
    inputs: [ReactiveFn<T1>],
    execute: (...args: [T1]) => R
): ReactiveFn<R>;
export function transformer<T1, T2, R>(
    inputs: [ReactiveFn<T1>, ReactiveFn<T2>],
    execute: (...args: [T1, T2]) => R
): ReactiveFn<R>;
export function transformer<T1, T2, T3, R>(
    inputs: [ReactiveFn<T1>, ReactiveFn<T2>, ReactiveFn<T3>],
    execute: (...args: [T1, T2, T3]) => R
): ReactiveFn<R>;
export function transformer<T1, T2, T3, T4, R>(
    inputs: [ReactiveFn<T1>, ReactiveFn<T2>, ReactiveFn<T3>, ReactiveFn<T4>],
    execute: (...args: [T1, T2, T3, T4]) => R
): ReactiveFn<R>;
export function transformer<T1, T2, T3, T4, T5, R>(
    inputs: [ReactiveFn<T1>, ReactiveFn<T2>, ReactiveFn<T3>, ReactiveFn<T4>, ReactiveFn<T5>],
    execute: (...args: [T1, T2, T3, T4, T5]) => R
): ReactiveFn<R>;
export function transformer<T1, T2, T3, T4, T5, T6, R>(
    inputs: [ReactiveFn<T1>, ReactiveFn<T2>, ReactiveFn<T3>, ReactiveFn<T4>, ReactiveFn<T5>, ReactiveFn<T6>],
    execute: (...args: [T1, T2, T3, T4, T5, T6]) => R
): ReactiveFn<R>;
export function transformer<T1, T2, T3, T4, T5, T6, T7, R>(
    inputs: [ReactiveFn<T1>, ReactiveFn<T2>, ReactiveFn<T3>, ReactiveFn<T4>, ReactiveFn<T5>, ReactiveFn<T6>, ReactiveFn<T7>],
    execute: (...args: [T1, T2, T3, T4, T5, T6, T7]) => R
): ReactiveFn<R>;
export function transformer<T1, T2, T3, T4, T5, T6, T7, T8, R>(
    inputs: [ReactiveFn<T1>, ReactiveFn<T2>, ReactiveFn<T3>, ReactiveFn<T4>, ReactiveFn<T5>, ReactiveFn<T6>, ReactiveFn<T7>, ReactiveFn<T8>],
    execute: (...args: [T1, T2, T3, T4, T5, T6, T7, T8]) => R
): ReactiveFn<R>;
export function transformer<T1, T2, T3, T4, T5, T6, T7, T8, T9, R>(
    inputs: [ReactiveFn<T1>, ReactiveFn<T2>, ReactiveFn<T3>, ReactiveFn<T4>, ReactiveFn<T5>, ReactiveFn<T6>, ReactiveFn<T7>, ReactiveFn<T8>, ReactiveFn<T9>],
    execute: (...args: [T1, T2, T3, T4, T5, T6, T7, T8, T9]) => R
): ReactiveFn<R>;
export function transformer<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, R>(
    inputs: [ReactiveFn<T1>, ReactiveFn<T2>, ReactiveFn<T3>, ReactiveFn<T4>, ReactiveFn<T5>, ReactiveFn<T6>, ReactiveFn<T7>, ReactiveFn<T8>, ReactiveFn<T9>, ReactiveFn<T10>],
    execute: (...args: [T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]) => R
): ReactiveFn<R>;
export function transformer<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, R>(
    inputs: [ReactiveFn<T1>, ReactiveFn<T2>, ReactiveFn<T3>, ReactiveFn<T4>, ReactiveFn<T5>, ReactiveFn<T6>, ReactiveFn<T7>, ReactiveFn<T8>, ReactiveFn<T9>, ReactiveFn<T10>, ReactiveFn<T11>],
    execute: (...args: [T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11]) => R
): ReactiveFn<R>;
export function transformer<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, R>(
    inputs: [ReactiveFn<T1>, ReactiveFn<T2>, ReactiveFn<T3>, ReactiveFn<T4>, ReactiveFn<T5>, ReactiveFn<T6>, ReactiveFn<T7>, ReactiveFn<T8>, ReactiveFn<T9>, ReactiveFn<T10>, ReactiveFn<T11>, ReactiveFn<T12>],
    execute: (...args: [T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12]) => R
): ReactiveFn<R>;
export function transformer<R>(inputs: ReactiveFn<any>[], execute: (...args: any[]) => R): ReactiveFn<R> {
    let lastArgs = inputs.map(i => i());
    let latest: R = execute(...lastArgs);
    
    const fn: ReactiveFn<R> = () => {
        const args = inputs.map(d => d());
        for (let i = 0; i < args.length; i++) {
            if (!shallowEqual(lastArgs[i], args[i])) {
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
    fn.deregisterConsumer = (consumer: () => void) => {
        inputs.forEach(input => input.deregisterConsumer(consumer));
    }
    
    return fn;
}

export function consumer<T1>(
    inputs: [ReactiveFn<T1>],
    execute: (...args: [T1]) => void
): ReactiveConsumer;
export function consumer<T1, T2>(
    inputs: [ReactiveFn<T1>, ReactiveFn<T2>],
    execute: (...args: [T1, T2]) => void
): ReactiveConsumer;
export function consumer<T1, T2, T3>(
    inputs: [ReactiveFn<T1>, ReactiveFn<T2>, ReactiveFn<T3>],
    execute: (...args: [T1, T2, T3]) => void
): ReactiveConsumer;
export function consumer<T1, T2, T3, T4>(
    inputs: [ReactiveFn<T1>, ReactiveFn<T2>, ReactiveFn<T3>, ReactiveFn<T4>],
    execute: (...args: [T1, T2, T3, T4]) => void
): ReactiveConsumer;
export function consumer<T1, T2, T3, T4, T5>(
    inputs: [ReactiveFn<T1>, ReactiveFn<T2>, ReactiveFn<T3>, ReactiveFn<T4>, ReactiveFn<T5>],
    execute: (...args: [T1, T2, T3, T4, T5]) => void
): ReactiveConsumer;
export function consumer<T1, T2, T3, T4, T5, T6>(
    inputs: [ReactiveFn<T1>, ReactiveFn<T2>, ReactiveFn<T3>, ReactiveFn<T4>, ReactiveFn<T5>, ReactiveFn<T6>],
    execute: (...args: [T1, T2, T3, T4, T5, T6]) => void
): ReactiveConsumer;
export function consumer<T1, T2, T3, T4, T5, T6, T7>(
    inputs: [ReactiveFn<T1>, ReactiveFn<T2>, ReactiveFn<T3>, ReactiveFn<T4>, ReactiveFn<T5>, ReactiveFn<T6>, ReactiveFn<T7>],
    execute: (...args: [T1, T2, T3, T4, T5, T6, T7]) => void
): ReactiveConsumer;
export function consumer<T1, T2, T3, T4, T5, T6, T7, T8>(
    inputs: [ReactiveFn<T1>, ReactiveFn<T2>, ReactiveFn<T3>, ReactiveFn<T4>, ReactiveFn<T5>, ReactiveFn<T6>, ReactiveFn<T7>, ReactiveFn<T8>],
    execute: (...args: [T1, T2, T3, T4, T5, T6, T7, T8]) => void
): ReactiveConsumer;
export function consumer<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
    inputs: [ReactiveFn<T1>, ReactiveFn<T2>, ReactiveFn<T3>, ReactiveFn<T4>, ReactiveFn<T5>, ReactiveFn<T6>, ReactiveFn<T7>, ReactiveFn<T8>, ReactiveFn<T9>],
    execute: (...args: [T1, T2, T3, T4, T5, T6, T7, T8, T9]) => void
): ReactiveConsumer;
export function consumer<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
    inputs: [ReactiveFn<T1>, ReactiveFn<T2>, ReactiveFn<T3>, ReactiveFn<T4>, ReactiveFn<T5>, ReactiveFn<T6>, ReactiveFn<T7>, ReactiveFn<T8>, ReactiveFn<T9>, ReactiveFn<T10>],
    execute: (...args: [T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]) => void
): ReactiveConsumer;
export function consumer<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11>(
    inputs: [ReactiveFn<T1>, ReactiveFn<T2>, ReactiveFn<T3>, ReactiveFn<T4>, ReactiveFn<T5>, ReactiveFn<T6>, ReactiveFn<T7>, ReactiveFn<T8>, ReactiveFn<T9>, ReactiveFn<T10>, ReactiveFn<T11>],
    execute: (...args: [T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11]) => void
): ReactiveConsumer;
export function consumer<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12>(
    inputs: [ReactiveFn<T1>, ReactiveFn<T2>, ReactiveFn<T3>, ReactiveFn<T4>, ReactiveFn<T5>, ReactiveFn<T6>, ReactiveFn<T7>, ReactiveFn<T8>, ReactiveFn<T9>, ReactiveFn<T10>, ReactiveFn<T11>, ReactiveFn<T12>],
    execute: (...args: [T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12]) => void
): ReactiveConsumer;
export function consumer(inputs: ReactiveFn<any>[], execute: (...args: any[]) => void): ReactiveConsumer {
    let lastArgs = inputs.map(i => i());
    const fn = (force: boolean = false) => {
        const args = inputs.map(i => i());
        if (force) {
            execute(...args);
            lastArgs = args;
        } else {
            for (let i = 0; i < args.length; i++) {
                if (!shallowEqual(lastArgs[i], args[i])) {
                    execute(...args);
                    lastArgs = args;
                    break;
                }
            }
        }
    };
    inputs.forEach(d => d.registerConsumer(fn));
    const result: ReactiveConsumer = () => { fn(true); };
    result.deregister = () => {
        inputs.forEach(i => {
            i.deregisterConsumer(fn);
        });
    }
    return result;
}

export function batch(execute: () => void) {
    if (batchedConsumers === null) {
        batchedConsumers = new Set();
        try {
            execute();
            for (const c of batchedConsumers) {
                c();
            }
        } finally {
            batchedConsumers = null;
        }
    } else {
        execute();
    }
}