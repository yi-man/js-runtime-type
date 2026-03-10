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