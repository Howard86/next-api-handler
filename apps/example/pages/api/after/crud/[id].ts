import { RouterBuilder } from 'next-api-handler';

type User = {
  id: string;
  name: string;
};

const router = new RouterBuilder({ showMessage: true });

router.get<User>((req) => ({
  id: req.query.id as string,
  name: `User ${req.query.id}`,
}));

router.put<User>((req) => ({
  id: req.query.id as string,
  name: (req.query.name as string) || `User ${req.query.id}`,
}));

export default router.build();
