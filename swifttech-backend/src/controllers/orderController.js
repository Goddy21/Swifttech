const { query, getClient } = require('../config/database');
const { validationResult } = require('express-validator');

// GET /api/orders
const listOrders = async (req, res, next) => {
  try {
    const { status, sort = '-created_date', limit = 50, offset = 0 } = req.query;

    const conditions = ['user_id = $1'];
    const values = [req.user.id];
    let paramIndex = 2;

    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    const sortMap = {
      '-created_date': 'created_date DESC',
      'created_date': 'created_date ASC',
      '-total': 'total DESC',
      'total': 'total ASC',
    };
    const orderBy = sortMap[sort] || 'created_date DESC';
    const limitVal = Math.min(parseInt(limit) || 50, 200);
    const offsetVal = parseInt(offset) || 0;

    const result = await query(
      `SELECT * FROM orders WHERE ${conditions.join(' AND ')}
       ORDER BY ${orderBy} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...values, limitVal, offsetVal]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id
const getOrder = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/orders — place order from cart or provided items
const createOrder = async (req, res, next) => {
  const client = await getClient();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    await client.query('BEGIN');

    let { items, total, shipping_name, shipping_email, shipping_address,
          shipping_city, shipping_zip, shipping_country = 'Kenya', notes, status = 'pending' } = req.body;

    // If items not provided, build from cart
    if (!items || !items.length) {
      const cartResult = await client.query(
        'SELECT * FROM cart_items WHERE user_id = $1',
        [req.user.id]
      );
      if (!cartResult.rows.length) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Cart is empty' });
      }
      items = cartResult.rows.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: parseFloat(item.product_price),
      }));
    }

    // Validate & compute total from DB prices if not provided
    if (!total) {
      const productIds = items.map((i) => i.product_id).filter(Boolean);
      if (productIds.length) {
        const priceResult = await client.query(
          'SELECT id, price, stock FROM products WHERE id = ANY($1)',
          [productIds]
        );
        const priceMap = Object.fromEntries(priceResult.rows.map((p) => [p.id, p]));
        let subtotal = 0;
        for (const item of items) {
          const dbProduct = priceMap[item.product_id];
          if (dbProduct) {
            item.price = parseFloat(dbProduct.price);
          }
          subtotal += item.price * item.quantity;
        }
        const tax = subtotal * 0.16;
        const shipping = subtotal > 50000 ? 0 : 500;
        total = subtotal + tax + shipping;
      }
    }

    const result = await client.query(
      `INSERT INTO orders
        (user_id, items, total, status, shipping_name, shipping_email,
         shipping_address, shipping_city, shipping_zip, shipping_country, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        req.user.id, JSON.stringify(items), total, status,
        shipping_name, shipping_email, shipping_address,
        shipping_city, shipping_zip, shipping_country, notes,
      ]
    );

    // Clear cart after order placed
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// PUT /api/orders/:id/status  (admin)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
    }

    const result = await query(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/orders  (admin — all orders)
const listAllOrders = async (req, res, next) => {
  try {
    const { status, sort = '-created_date', limit = 100, offset = 0 } = req.query;
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const limitVal = Math.min(parseInt(limit) || 100, 500);
    const offsetVal = parseInt(offset) || 0;

    const result = await query(
      `SELECT o.*, u.email as user_email, u.name as user_name
       FROM orders o LEFT JOIN users u ON u.id = o.user_id
       ${where} ORDER BY o.created_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...values, limitVal, offsetVal]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

module.exports = { listOrders, getOrder, createOrder, updateOrderStatus, listAllOrders };
