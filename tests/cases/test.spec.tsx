import { describe, it, test, expect } from 'vitest';

describe('Test', () => {
    it('Should work', () => {
        expect(1 + 41).toBe(42);
    });
});

test("Should work with tsx/jsx", () => {
    const React = {
        createElement() {
            return {}
        }
    };

    expect(<></>).toBeTruthy();
})
