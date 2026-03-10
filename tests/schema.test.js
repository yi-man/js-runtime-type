import { describe, it, expect } from 'vitest';
import { createSchema, string, number } from '../src/index.js';

describe('createSchema', () => {
  it('should validate simple object', () => {
    const User = createSchema({
      name: string(),
      age: number({ min: 0 })
    });

    const result = User.validate({ name: 'John', age: 25 });
    expect(result.success).toBe(true);
    expect(result.data.name).toBe('John');
  });

  it('should fail on missing required field', () => {
    const User = createSchema({
      name: string(),
      age: number({ min: 0 })
    });

    const result = User.validate({ age: 25 });
    expect(result.success).toBe(false);
    expect(result.errors[0].path).toBe('name');
  });

  it('should fail on invalid field', () => {
    const User = createSchema({
      name: string(),
      age: number({ min: 0 })
    });

    const result = User.validate({ name: 'John', age: -1 });
    expect(result.success).toBe(false);
  });
});