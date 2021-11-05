import type { NextApiRequest, NextApiResponse } from 'next';

import { getDataById } from '@/server/service';

type DataResponse = {
  success: boolean;
  data?: string; // success data
  message?: string; // error message
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<DataResponse>
) => {
  // has type undefined | string | string[]
  const { id } = req.query;

  // check if query id is provided, if not return 400
  if (typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Id is required',
    });
  }

  try {
    // a fake service might throw
    const data = await getDataById(id);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    // depending on the error type
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export default handler;
