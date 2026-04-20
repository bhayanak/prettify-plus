/**
 * Build a JSONPath from a tree path array.
 * e.g., ['users', 0, 'name'] → '$.users[0].name'
 */
export function buildJSONPath(segments: (string | number)[]): string {
  let path = '$';
  for (const seg of segments) {
    if (typeof seg === 'number') {
      path += `[${seg}]`;
    } else {
      path += `.${seg}`;
    }
  }
  return path;
}

/**
 * Build an XPath from a tree path array.
 * e.g., ['root', 'users', 'user', 0] → '/root/users/user[1]'
 */
export function buildXPath(segments: (string | number)[]): string {
  let path = '';
  for (const seg of segments) {
    if (typeof seg === 'number') {
      path += `[${seg + 1}]`;
    } else {
      path += `/${seg}`;
    }
  }
  return path || '/';
}

/**
 * Parse a JSONPath string into segments.
 * e.g., '$.users[0].name' → ['users', 0, 'name']
 */
export function parseJSONPath(path: string): (string | number)[] {
  const segments: (string | number)[] = [];
  // Remove leading $. or $
  const cleaned = path.replace(/^\$\.?/, '');
  if (!cleaned) return segments;

  const parts = cleaned.split(/\.|\[|\]/).filter(Boolean);
  for (const part of parts) {
    const num = Number(part);
    if (!isNaN(num) && part !== '') {
      segments.push(num);
    } else {
      segments.push(part);
    }
  }
  return segments;
}
