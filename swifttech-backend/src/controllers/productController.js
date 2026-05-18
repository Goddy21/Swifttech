const { query } = require('../config/database');
const { validationResult } = require('express-validator');

// Build ORDER BY clause safely
const getSortClause = (sortBy) => {
  const sortMap = {
    '-created_date': 'created_date DESC',
    'created_date': 'created_date ASC',
    'price': 'price ASC',
    '-price': 'price DESC',
    'name': 'name ASC',
    '-name': 'name DESC',
  };
  return sortMap[sortBy] || 'created_date DESC';
};

// GET /api/products
const listProducts = async (req, res, next) => {
  try {
    const {
      status,
      category,
      featured,
      search,
      min_price,
      max_price,
      sort = '-created_date',
      limit = 100,
      offset = 0,
    } = req.query;

    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(status);
    }
    if (category && category !== 'all') {
      conditions.push(`category = $${paramIndex++}`);
      values.push(category);
    }
    if (featured !== undefined) {
      conditions.push(`featured = $${paramIndex++}`);
      values.push(featured === 'true');
    }
    if (search) {
      conditions.push(`(name ILIKE $${paramIndex} OR brand ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
    }
    if (min_price !== undefined) {
      conditions.push(`price >= $${paramIndex++}`);
      values.push(parseFloat(min_price));
    }
    if (max_price !== undefined) {
      conditions.push(`price <= $${paramIndex++}`);
      values.push(parseFloat(max_price));
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const orderBy = getSortClause(sort);
    const limitVal = Math.min(parseInt(limit) || 100, 500);
    const offsetVal = parseInt(offset) || 0;

    const [dataResult, countResult] = await Promise.all([
      query(
        `SELECT * FROM products ${where} ORDER BY ${orderBy} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...values, limitVal, offsetVal]
      ),
      query(`SELECT COUNT(*) FROM products ${where}`, values),
    ]);

    res.json({
      products: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
      limit: limitVal,
      offset: offsetVal,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
const getProduct = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const {
      name, description, price, original_price = 0,
      category = 'electronics', subcategory, brand, sku,
      stock = 0, weight, dimensions,
      images = [], specs = [],
      featured = false, status = 'active',
    } = req.body;

    const result = await query(
      `INSERT INTO products
        (name, description, price, original_price, category, subcategory,
         brand, sku, stock, weight, dimensions, images, specs, featured, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING *`,
      [
        name, description, price, original_price, category, subcategory || null,
        brand || null, sku || null, stock, weight || null, dimensions || null,
        JSON.stringify(images), JSON.stringify(specs), featured, status,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const existing = await query('SELECT id FROM products WHERE id = $1', [req.params.id]);
    if (!existing.rows.length) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const fields = [
      'name', 'description', 'price', 'original_price', 'category',
      'subcategory', 'brand', 'sku', 'stock', 'weight', 'dimensions',
      'featured', 'status',
    ];
    const jsonFields = ['images', 'specs'];

    const updates = [];
    const values = [];
    let paramIndex = 1;

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${paramIndex++}`);
        values.push(req.body[field]);
      }
    }
    for (const field of jsonFields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${paramIndex++}`);
        values.push(JSON.stringify(req.body[field]));
      }
    }

    if (!updates.length) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.params.id);
    const result = await query(
      `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted', id: result.rows[0].id });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/categories/summary
const categorySummary = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT category, COUNT(*) as count, MIN(price) as min_price, MAX(price) as max_price
       FROM products WHERE status = 'active'
       GROUP BY category ORDER BY category`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct, categorySummary };
