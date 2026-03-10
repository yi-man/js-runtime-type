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

export * from './compound.js';
export * from './special.js';