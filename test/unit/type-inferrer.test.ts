import { describe, it, expect } from 'vitest';
import { inferType } from '@/viewer/utils/type-inferrer';

describe('inferType', () => {
  it('infers interface from object', () => {
    const result = inferType({ name: 'Alice', age: 30, active: true });
    expect(result.typeName).toBe('Root');
    expect(result.typescript).toContain('interface Root');
    expect(result.typescript).toContain('name: string');
    expect(result.typescript).toContain('age: number');
    expect(result.typescript).toContain('active: boolean');
    expect(result.fields).toHaveLength(3);
  });

  it('infers array type', () => {
    const result = inferType([{ id: 1, name: 'test' }], 'Users');
    expect(result.typeName).toBe('Users');
    expect(result.typescript).toContain('type Users = UsersItem[]');
    expect(result.typescript).toContain('interface UsersItem');
  });

  it('infers empty array', () => {
    const result = inferType([]);
    expect(result.typescript).toContain('unknown[]');
  });

  it('infers primitive types', () => {
    expect(inferType('hello').typescript).toContain('string');
    expect(inferType(42).typescript).toContain('number');
    expect(inferType(true).typescript).toContain('boolean');
  });

  it('marks null fields as optional', () => {
    const result = inferType({ name: 'test', nickname: null });
    expect(result.typescript).toContain('nickname?');
    expect(result.typescript).toContain('unknown');
    const optionalField = result.fields.find((f) => f.name === 'nickname');
    expect(optionalField?.optional).toBe(true);
  });

  it('handles nested objects', () => {
    const result = inferType({ user: { name: 'Alice' } });
    expect(result.typescript).toContain('Record<string, unknown>');
  });

  it('handles nested arrays', () => {
    const result = inferType({ tags: ['a', 'b'] });
    expect(result.typescript).toContain('string[]');
  });

  it('handles special key names', () => {
    const result = inferType({ 'my-key': 'value', normal: 'value' });
    expect(result.typescript).toContain("'my-key'");
    expect(result.typescript).toContain('normal');
  });

  it('handles null value', () => {
    const result = inferType(null);
    expect(result.typescript).toContain('unknown');
  });

  it('handles undefined value', () => {
    const result = inferType(undefined);
    expect(result.typescript).toContain('unknown');
  });

  it('uses custom type name', () => {
    const result = inferType({ id: 1 }, 'UserResponse');
    expect(result.typeName).toBe('UserResponse');
    expect(result.typescript).toContain('interface UserResponse');
  });
});
