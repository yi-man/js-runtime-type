export function createSchema(fields) {
  return {
    _fields: fields,
    validate(data) {
      return { success: true, data };
    }
  };
}