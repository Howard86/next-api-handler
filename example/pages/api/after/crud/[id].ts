import { NextApiRequestWithMiddleware, RouterBuilder } from 'next-api-handler';

interface UserRequest extends NextApiRequestWithMiddleware {
  query: {
    id: string;
    name: string;
  };
}

type User = {
  id: string;
  name: string;
};

const router = new RouterBuilder({ showMessage: true });

router.get<User>((req: UserRequest) => ({
  id: req.query.id,
  name: `User ${req.query.id}`,
}));

router.put<User>((req: UserRequest) => ({
  id: req.query.id,
  name: req.query.name || `User ${req.query.id}`,
}));

export default router.build();
