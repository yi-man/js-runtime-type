import { describe, it, expect } from 'vitest';

describe('Project Setup', () => {
  it('should export basic functions', async () => {
    const mod = await import('../src/index.js');
    expect(mod.createType).toBeDefined();
    expect(mod.createSchema).toBeDefined();
  });
});