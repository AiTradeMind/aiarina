import { Router } from 'express';
import operationsRouter from './operations.routes';

const platformRouter = Router();
platformRouter.use('/operations', operationsRouter);

export default platformRouter;
export { operationsRouter };
