const { Router } = require('express');
const { uploadFiles, deleteFile } = require('../controllers/uploadController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.post('/', authenticate, uploadFiles);
router.delete('/:filename', authenticate, deleteFile);

module.exports = router;
