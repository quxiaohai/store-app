import {Router} from 'express';
import adminProductsRouter from './admin-products.js';
import {pingMysql} from '../db/mysql.js';
import {asyncHandler, errorHandler, ok} from '../utils/http.js';

const router = Router();

router.get('/health', (req, res) => {
    ok(res, {service: 'ok'});
});

router.get('/db/health', asyncHandler(async (req, res) => {
    await pingMysql();
    ok(res, {mysql: 'ok'});
}));

router.use('/admin/products', adminProductsRouter);
router.use(errorHandler);

export default router;
