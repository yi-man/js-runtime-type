import { describe, it, expect } from 'vitest';
import { createSchema, createEntity, string, number } from '../src/index.js';

describe('createEntity', () => {
  it('should validate and instantiate entity', () => {
    class User {
      constructor(data) {
        this.name = data.name;
        this.age = data.age;
      }
      greet() {
        return `Hi, ${this.name}`;
      }
    }

    const UserEntity = createEntity(
      createSchema({ name: string(), age: number({ min: 0 }) }),
      User
    );

    const result = UserEntity.from({ name: 'John', age: 25 });
    expect(result.success).toBe(true);
    expect(result.data).toBeInstanceOf(User);
    expect(result.data.name).toBe('John');
    expect(result.data.age).toBe(25);
    expect(result.data.greet()).toBe('Hi, John');
  });

  it('should return errors when validation fails', () => {
    class User {
      constructor(data) {
        this.name = data.name;
      }
    }

    const UserEntity = createEntity(
      createSchema({ name: string() }),
      User
    );

    const result = UserEntity.from({});
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors[0].path).toBe('name');
  });
});
