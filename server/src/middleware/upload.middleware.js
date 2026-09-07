import multer from 'multer';

// memoryStorage, not diskStorage: the buffer is piped straight to Cloudinary,
// so the file never lands on the local filesystem (handbook D6).
const storage = multer.memoryStorage();

const MAX_FILE_BYTES = 5 * 1024 * 1024;

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    const err = new Error('Only image uploads are allowed');
    err.code = 'INVALID_FILE_TYPE';
    return cb(err);
  }
  return cb(null, true);
};

// The multipart field name is `image` on both POST /api/recipes and
// POST /api/uploads — it must match what the client appends to its FormData.
const parseImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_BYTES },
}).single('image');

/**
 * Runs multer, then translates its failures into the shared response envelope.
 *
 * Without this wrapper a rejected upload (wrong type, too large, wrong field
 * name) reaches Express's default error handler, which replies with an HTML
 * error page and a 500 — breaking both the envelope contract and the status
 * code table in docs/API_CONTRACT.md §8.1. These are bad *requests*, so they
 * must surface as 400 VALIDATION_ERROR.
 */
export const uploadSingleImage = (req, res, next) => {
  parseImage(req, res, (err) => {
    if (!err) return next();

    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Image must be 5MB or smaller'
        : err.code === 'LIMIT_UNEXPECTED_FILE'
          ? 'Unexpected file field — the image field must be named "image"'
          : err.code === 'INVALID_FILE_TYPE'
            ? 'Only image uploads are allowed'
            : 'Could not read the uploaded file';

    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message } });
  });
};
