import mysql from 'mysql2/promise';
import {env} from '../config/env.js';

let pool = null;
let productsTableReady = false;

function intEnv(name, fallback) {
    const value = Number.parseInt(env(name, String(fallback)), 10);
    return Number.isFinite(value) ? value : fallback;
}

function boolEnv(name, fallback) {
    const value = env(name, String(fallback)).toLowerCase();
    return !['0', 'false', 'no', 'off'].includes(value);
}

function createPool() {
    return mysql.createPool({
        host: env('MYSQL_HOST', env('DB_HOST', '127.0.0.1')),
        port: intEnv('MYSQL_PORT', intEnv('DB_PORT', 3306)),
        user: env('MYSQL_USER', env('DB_USER', 'root')),
        password: env('MYSQL_PASSWORD', env('DB_PASSWORD', 'root')),
        database: env('MYSQL_DATABASE', env('DB_NAME', 'store_app')),
        waitForConnections: true,
        connectionLimit: intEnv('MYSQL_CONNECTION_LIMIT', 10),
        namedPlaceholders: true,
        charset: 'utf8mb4'
    });
}

export function getPool() {
    if (!pool) {
        pool = createPool();
    }
    return pool;
}

export async function pingMysql() {
    const connection = await getPool().getConnection();
    try {
        await connection.ping();
        return true;
    } finally {
        connection.release();
    }
}

export async function query(sql, params = []) {
    const [rows] = await getPool().execute(sql, params);
    return rows;
}

export async function ensureProductsTable() {
    if (productsTableReady || !boolEnv('MYSQL_AUTO_INIT', true)) {
        return;
    }

    await query(`
        CREATE TABLE IF NOT EXISTS admin_products (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            name VARCHAR(120) NOT NULL,
            category VARCHAR(80) NOT NULL DEFAULT '',
            price DECIMAL(10, 2) NOT NULL DEFAULT 0,
            stock INT UNSIGNED NOT NULL DEFAULT 0,
            status ENUM('online', 'offline') NOT NULL DEFAULT 'offline',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_admin_products_status (status),
            KEY idx_admin_products_name (name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    productsTableReady = true;
}
