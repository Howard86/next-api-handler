import type { NextApiRequest, NextApiResponse } from 'next';

import {
  getDataByEmail,
  getEmailFromCookie,
  updateData,
} from '@/server/service';

type DataResponse = {
  success: boolean;
  data?: {
    id: string;
    name: string;
    email: string;
  };
  message?: string;
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<DataResponse>
) => {
  const email = getEmailFromCookie(req.cookies['TEST_COOKIE']);

  if (!email) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  const data = await getDataByEmail(email);

  if (!data) {
    return res.status(404).json({
      success: false,
      message: 'Not Found',
    });
  }

  try {
    switch (req.method) {
      case 'GET': {
        return res.status(200).json({
          success: true,
          data: {
            ...data,
            email,
          },
        });
      }

      case 'PUT': {
        const name = req.body?.name as string;
        await updateData(email, name);

        return res.status(200).json({
          success: true,
          data: {
            ...data,
            name,
            email,
          },
        });
      }

      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({
          success: false,
          message: `Method ${req.method} Not Allowed`,
        });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export default handler;
