# JS Runtime Type Validation Library Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a browser-side runtime data validation library with function-style API (createType, createSchema) supporting primitive types, validation rules, transforms, async validation, and nested schemas.

**Architecture:** Modular architecture with separate modules for types, schema, validation, transform, and errors. Uses function composition for fluent API.

**Tech Stack:** JavaScript (ES Modules), Vitest for testing

---

### Task 1: Project Setup

**Files:**
- Create: `package.json`
- Create: `src/index.js`
- Create: `tests/setup.js`

**Step 1: Write the failing test**

```js
// tests/setup.test.js
import { describe, it, expect } from 'vitest';

describe('Project Setup', () => {
  it('should export basic functions', async () => {
    const mod = await import('../src/index.js');
    expect(mod.createType).toBeDefined();
    expect(mod.createSchema).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/setup.test.js`
Expected: FAIL - module not found

**Step 3: Write minimal implementation**

```js
// package.json
{
  "name": "js-runtime-type",
  "version": "0.0.1",
  "type": "module",
  "main": "src/index.js",
  "scripts": {
    "test": "vitest"
  }
}
```

```js
// src/index.js
export const createType = () => {};
export const createSchema = () => {};
```

```js
// tests/setup.js
// Vitest setup file
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/setup.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git init
git add package.json src/index.js tests/setup.js
git commit -m "chore: project setup with basic exports"
```

---

### Task 2: Core Type Factory (createType)

**Files:**
- Create: `src/types/index.js`
- Modify: `src/index.js`
- Test: `tests/types/index.test.js`

**Step 1: Write the failing test**

```js
// tests/types/index.test.js
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
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/types/index.test.js`
Expected: FAIL - cannot find module

**Step 3: Write minimal implementation**

```js
// src/types/index.js

/**
 * Creates a new type with custom validation
 * @param {string} name - Type name for error messages
 * @param {Object} options
 * @param {Function} options.validate - Validation function
 * @returns {Function} Type function
 */
export function createType(name, { validate }) {
  return function typeFunction(rules = {}) {
    return {
      _type: name,
      _rules: rules,
      _validate: validate,
      optional: () => ({ ...typeFunction(rules), _optional: true })
    };
  };
}

// Primitive type creators
export const string = createType('string', {
  validate: (val) => typeof val === 'string'
});

export const number = createType('number', {
  validate: (val) => typeof val === 'number' && !isNaN(val)
});

export const boolean = createType('boolean', {
  validate: (val) => typeof val === 'boolean'
});

export const date = createType('date', {
  validate: (val) => val instanceof Date
});
```

```js
// src/index.js
export * from './types/index.js';
export { createSchema } from './schema.js';
```

```js
// src/schema.js
export function createSchema(fields) {
  return {
    _fields: fields,
    validate(data) {
      return { success: true, data };
    }
  };
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/types/index.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/types/index.js src/index.js src/schema.js tests/types/index.test.js
git commit -m "feat: add createType and primitive types"
```

---

### Task 3: Validation Rules Engine

**Files:**
- Modify: `src/types/index.js`
- Create: `src/validate.js`
- Test: `tests/validate.test.js`

**Step 1: Write the failing test**

```js
// tests/validate.test.js
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
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/validate.test.js`
Expected: FAIL - validate not exported

**Step 3: Write minimal implementation**

