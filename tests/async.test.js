import { describe, it, expect } from 'vitest';
import { createSchema, string } from '../src/index.js';

describe('Async Validation', () => {
  it('should support async custom validator', async () => {
    const UniqueName = string({
      validate: async (val) => {
        // Simulate async check
        await new Promise(r => setTimeout(r, 10));
        return !['taken', 'admin'].includes(val);
      }
    });

    const User = createSchema({
      name: UniqueName
    });

    const result = await User.validateAsync({ name: 'validuser' });
    expect(result.success).toBe(true);

    const result2 = await User.validateAsync({ name: 'taken' });
    expect(result2.success).toBe(false);
  });
});