const { Router } = require('express');
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart } = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:id', updateCartItem);
router.delete('/clear', clearCart);
router.delete('/:id', removeCartItem);

module.exports = router;
