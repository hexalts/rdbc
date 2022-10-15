import { Query } from './query';

export interface Payload {
  query: Query[];
  payload: Record<string, unknown> | Record<string, unknown>[];
}
