import Router from '../../../build/main/lib/router';

const router = new Router();

router.get((_req, res) => {
  return res.status(200).send('USERS');
});

export default router.build();
