const { Router } = require('express');
const { body } = require('express-validator');
const {
  listOrders, getOrder, createOrder, updateOrderStatus, listAllOrders,
} = require('../controllers/orderController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

// Customer routes
router.get('/', listOrders);
router.get('/:id', getOrder);
router.post('/', [
  body('shipping_name').trim().notEmpty().withMessage('Shipping name is required'),
  body('shipping_email').isEmail().withMessage('Valid email is required'),
  body('shipping_address').trim().notEmpty().withMessage('Shipping address is required'),
  body('shipping_city').trim().notEmpty().withMessage('City is required'),
], createOrder);

// Admin routes
router.put('/:id/status', requireAdmin, updateOrderStatus);
router.get('/admin/all', requireAdmin, listAllOrders);

module.exports = router;
