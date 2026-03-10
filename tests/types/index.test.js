import { describe, it, expect } from 'vitest';
import { createType, string, number, boolean } from '../../src/types/index.js';

describe('createType', () => {
  it('should create a basic type', () => {
    const MyString = createType('string', {
      validate: (val) => typeof val === 'string'
    });
    expect(typeof MyString).toBe('function');
  });

  it('should export primitive type creators', () => {
    expect(typeof string).toBe('function');
    expect(typeof number).toBe('function');
    expect(typeof boolean).toBe('function');
  });
});