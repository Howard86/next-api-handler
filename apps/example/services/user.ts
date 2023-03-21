export type User = {
  id: number;
  name: string;
  isAdmin?: boolean;
  email?: string;
};

export const createUser = async (_arg: unknown): Promise<User> => ({
  id: 1,
  name: 'John Doe',
});

export const updateUser = async (_arg: unknown): Promise<User> => ({
  id: 1,
  name: 'Updated John Doe',
});

export const deleteUser = async (..._args: unknown[]): Promise<User> => ({
  id: 1,
  name: 'Deleted John Doe',
});

export const getEmailFromCookie = (_arg: unknown): string =>
  'example@example.com';

export const getUserByEmail = async (_arg: unknown): Promise<User> => ({
  id: 1,
  name: 'John Doe',
});

export const verifyVersion = async (_arg: unknown): Promise<boolean> => true;