```js
// src/validate.js

export function validate(type, value, path = '') {
  const errors = [];

  // Check optional
  if (type._optional && (value === undefined || value === null)) {
    return { success: true, data: value };
  }

  // Check required
  if (value === undefined || value === null) {
    return {
      success: false,
      errors: [{ path, message: 'Required field', expected: type._type, actual: value }]
    };
  }

  // Run base validation
  if (!type._validate(value)) {
    errors.push({
      path,
      message: `Expected ${type._type}, got ${typeof value}`,
      expected: type._type,
      actual: typeof value
    });
    return { success: false, errors };
  }

  // Run rule validations
  const ruleErrors = runRules(type, value, path);
  errors.push(...ruleErrors);

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: value };
}

function runRules(type, value, path) {
  const errors = [];
  const rules = type._rules || {};

  // String rules
  if (type._type === 'string') {
    if (rules.minLength !== undefined && value.length < rules.minLength) {
      errors.push({
        path,
        message: `String must be at least ${rules.minLength} characters`,
        expected: `minLength: ${rules.minLength}`,
        actual: value.length
      });
    }
    if (rules.maxLength !== undefined && value.length > rules.maxLength) {
      errors.push({
        path,
        message: `String must be at most ${rules.maxLength} characters`,
        expected: `maxLength: ${rules.maxLength}`,
        actual: value.length
      });
    }
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push({
        path,
        message: `String does not match pattern`,
        expected: rules.pattern.toString(),
        actual: value
      });
    }
  }

  // Number rules
  if (type._type === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      errors.push({
        path,
        message: `Number must be at least ${rules.min}`,
        expected: `min: ${rules.min}`,
        actual: value
      });
    }
    if (rules.max !== undefined && value > rules.max) {
      errors.push({
        path,
        message: `Number must be at most ${rules.max}`,
        expected: `max: ${rules.max}`,
        actual: value
      });
    }
    if (rules.integer && !Number.isInteger(value)) {
      errors.push({
        path,
        message: `Number must be an integer`,
        expected: 'integer',
        actual: value
      });
    }
  }

  return errors;
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/validate.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/validate.js tests/validate.test.js
git commit -m "feat: add validation rules engine"
```

---

### Task 4: Schema Validation

**Files:**
- Modify: `src/schema.js`
- Test: `tests/schema.test.js`

**Step 1: Write the failing test**

```js
// tests/schema.test.js
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
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/schema.test.js`
Expected: FAIL - validate not integrated

**Step 3: Write minimal implementation**

```js
// src/schema.js
import { validate } from './validate.js';

export function createSchema(fields) {
  const schema = {
    _fields: fields,

    validate(data) {
      const allErrors = [];
      let resultData = {};

      // Handle case where data is not an object
      if (typeof data !== 'object' || data === null) {
        return {
          success: false,
          errors: [{ path: '', message: 'Expected object', expected: 'object', actual: typeof data }]
        };
      }

      // Validate each field
      for (const [key, type] of Object.entries(fields)) {
        const value = data[key];
        const result = validate(type, value, key);

        if (result.success) {
          resultData[key] = result.data;
        } else {
          allErrors.push(...result.errors);
        }
      }

      if (allErrors.length > 0) {
        return { success: false, errors: allErrors };
      }

      return { success: true, data: resultData };
    },

    // Async validation
    async validateAsync(data) {
      const allErrors = [];
      let resultData = {};

      if (typeof data !== 'object' || data === null) {
        return {
          success: false,
          errors: [{ path: '', message: 'Expected object', expected: 'object', actual: typeof data }]
        };
      }

      for (const [key, type] of Object.entries(fields)) {
        const value = data[key];

        // Check if validator is async
        if (type._validate && type._validate.constructor.name === 'AsyncFunction') {
          try {
            const isValid = await type._validate(value);
            if (!isValid) {
              allErrors.push({
                path: key,
                message: 'Custom validation failed',
                expected: type._type,
                actual: value
              });
            } else {
              resultData[key] = value;
            }
          } catch (e) {
            allErrors.push({
              path: key,
              message: e.message,
              expected: type._type,
              actual: value
            });
          }
        } else {
          const result = validate(type, value, key);
          if (result.success) {
            resultData[key] = result.data;
          } else {
            allErrors.push(...result.errors);
          }
        }
      }

      if (allErrors.length > 0) {
        return { success: false, errors: allErrors };
      }

      return { success: true, data: resultData };
    }
  };

  return schema;
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/schema.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/schema.js tests/schema.test.js
git commit -m "feat: add schema validation"
```

---

### Task 5: Transform Capabilities

**Files:**
- Create: `src/transform.js`
- Modify: `src/schema.js`
- Test: `tests/transform.test.js`

**Step 1: Write the failing test**

```js
// tests/transform.test.js
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
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/transform.test.js`
Expected: FAIL - transform not implemented

**Step 3: Write minimal implementation**

