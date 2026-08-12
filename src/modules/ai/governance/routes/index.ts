import { Router } from 'express';
import governanceRouter from './governance.routes';

const router = Router();
router.use('/', governanceRouter);

export default router;
export { governanceRouter };
