import type { NextApiRequest, NextApiResponse } from 'next';

// Similar to next.js example from https://nextjs.org/docs/api-routes/introduction
export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<{ success: true; data: string }>
) {
  res.status(200).json({
    success: true,
    data: 'John Doe',
  });
}
