# JS Runtime Type Validation Library Design

## Project Overview
- **Project Name**: js-runtime-type
- **Type**: Browser-side runtime data validation library
- **Core Functionality**: Runtime type validation with schema definition, similar to Pydantic but for JavaScript
- **Target Users**: Frontend developers needing runtime data validation

## Design Decision: Progressive API (Option A)

```js
// 创建基础类型
const string = createType('string', {
  validate: (val) => typeof val === 'string'
});
const number = createType('number', {
  validate: (val) => typeof val === 'number'
});

// 创建带规则的类型
const age = number({ min: 0, max: 150 });
const email = string({ pattern: /^.+$/ });

// 创建 Schema
const User = createSchema({
  name: string(),
  email: email,
  age: age.optional(),  // 可选
  address: Address      // 嵌套自定义类型
});

// 验证
const result = User.validate(data);
if (!result.success) {
  console.log(result.errors);  // 详细错误
}
```

## Core Features

### 1. Type System
- **Primitive Types**: string, number, boolean, date
- **Compound Types**: array, object, tuple
- **Special Types**: union, enum, literal

### 2. Validation Rules
- **Common**: required, optional
- **String**: minLength, maxLength, pattern (regex)
- **Number**: min, max, integer
- **Custom**: custom validator function

### 3. Transform Capabilities
- trim, lowercase, uppercase
- default value
- coerce (type conversion)

### 4. Async Validation
- Support async validator functions
- Useful for database lookups (e.g., username existence check)

### 5. Custom Type Nesting
- Create reusable schemas
- Nest custom types directly in parent schema

### 6. Error Handling
- Return result object: `{ success: boolean, data?: T, errors: Error[] }`
- Detailed error messages with path, expected type, actual value

## Performance Considerations
- Moderate optimization focus
- Keep bundle size reasonable for browser use
- Use lazy validation where possible

## API Reference (Draft)

```js
// Type creators
const string = createType('string', { validate: fn });
const number = createType('number', { validate: fn });
const boolean = createType('boolean', { validate: fn });
const date = createType('date', { validate: fn });

// With rules
string({ minLength: 1, maxLength: 100, pattern: /regex/ });
number({ min: 0, max: 100, integer: true });

// Optional
string().optional();

// Array
array(string());
array(UserSchema);

// Object/Schema
const User = createSchema({
  name: string(),
  email: string({ pattern: /.../ }),
  age: number({ min: 0 }).optional()
});

// Nested
const Address = createSchema({ city: string(), zip: string() });
const User = createSchema({
  name: string(),
  address: Address  // Direct nesting
});

// Transform
string({ transform: (v) => v.trim() });
string({ default: 'anonymous' });

// Async validation
const uniqueName = string({ validate: async (val) => !await checkDb(val) });

// Validate
const result = User.validate(data);
// result: { success: true, data: {...} } or { success: false, errors: [...] }

// Async validate
const result = await User.validateAsync(data);
```

## Error Format

```js
{
  path: 'user.address.city',
  message: 'Expected string, got number',
  expected: 'string',
  actual: 123
}
```

## File Structure (Proposed)

```
src/
├── index.js          # Main exports
├── types/
│   ├── index.js      # Type factory
│   ├── primitives.js # string, number, boolean, date
│   ├── compound.js   # array, object, tuple
│   └── special.js    # union, enum, literal
├── schema.js         # Schema creator
├── validate.js       # Validation logic
├── transform.js      # Transform logic
├── errors.js         # Error formatting
└── utils.js          # Helper functions
```

## Next Steps

1. Implement core type system
2. Add validation rules
3. Implement transform capability
4. Add async validation support
5. Implement schema nesting
6. Add comprehensive error handling
7. Write tests