```js
// src/transform.js

export function applyTransform(type, value) {
  if (value === undefined || value === null) {
    // Apply default if available
    if (type._rules?.default !== undefined) {
      return type._rules.default;
    }
    return value;
  }

  let result = value;
  const rules = type._rules || {};

  // String transforms
  if (type._type === 'string') {
    if (rules.transform) {
      result = rules.transform(result);
    }
    if (rules.lowercase) {
      result = result.toLowerCase();
    }
    if (rules.uppercase) {
      result = result.toUpperCase();
    }
    if (rules.trim !== false) {
      result = result.trim();
    }
  }

  // Number coerce
  if (type._type === 'number' && rules.coerce) {
    result = Number(result);
  }

  return result;
}
```

```js
// src/schema.js - update validate method to apply transforms
import { validate } from './validate.js';
import { applyTransform } from './transform.js';

export function createSchema(fields) {
  const schema = {
    _fields: fields,

    validate(data) {
      const allErrors = [];
      let resultData = {};

      if (typeof data !== 'object' || data === null) {
        return {
          success: false,
          errors: [{ path: '', message: 'Expected object', expected: 'object', actual: typeof data }]
        };
      }

      for (const [key, type] of Object.entries(fields)) {
        let value = data[key];

        // Apply transform first
        value = applyTransform(type, value);

        const result = validate(type, value, key);

        if (result.success) {
          resultData[key] = result.data;
        } else {
          allErrors.push(...result.errors);
        }
      }

      if (allErrors.length > 0) {
        return { success: false, errors: allErrors };
      }

      return { success: true, data: resultData };
    },

    async validateAsync(data) {
      // Similar updates for async...
      // (same as before but with transforms)
      const allErrors = [];
      let resultData = {};

      if (typeof data !== 'object' || data === null) {
        return {
          success: false,
          errors: [{ path: '', message: 'Expected object', expected: 'object', actual: typeof data }]
        };
      }

      for (const [key, type] of Object.entries(fields)) {
        let value = data[key];

        // Apply transform first
        value = applyTransform(type, value);

        if (type._validate && type._validate.constructor.name === 'AsyncFunction') {
          try {
            const isValid = await type._validate(value);
            if (!isValid) {
              allErrors.push({
                path: key,
                message: 'Custom validation failed',
                expected: type._type,
                actual: value
              });
            } else {
              resultData[key] = value;
            }
          } catch (e) {
            allErrors.push({
              path: key,
              message: e.message,
              expected: type._type,
              actual: value
            });
          }
        } else {
          const result = validate(type, value, key);
          if (result.success) {
            resultData[key] = result.data;
          } else {
            allErrors.push(...result.errors);
          }
        }
      }

      if (allErrors.length > 0) {
        return { success: false, errors: allErrors };
      }

      return { success: true, data: resultData };
    }
  };

  return schema;
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/transform.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/transform.js src/schema.js tests/transform.test.js
git commit -m "feat: add transform capabilities"
```

---

### Task 6: Array and Compound Types

**Files:**
- Create: `src/types/compound.js`
- Modify: `src/validate.js`
- Test: `tests/compound.test.js`

**Step 1: Write the failing test**

```js
// tests/compound.test.js
import { describe, it, expect } from 'vitest';
import { createSchema, string, number, array } from '../src/index.js';

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
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/compound.test.js`
Expected: FAIL - array not exported

**Step 3: Write minimal implementation**

```js
// src/types/compound.js
import { createType } from './index.js';

export const array = createType('array', {
  validate: (val) => Array.isArray(val)
});

export const object = createType('object', {
  validate: (val) => typeof val === 'object' && val !== null && !Array.isArray(val)
});
```

```js
// src/types/index.js
export * from './compound.js';
```

```js
// src/validate.js - update to handle arrays
export function validate(type, value, path = '') {
  // ... existing code ...

  // Array validation
  if (type._type === 'array') {
    const itemType = type._rules?.items;
    if (!itemType) {
      return { success: true, data: value };
    }

    const errors = [];
    const resultArray = [];

    for (let i = 0; i < value.length; i++) {
      const itemPath = path ? `${path}[${i}]` : `[${i}]`;
      const itemResult = validate(itemType, value[i], itemPath);

      if (itemResult.success) {
        resultArray.push(itemResult.data);
      } else {
        errors.push(...itemResult.errors);
      }
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, data: resultArray };
  }

  // Object validation (for nested schemas)
  if (type._fields) {
    const allErrors = [];
    const resultData = {};

    for (const [key, fieldType] of Object.entries(type._fields)) {
      const fieldPath = path ? `${path}.${key}` : key;
      const fieldValue = value[key];
      const fieldResult = validate(fieldType, fieldValue, fieldPath);

      if (fieldResult.success) {
        resultData[key] = fieldResult.data;
      } else {
        allErrors.push(...fieldResult.errors);
      }
    }

    if (allErrors.length > 0) {
      return { success: false, errors: allErrors };
    }

    return { success: true, data: resultData };
  }

  // ... rest of existing code ...
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/compound.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/types/compound.js src/validate.js tests/compound.test.js
git commit -m "feat: add array and compound types"
```

