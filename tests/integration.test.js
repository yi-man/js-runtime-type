// tests/integration.test.js
import { describe, it, expect } from 'vitest';
import { createSchema, string, number, array, union, literal } from '../src/index.js';

describe('Integration', () => {
  it('should handle complex nested schema', () => {
    const Address = createSchema({
      city: string({ minLength: 1 }),
      zip: string({ pattern: /^\d{5}$/ })
    });

    const User = createSchema({
      name: string({ minLength: 1, maxLength: 100, transform: v => v.trim() }),
      email: string({ pattern: /@/ }),
      age: number({ min: 0, max: 150 }).optional(),
      tags: array(string()).optional(),
      status: union([literal('active'), literal('inactive')]).optional(),
      address: Address
    });

    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      tags: ['developer', 'admin'],
      status: 'active',
      address: {
        city: 'NYC',
        zip: '10001'
      }
    };

    const result = User.validate(validData);
    expect(result.success).toBe(true);
    expect(result.data.name).toBe('John Doe');
  });

  it('should collect all errors', () => {
    const User = createSchema({
      name: string({ minLength: 2 }),
      email: string({ pattern: /@/ }),
      age: number({ min: 0 })
    });

    const result = User.validate({
      name: 'J',  // too short
      email: 'invalid',  // no @
      age: -5  // negative
    });

    expect(result.success).toBe(false);
    expect(result.errors.length).toBe(3);
  });
});