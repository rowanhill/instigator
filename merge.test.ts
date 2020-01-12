import { activeSource, mergeTransformer, ReactiveFn, transformer } from './index';

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

    it('can pass a custom equality check', () => {
        // The source has a reference equality check, to ensure it's internal cache updates
        const source = activeSource(() => true as boolean, (a, b) => a === b);
        // The transformer also has a reference equality check, for the same reason
        const transf = mergeTransformer({ bool: source }, (a, b) => a === b);
        
        // Update the source to be a function returning false. The default shallow equality
        // would treat the two functions as equal, but the reference equality checks will
        // treat it as different
        source(() => false);

        // The transformer should have updated the `bool` prop
        expect(transf().bool()).toBeFalsy();
    });
});
