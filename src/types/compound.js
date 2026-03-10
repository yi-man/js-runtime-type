import { createType } from './index.js';
import { validate as runValidate } from '../validate.js';
import { applyTransform } from '../transform.js';

export const array = (itemType) => {
  const baseType = createType('array', {
    validate: (val) => Array.isArray(val)
  })({ items: itemType });

  return {
    ...baseType,
    validate(data) {
      return runValidate(baseType, data);
    },
    validateAsync(data) {
      return Promise.resolve(this.validate(data));
    }
  };
};

export const object = createType('object', {
  validate: (val) => typeof val === 'object' && val !== null && !Array.isArray(val)
});