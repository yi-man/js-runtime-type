import { createType } from './index.js';

export const literal = (value) => createType('literal', {
  validate: (val) => val === value
})({ _literalValue: value });

export const enumType = (values) => createType('enum', {
  validate: (val) => values.includes(val)
})({ _enumValues: values });

export const union = (types) => createType('union', {
  validate: (val) => types.some(t => {
    try {
      return t._validate(val);
    } catch {
      return false;
    }
  }
)})({ _unionTypes: types });