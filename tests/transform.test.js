import { describe, it, expect } from 'vitest';
import { createSchema, string, number } from '../src/index.js';

describe('Transform', () => {
  it('should apply default value', () => {
    const User = createSchema({
      name: string({ default: 'Anonymous' })
    });

    const result = User.validate({});
    expect(result.success).toBe(true);
    expect(result.data.name).toBe('Anonymous');
  });

  it('should apply transform function', () => {
    const User = createSchema({
      name: string({ transform: (v) => v.trim() })
    });

    const result = User.validate({ name: '  John  ' });
    expect(result.success).toBe(true);
    expect(result.data.name).toBe('John');
  });

  it('should apply lowercase', () => {
    const User = createSchema({
      name: string({ lowercase: true })
    });

    const result = User.validate({ name: 'JOHN' });
    expect(result.success).toBe(true);
    expect(result.data.name).toBe('john');
  });
});