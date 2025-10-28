import { describe, it, expect } from 'vitest';

describe('sanity', () => {
  it('simple assert pass', () => {
    expect(1 + 1).toBe(2);
  });
});
