import { describe, it, expect } from 'vitest';
import { createSchema, string, number, array } from '../src/index.js';
import { validate } from '../src/validate.js';

describe('Compound Types', () => {
  it('should validate array of strings', () => {
    const Tags = array(string());

    const result = validate(Tags, ['a', 'b', 'c']);
    expect(result.success).toBe(true);

    const result2 = validate(Tags, ['a', 1, 'c']);
    expect(result2.success).toBe(false);
  });

  it('should validate nested object in array', () => {
    const Users = array(createSchema({
      name: string()
    }));

    const result = Users.validate([{ name: 'John' }, { name: 'Jane' }]);
    expect(result.success).toBe(true);
  });
});