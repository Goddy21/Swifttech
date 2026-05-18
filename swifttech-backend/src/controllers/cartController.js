const { query } = require('../config/database');

// GET /api/cart
const getCart = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT ci.*, p.name as current_name, p.price as current_price,
              p.images as product_images, p.stock as product_stock
       FROM cart_items ci
       LEFT JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1
       ORDER BY ci.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// POST /api/cart
const addToCart = async (req, res, next) => {
  try {
    const { product_id, quantity = 1, product_name, product_price, product_image } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'product_id is required' });
    }
    if (quantity < 1) {
      return res.status(400).json({ error: 'quantity must be at least 1' });
    }

    // Check product exists and is in stock
    const productResult = await query(
      'SELECT id, name, price, images, stock FROM products WHERE id = $1 AND status = $2',
      [product_id, 'active']
    );
    if (!productResult.rows.length) {
      return res.status(404).json({ error: 'Product not found or not available' });
    }
    const product = productResult.rows[0];

    if (product.stock !== null && product.stock < quantity) {
      return res.status(400).json({ error: `Only ${product.stock} units available` });
    }

    // Check if already in cart — merge quantities
    const existing = await query(
      'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [req.user.id, product_id]
    );

    let result;
    if (existing.rows.length) {
      const newQty = existing.rows[0].quantity + quantity;
      result = await query(
        `UPDATE cart_items SET quantity = $1, updated_at = NOW()
         WHERE id = $2 RETURNING *`,
        [newQty, existing.rows[0].id]
      );
    } else {
      const pName = product_name || product.name;
      const pPrice = product_price || product.price;
      const pImage = product_image || (product.images?.[0] ?? '');

      result = await query(
        `INSERT INTO cart_items (user_id, product_id, quantity, product_name, product_price, product_image)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [req.user.id, product_id, quantity, pName, pPrice, pImage]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/cart/:id
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    if (quantity !== undefined && quantity < 1) {
      return res.status(400).json({ error: 'quantity must be at least 1' });
    }

    const existing = await query(
      'SELECT id FROM cart_items WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!existing.rows.length) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const result = await query(
      `UPDATE cart_items SET quantity = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3 RETURNING *`,
      [quantity, req.params.id, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart/:id
const removeCartItem = async (req, res, next) => {
  try {
    const result = await query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    res.json({ message: 'Item removed', id: result.rows[0].id });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart (clear all)
const clearCart = async (req, res, next) => {
  try {
    await query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
