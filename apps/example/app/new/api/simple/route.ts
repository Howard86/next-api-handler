import { BadRequestException, handler } from 'next-api-handler/beta';

import { getDataById } from '@/server/service';

export const GET = handler(async (req) => {
  const searchParams = new URL(req.url).searchParams;
  const id = searchParams.get('id');

  if (typeof id !== 'string')
    // can throw status code related errors
    throw new BadRequestException('Id is required');

  // automatically handle errors
  return getDataById(id);
});
