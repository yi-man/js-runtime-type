# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A browser-side runtime data validation library similar to Pydantic but for JavaScript. Uses function-style API (createType, createSchema) supporting primitive types, validation rules, transforms, async validation, and nested schemas.

## Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run a specific test file
npx vitest run tests/validate.test.js
```

## Architecture

The library has a modular design with separate concerns:

- **src/types/** - Type system: `createType` factory + primitive/compound/special types
- **src/schema.js** - Schema builder with `validate()` and `validateAsync()` methods
- **src/validate.js** - Core validation engine with rule execution
- **src/transform.js** - Data transformation (default, transform, lowercase, etc.)
- **src/index.js** - Main entry point exporting all public APIs

### Key Type Properties

Types use internal properties prefixed with `_`:
- `_type` - Type name (string, number, etc.)
- `_rules` - Validation rules object
- `_validate` - Base validation function
- `_optional` - Optional field flag
- `_fields` - Schema field definitions (for nested schemas)

### API Reference

```js
import { createType, createSchema, string, number, array, union, literal, enumType } from './src/index.js';

// Create schema
const User = createSchema({
  name: string({ minLength: 1, maxLength: 100, transform: v => v.trim() }),
  age: number({ min: 0, max: 150 }).optional(),
  email: string({ pattern: /@/ }),
  tags: array(string()).optional(),
  status: union([literal('active'), literal('inactive')]).optional()
});

// Validate
const result = User.validate({ name: 'John', email: 'john@example.com' });
// { success: true, data: {...} } or { success: false, errors: [...] }
```