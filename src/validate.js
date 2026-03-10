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