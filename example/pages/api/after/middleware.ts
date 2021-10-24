import {
  NextApiRequestWithMiddleware,
  NotFoundException,
  RouterBuilder,
  UnauthorizedException,
} from 'next-api-handler';

import {
  getDataByEmail,
  getEmailFromCookie,
  updateData,
} from '@/server/service';

type DataResponse = {
  email: string;
  id: string;
  name: string;
};

// here we have the same type as response
type MiddlewareType = DataResponse;

const router = new RouterBuilder();

router.use<Pick<MiddlewareType, 'email'>>((req) => {
  const email = getEmailFromCookie(req.cookies['TEST_COOKIE']);

  if (!email) {
    throw new UnauthorizedException();
  }

  return { email };
});

router.use<Omit<MiddlewareType, 'email'>>(
  async (req: NextApiRequestWithMiddleware<Pick<MiddlewareType, 'email'>>) => {
    const data = await getDataByEmail(req.middleware.email);

    if (!data) {
      throw new NotFoundException();
    }

    return data;
  }
);

router.get<DataResponse, MiddlewareType>((req) => req.middleware);

router.put<DataResponse, MiddlewareType>(async (req) => {
  const name = req.body?.name as string;
  await updateData(req.middleware.email, name);
  return { ...req.middleware, name };
});

export default router.build();
