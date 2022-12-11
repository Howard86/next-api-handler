import { RouterBuilder } from 'next-api-handler';

// Rewrite reference: https://nextjs.org/docs/api-routes/introduction
const router = new RouterBuilder({ showMessage: true });

// here specify data type
router.get<string>(() => 'John Doe');

export default router.build();
