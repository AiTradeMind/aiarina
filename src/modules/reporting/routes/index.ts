import { Router } from 'express';
import reportingRouter from './reporting.routes';

const router = Router();
router.use('/', reportingRouter);

export default router;
export { reportingRouter };
