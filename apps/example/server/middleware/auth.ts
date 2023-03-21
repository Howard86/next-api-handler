import {
  BadRequestException,
  ForbiddenException,
  NextApiHandlerWithMiddleware,
  NotFoundException,
  UnauthorizedException,
} from 'next-api-handler';

import { getUserByEmail, type User } from '@/services/user';
import { getEmailFromCookie, verifyVersion } from '@/services/user';

export type VersionMiddleware = {
  version: string;
};

export const versionMiddleware: NextApiHandlerWithMiddleware<
  VersionMiddleware
> = (req) => {
  const version = req.headers['x-version'];

  if (typeof version !== 'string' || !verifyVersion(version))
    throw new BadRequestException();

  return { version };
};

export type CookieMiddleware = {
  email: string;
};

export const cookieMiddleware: NextApiHandlerWithMiddleware<
  CookieMiddleware
> = async (req) => {
  const email = getEmailFromCookie(req.cookies['Authorization']);

  if (!email) throw new UnauthorizedException();

  return { email };
};

export type UserMiddleware = {
  user: User;
};

// Here we can pass required pre-executed middleware to the handler
export const userMiddleware: NextApiHandlerWithMiddleware<
  UserMiddleware,
  CookieMiddleware & VersionMiddleware
> = async (req) => {
  const user = await getUserByEmail(req.middleware.email);

  console.log(`Client side running version ${req.middleware.version}`);

  if (!user) throw new NotFoundException();

  return { user };
};

// Here we can pass void as the response type
export const adminMiddleware: NextApiHandlerWithMiddleware<
  void,
  UserMiddleware
> = async (req) => {
  if (!req.middleware.user.isAdmin) throw new ForbiddenException();
};
