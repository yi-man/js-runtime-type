/**
 * Binds a schema to an Entity class so that validated data is turned into entity instances.
 *
 * @param {Object} schema - Schema from createSchema()
 * @param {new (data: any) => any} EntityClass - Class to instantiate with validated data
 * @returns {{ from: (data: any) => { success: boolean, data?: InstanceType<EntityClass>, errors?: Array }, fromAsync: (data: any) => Promise<...> }}
 */
export function createEntity(schema, EntityClass) {
  return {
    from(data) {
      const result = schema.validate(data);
      if (!result.success) {
        return { success: false, errors: result.errors };
      }
      return {
        success: true,
        data: new EntityClass(result.data)
      };
    },

    async fromAsync(data) {
      const result = await schema.validateAsync(data);
      if (!result.success) {
        return { success: false, errors: result.errors };
      }
      return {
        success: true,
        data: new EntityClass(result.data)
      };
    }
  };
}