---

### Task 7: Special Types (union, enum, literal)

**Files:**
- Create: `src/types/special.js`
- Modify: `src/types/index.js`
- Test: `tests/special.test.js`

**Step 1: Write the failing test**

```js
// tests/special.test.js
import { describe, it, expect } from 'vitest';
import { createSchema, string, number, union, literal, enumType } from '../src/index.js';

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
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/special.test.js`
Expected: FAIL

**Step 3: Write minimal implementation**

```js
// src/types/special.js
import { createType } from './index.js';

export const literal = (value) => createType('literal', {
  validate: (val) => val === value
})({ _literalValue: value });

export const enumType = (values) => createType('enum', {
  validate: (val) => values.includes(val)
})({ _enumValues: values });

export const union = (types) => createType('union', {
  validate: (val) => types.some(t => {
    try {
      return t._validate(val);
    } catch {
      return false;
    }
  }
)})({ _unionTypes: types });
```

```js
// src/types/index.js
export * from './special.js';
```

```js
// src/validate.js - update for special types
// Add after type checks:

// Literal validation
if (type._literalValue !== undefined) {
  if (value !== type._literalValue) {
    errors.push({
      path,
      message: `Expected ${type._literalValue}, got ${value}`,
      expected: type._literalValue,
      actual: value
    });
    return { success: false, errors };
  }
  return { success: true, data: value };
}

// Enum validation
if (type._enumValues !== undefined) {
  if (!type._enumValues.includes(value)) {
    errors.push({
      path,
      message: `Must be one of: ${type._enumValues.join(', ')}`,
      expected: type._enumValues,
      actual: value
    });
    return { success: false, errors };
  }
  return { success: true, data: value };
}

// Union validation
if (type._unionTypes !== undefined) {
  for (const t of type._unionTypes) {
    const result = validate(t, value, path);
    if (result.success) {
      return result;
    }
  }
  errors.push({
    path,
    message: `Must match one of ${type._unionTypes.length} types`,
    expected: 'union',
    actual: typeof value
  });
  return { success: false, errors };
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/special.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/types/special.js src/validate.js tests/special.test.js
git commit -m "feat: add special types (literal, enum, union)"
```

---

### Task 8: Async Validation

**Files:**
- Test: `tests/async.test.js`

**Step 1: Write the failing test**

```js
// tests/async.test.js
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
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/async.test.js`
Expected: FAIL (may need fix for async validation)

**Step 3: Verify existing async code works**

The async validation is already implemented in Task 4. Just verify tests pass.

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/async.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/async.test.js
git commit -m "test: add async validation tests"
```

---

### Task 9: Integration Test

**Files:**
- Test: `tests/integration.test.js`

**Step 1: Write the test**

```js
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
```

**Step 2: Run test to verify**

Run: `npx vitest run tests/integration.test.js`
Expected: PASS

**Step 3: Commit**

```bash
git add tests/integration.test.js
git commit -m "test: add integration tests"
```

---

### Task 10: Final Verification

**Step 1: Run all tests**

Run: `npx vitest run`
Expected: All tests pass

**Step 2: Verify exports**

Run node to verify API:
```js
import { createType, createSchema, string, number, boolean, date, array, union, literal, enumType } from './src/index.js';
console.log('All exports available');
```

**Step 3: Final commit**

```bash
git add .
git commit -m "feat: complete js-runtime-type library"
```

---

## Plan Complete

The implementation plan consists of 10 tasks following TDD methodology. Each task:
- Starts with a failing test
- Implements minimal code to pass
- Commits after verification

**Estimated time:** 10-15 tasks × ~5 min = ~50-75 min total

---