import { consumer, activeSource, transformer, batch } from './index';

describe('a consumer with a simple source', () => {
    it('does not invoke automatically', () => {
        const spy = jest.fn();
        const source = activeSource(1);
        consumer([source], spy)

        expect(spy).not.toHaveBeenCalled();
    });

    it('can be invoked manually', () => {
        const spy = jest.fn();
        const source = activeSource(1);
        const cons = consumer([source], spy)

        cons();

        expect(spy).toHaveBeenCalled();
    });

    it('can be invoked manually multiple times', () => {
        const spy = jest.fn();
        const source = activeSource(1);
        const cons = consumer([source], spy)

        cons();
        cons();

        expect(spy).toHaveBeenCalledTimes(2);
    });

    it('is invoked with the new value when it\'s source changes', () => {
        const spy = jest.fn();
        const source = activeSource(1);
        consumer([source], spy)

        source(2);

        expect(spy).toHaveBeenCalledWith(2);
    });

    it('is not invoked when the source is set to the same value', () => {
        const spy = jest.fn();
        const source = activeSource(1);
        consumer([source], spy)

        source(1);

        expect(spy).not.toHaveBeenCalled();
    })
});

describe('a consumer with two simple sources', () => {
    it('is invoked when either source changes', () => {
        const spy = jest.fn();
        const s1 = activeSource('one');
        const s2 = activeSource('alpha');
        consumer([s1, s2], spy);

        s1('two');
        expect(spy).toHaveBeenCalledWith('two', 'alpha');

        s2('beta');
        expect(spy).toHaveBeenCalledWith('two', 'beta');
    });
});

describe('a consumer with a transformer input', () => {
    it('is invoked when the source & transformed values change', () => {
        const spy = jest.fn();
        const s = activeSource(1);
        const t = transformer([s], x => x * 2);
        consumer([t], spy);

        s(2);

        expect(spy).toHaveBeenCalledWith(4);
    });

    it('is not invoked when the updated source is transformed into the same value as before', () => {
        const spy = jest.fn();
        const s = activeSource(1);
        const t = transformer([s], x => x % 3 === 0);
        consumer([t], spy);

        s(2);

        expect(spy).not.toHaveBeenCalled();
    });
});

describe('a consumer with multiple inputs from the same source', () => {
    it('is only invoked once when the source changes once', () => {
        const spy = jest.fn();
        const s = activeSource(1);
        const t1 = transformer([s], x => x * 3);
        const t2 = transformer([s], x => x * 5);
        consumer([s, t1, t2], spy);

        s(2);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(2, 6, 10);
    });
});

describe('multiple consumers derived from the same source', () => {
    it('are all updated once when the source changes once', () => {
        const spy1 = jest.fn();
        const spy2 = jest.fn();
        const s = activeSource(1);
        consumer([s], spy1);
        consumer([s], spy2);

        s(2);

        expect(spy1).toHaveBeenCalledTimes(1);
        expect(spy1).toHaveBeenCalledWith(2);
        expect(spy2).toHaveBeenCalledTimes(1);
        expect(spy2).toHaveBeenCalledWith(2);
    });
});

describe('batched updates', () => {
    it('only updates a consumer once even if multiple of its sources change', () => {
        const spy = jest.fn();
        const s1 = activeSource(1);
        const s2 = activeSource('a');
        const t = transformer([s1], x => x * 2);
        consumer([s1, s2, t], spy);

        batch(() => {
            s1(2);
            s2('b');
        });

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(2, 'b', 4);
    });

    it('can be nested', () => {
        const spy = jest.fn();
        const s1 = activeSource(1);
        const s2 = activeSource('a');
        const t = transformer([s1], x => x * 2);
        consumer([s1, s2, t], spy);

        batch(() => {
            s1(2);
            batch(() => {
                s2('b');
            });
        });

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(2, 'b', 4);
    });
});