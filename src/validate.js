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

  // Run base validation (skip if type doesn't have _validate, like schemas)
  if (type._validate && !type._validate(value)) {
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

  // Array validation
  if (type._type === 'array') {
    const itemType = type._rules?.items;
    if (!itemType) {
      return { success: true, data: value };
    }

    const resultArray = [];
    const itemErrors = [];

    for (let i = 0; i < value.length; i++) {
      const itemPath = path ? `${path}[${i}]` : `[${i}]`;
      const itemResult = validate(itemType, value[i], itemPath);

      if (itemResult.success) {
        resultArray.push(itemResult.data);
      } else {
        itemErrors.push(...itemResult.errors);
      }
    }

    if (itemErrors.length > 0) {
      return { success: false, errors: itemErrors };
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
        message: `minLength: String must be at least ${rules.minLength} characters`,
        expected: `minLength: ${rules.minLength}`,
        actual: value.length
      });
    }
    if (rules.maxLength !== undefined && value.length > rules.maxLength) {
      errors.push({
        path,
        message: `maxLength: String must be at most ${rules.maxLength} characters`,
        expected: `maxLength: ${rules.maxLength}`,
        actual: value.length
      });
    }
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push({
        path,
        message: `pattern: String does not match pattern`,
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