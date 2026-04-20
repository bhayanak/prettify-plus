import type { InferredType } from '@/shared/types';

/**
 * Infer TypeScript interface/type from a JSON-like value.
 */
export function inferType(value: unknown, typeName = 'Root'): InferredType {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return {
        typeName,
        typescript: `type ${typeName} = unknown[];`,
        fields: [],
      };
    }
    // Infer from first element
    const itemType = inferType(value[0], `${typeName}Item`);
    const arrayTs = `type ${typeName} = ${itemType.typeName}[];\n\n${itemType.typescript}`;
    return {
      typeName,
      typescript: arrayTs,
      fields: itemType.fields,
    };
  }

  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const fields: InferredType['fields'] = [];
    const lines: string[] = [];

    for (const [key, val] of Object.entries(record)) {
      const tsType = inferTsType(val);
      fields.push({ name: key, type: tsType, optional: val === null || val === undefined });
      const optMark = val === null || val === undefined ? '?' : '';
      lines.push(`  ${safeName(key)}${optMark}: ${tsType};`);
    }

    const typescript = `interface ${typeName} {\n${lines.join('\n')}\n}`;
    return { typeName, typescript, fields };
  }

  const tsType = inferTsType(value);
  return {
    typeName,
    typescript: `type ${typeName} = ${tsType};`,
    fields: [],
  };
}

function inferTsType(value: unknown): string {
  if (value === null || value === undefined) return 'unknown';
  if (Array.isArray(value)) {
    if (value.length === 0) return 'unknown[]';
    return `${inferTsType(value[0])}[]`;
  }
  switch (typeof value) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'object':
      return 'Record<string, unknown>';
    default:
      return 'unknown';
  }
}

function safeName(key: string): string {
  // If key contains special characters, wrap in quotes
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) return key;
  return `'${key.replace(/'/g, "\\'")}'`;
}
