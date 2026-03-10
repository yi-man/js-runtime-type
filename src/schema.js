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