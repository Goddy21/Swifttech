const { Router } = require('express');
const { body } = require('express-validator');
const {
  listProducts, getProduct, createProduct,
  updateProduct, deleteProduct, categorySummary,
} = require('../controllers/productController');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = Router();

// Public routes
router.get('/', optionalAuth, listProducts);
router.get('/categories/summary', categorySummary);
router.get('/:id', optionalAuth, getProduct);

// Protected / Admin routes
const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').optional().isIn(['electronics', 'home_appliances', 'machinery', 'tools', 'components']),
  body('status').optional().isIn(['active', 'draft', 'archived']),
  body('stock').optional().isInt({ min: 0 }),
];

router.post('/', authenticate, requireAdmin, productValidation, createProduct);
router.put('/:id', authenticate, requireAdmin, updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);

module.exports = router;
