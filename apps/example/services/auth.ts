import { type User } from './user';

export const getUserInfo = async (_arg: unknown): Promise<User> => ({
  id: 1,
  name: 'John Doe',
});

export const verify = async (_arg: unknown): Promise<boolean> => true;
