const { Router } = require('express');
const { body } = require('express-validator');
const { register, login, me, updateMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().notEmpty().withMessage('Name is required'),
], register);

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], login);

router.get('/me', authenticate, me);
router.put('/me', authenticate, updateMe);

module.exports = router;
