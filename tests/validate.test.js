import { describe, it, expect } from 'vitest';
import { string, number } from '../src/types/index.js';
import { validate } from '../src/validate.js';

describe('Validation Rules', () => {
  it('should validate string with minLength', () => {
    const MinName = string({ minLength: 2 });
    const result = validate(MinName, 'a');
    expect(result.success).toBe(false);
    expect(result.errors[0].message).toContain('minLength');
  });

  it('should validate number with min/max', () => {
    const Age = number({ min: 0, max: 150 });

    const result1 = validate(Age, -1);
    expect(result1.success).toBe(false);

    const result2 = validate(Age, 200);
    expect(result2.success).toBe(false);

    const result3 = validate(Age, 25);
    expect(result3.success).toBe(true);
  });

  it('should validate pattern', () => {
    const Email = string({ pattern: /@/ });
    const result = validate(Email, 'invalid');
    expect(result.success).toBe(false);
  });
});