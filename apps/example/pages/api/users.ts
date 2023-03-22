import { BadRequestException, RouterBuilder } from 'next-api-handler';

import {
  adminMiddleware,
  cookieMiddleware,
  type UserMiddleware,
  userMiddleware,
  type VersionMiddleware,
  versionMiddleware,
} from '@/server/middleware/auth';
import { deleteUser, updateUser, type User } from '@/services/user';

const router = new RouterBuilder();

router
  .inject(versionMiddleware)
  .inject(cookieMiddleware)
  .use(userMiddleware)
  .use('PUT', adminMiddleware)
  .use('DELETE', adminMiddleware)
  .put<User>((req) => updateUser(req.body))
  // here we add required middleware type to the handler
  .get<User, UserMiddleware>((req) => req.middleware.user)
  // here we can combine multiple middleware types
  .delete<User, UserMiddleware & VersionMiddleware>(async (req) => {
    const user = await deleteUser(
      req.middleware.user.email,
      req.middleware.version
    );

    if (!user) throw new BadRequestException('Unmatched version');

    return user;
  });

export default router.build();
