import { describe, it, expect } from 'vitest';
import { string, number, union, literal, enumType } from '../src/index.js';
import { validate } from '../src/validate.js';

describe('Special Types', () => {
  it('should validate literal type', () => {
    const Status = literal('active');
    const result = validate(Status, 'active');
    expect(result.success).toBe(true);

    const result2 = validate(Status, 'inactive');
    expect(result2.success).toBe(false);
  });

  it('should validate enum', () => {
    const Color = enumType(['red', 'green', 'blue']);
    const result = validate(Color, 'red');
    expect(result.success).toBe(true);

    const result2 = validate(Color, 'yellow');
    expect(result2.success).toBe(false);
  });

  it('should validate union', () => {
    const StringOrNumber = union([string(), number()]);
    const result1 = validate(StringOrNumber, 'hello');
    expect(result1.success).toBe(true);
    const result2 = validate(StringOrNumber, 123);
    expect(result2.success).toBe(true);
    const result3 = validate(StringOrNumber, true);
    expect(result3.success).toBe(false);
  });
});