import { RouterMethod } from './type';

export const DEFAULT_MIDDLEWARE_ROUTER_METHOD = 'ALL' as const;

export const SUPPORTED_ROUTER_METHODS: RouterMethod[] = [
  'GET',
  'PATCH',
  'DELETE',
  'POST',
  'PUT',
];
