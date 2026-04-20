import { inferType } from '@/viewer/utils/type-inferrer';
import type { InferredType } from '@/shared/types';

export function inferSchema(data: unknown): InferredType {
  return inferType(data, 'Root');
}
