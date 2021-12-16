import { BadRequestException, RouterBuilder } from 'next-api-handler';

import { getDataById } from '@/server/service';

const router = new RouterBuilder({ shoeMessage: true });

router.get<string>((req) => {
  const { id } = req.query;

  if (typeof id !== 'string') {
    // can throw status code related errors
    throw new BadRequestException('Id is required');
  }

  // automatically handle errors
  return getDataById(id);
});

export default router.build();
