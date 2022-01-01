import type { NextApiRequest, NextApiResponse } from 'next';

interface UserRequest extends NextApiRequest {
  query: {
    id: string;
    name: string;
  };
}

type ApiResponse = {
  success: boolean;
  data?: {
    id: string;
    name: string;
  };
  message?: string;
};

// Similar to https://github.com/vercel/next.js/blob/canary/examples/api-routes-rest/pages/api/user/%5Bid%5D.js
export default function userHandler(
  req: UserRequest,
  res: NextApiResponse<ApiResponse>
) {
  const {
    query: { id, name },
    method,
  } = req;

  switch (method) {
    case 'GET':
      // Get data from your database
      res.status(200).json({ success: true, data: { id, name: `User ${id}` } });
      break;
    case 'PUT':
      // Update or create data in your database
      res
        .status(200)
        .json({ success: true, data: { id, name: name || `User ${id}` } });
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res
        .status(405)
        .json({ success: false, message: `Method ${method} Not Allowed` });
  }
}
