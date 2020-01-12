import { activeSource, mergeTransformer, ReactiveFn } from './index';

describe('mergeTransformer', () => {
    it('creates a transformer from an object of reactive inputs', () => {
        const appleType = activeSource('Granny Smith');
        const ripeness = activeSource(2);

        const result = mergeTransformer({ appleType, ripeness });

        expect(result()).toEqual({ appleType: 'Granny Smith', ripeness: 2 });
    });

    it('maps property types', () => {
        const appleType = activeSource('Granny Smith');
        const ripeness = activeSource(2);

        const result = mergeTransformer({ appleType, ripeness });

        // The following line should compile
        const typed: ReactiveFn<{ appleType: string; ripeness: number }> = result;
    });
});
