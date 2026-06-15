import {Router} from 'express';
import {ensureProductsTable, query} from '../db/mysql.js';
import {HttpError, asyncHandler, ok} from '../utils/http.js';

const router = Router();
const VALID_STATUS = ['online', 'offline'];

function toPositiveInt(value, fallback, max = 1000) {
    const number = Number.parseInt(value, 10);
    if (!Number.isFinite(number) || number <= 0) {
        return fallback;
    }
    return Math.min(number, max);
}

function normalizeProduct(row) {
    if (!row) {
        return null;
    }

    return {
        id: Number(row.id),
        name: row.name,
        category: row.category,
        price: Number(row.price),
        stock: Number(row.stock),
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

function validateProductPayload(body, partial = false) {
    const data = {};

    if (!partial || body.name !== undefined) {
        const name = String(body.name || '').trim();
        if (!name) {
            throw new HttpError(400, '商品名称不能为空');
        }
        if (name.length > 120) {
            throw new HttpError(400, '商品名称不能超过 120 个字符');
        }
        data.name = name;
    }

    if (!partial || body.category !== undefined) {
        const category = String(body.category || '').trim();
        if (category.length > 80) {
            throw new HttpError(400, '商品类目不能超过 80 个字符');
        }
        data.category = category;
    }

    if (!partial || body.price !== undefined) {
        const price = Number(body.price);
        if (!Number.isFinite(price) || price < 0) {
            throw new HttpError(400, '商品价格必须是大于等于 0 的数字');
        }
        data.price = Number(price.toFixed(2));
    }

    if (!partial || body.stock !== undefined) {
        const stock = Number.parseInt(body.stock, 10);
        if (!Number.isFinite(stock) || stock < 0) {
            throw new HttpError(400, '库存必须是大于等于 0 的整数');
        }
        data.stock = stock;
    }

    if (!partial || body.status !== undefined) {
        const status = body.status || 'offline';
        if (!VALID_STATUS.includes(status)) {
            throw new HttpError(400, '商品状态只能是 online 或 offline');
        }
        data.status = status;
    }

    if (partial && Object.keys(data).length === 0) {
        throw new HttpError(400, '没有可更新的字段');
    }

    return data;
}

async function getProduct(id) {
    await ensureProductsTable();
    const rows = await query('SELECT * FROM admin_products WHERE id = ? LIMIT 1', [id]);
    return normalizeProduct(rows[0]);
}

router.get('/', asyncHandler(async (req, res) => {
    await ensureProductsTable();

    const page = toPositiveInt(req.query.page, 1);
    const pageSize = toPositiveInt(req.query.pageSize, 20, 100);
    const offset = (page - 1) * pageSize;
    const where = [];
    const params = [];

    const keyword = String(req.query.keyword || '').trim();
    if (keyword) {
        where.push('(name LIKE ? OR category LIKE ?)');
        params.push(`%${keyword}%`, `%${keyword}%`);
    }

    if (req.query.status && req.query.status !== 'all') {
        if (!VALID_STATUS.includes(req.query.status)) {
            throw new HttpError(400, '商品状态只能是 online 或 offline');
        }
        where.push('status = ?');
        params.push(req.query.status);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const countRows = await query(`SELECT COUNT(*) AS total FROM admin_products ${whereSql}`, params);
    const rows = await query(
        `SELECT * FROM admin_products ${whereSql} ORDER BY updated_at DESC, id DESC LIMIT ${pageSize} OFFSET ${offset}`,
        params
    );

    ok(res, {
        list: rows.map(normalizeProduct),
        total: Number(countRows[0]?.total || 0),
        page,
        pageSize
    });
}));

router.post('/', asyncHandler(async (req, res) => {
    await ensureProductsTable();
    const data = validateProductPayload(req.body);

    const result = await query(
        'INSERT INTO admin_products (name, category, price, stock, status) VALUES (?, ?, ?, ?, ?)',
        [data.name, data.category, data.price, data.stock, data.status]
    );

    ok(res.status(201), await getProduct(result.insertId), 'created');
}));

router.get('/:id', asyncHandler(async (req, res) => {
    const id = toPositiveInt(req.params.id, 0);
    const product = await getProduct(id);
    if (!product) {
        throw new HttpError(404, '商品不存在');
    }
    ok(res, product);
}));

const updateProduct = asyncHandler(async (req, res) => {
    await ensureProductsTable();
    const id = toPositiveInt(req.params.id, 0);
    const data = validateProductPayload(req.body, true);

    const fields = Object.keys(data);
    const values = fields.map(key => data[key]);
    const result = await query(
        `UPDATE admin_products SET ${fields.map(field => `${field} = ?`).join(', ')} WHERE id = ?`,
        [...values, id]
    );

    if (result.affectedRows === 0) {
        throw new HttpError(404, '商品不存在');
    }

    ok(res, await getProduct(id), 'updated');
});

router.put('/:id', updateProduct);
router.patch('/:id', updateProduct);

router.delete('/:id', asyncHandler(async (req, res) => {
    await ensureProductsTable();
    const id = toPositiveInt(req.params.id, 0);
    const result = await query('DELETE FROM admin_products WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
        throw new HttpError(404, '商品不存在');
    }

    ok(res, {id}, 'deleted');
}));

export default router;
