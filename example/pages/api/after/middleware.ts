import {
  NotFoundException,
  RouterBuilder,
  UnauthorizedException,
} from 'next-api-handler';

import {
  getDataByEmail,
  getEmailFromCookie,
  updateData,
} from '@/server/service';

type CookieMiddlewareResponse = {
  email: string;
};

type UserMiddlewareResponse = {
  id: string;
  name: string;
};

type CombinedMiddlewareResponse = CookieMiddlewareResponse &
  UserMiddlewareResponse;

const router = new RouterBuilder({ shoeMessage: true });

/**
 *  here router.use<T, M> where 
 *  - T: the response type that a middleware emits
 *  - M: the middleware type previously injected and used (optional)
 */
// router.user<T,M> where
router.use<CookieMiddlewareResponse>((req) => {
  const email = getEmailFromCookie(req.cookies['TEST_COOKIE']);

  if (!email) {
    throw new UnauthorizedException();
  }

  return { email };
});

router.use<UserMiddlewareResponse, CookieMiddlewareResponse>(async (req) => {
  const data = await getDataByEmail(req.middleware.email);

  if (!data) {
    throw new NotFoundException();
  }

  return data;
});

router.get<CombinedMiddlewareResponse, CombinedMiddlewareResponse>(
  (req) => req.middleware
);

router.put<CombinedMiddlewareResponse, CombinedMiddlewareResponse>(
  async (req) => {
    const name = req.body?.name as string;
    await updateData(req.middleware.email, name);
    return { ...req.middleware, name };
  }
);

export default router.build();
