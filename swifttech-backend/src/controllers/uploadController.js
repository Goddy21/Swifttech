const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WEBP, and GIF images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
});

// POST /api/upload  (single or multiple files)
const uploadFiles = (req, res, next) => {
  const uploadHandler = upload.array('file', 10);
  uploadHandler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const files = req.files.map((file) => ({
      file_url: `${baseUrl}/uploads/${file.filename}`,
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    }));

    // Return single file_url for backward compat with frontend
    res.json(
      files.length === 1
        ? { file_url: files[0].file_url, ...files[0] }
        : { files, file_url: files[0].file_url }
    );
  });
};

// DELETE /api/upload/:filename
const deleteFile = (req, res, next) => {
  try {
    const filename = path.basename(req.params.filename); // prevent path traversal
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    fs.unlinkSync(filePath);
    res.json({ message: 'File deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadFiles, deleteFile };
