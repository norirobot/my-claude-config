const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 업로드 디렉토리 생성
const uploadDir = process.env.UPLOAD_PATH || 'uploads/';
const audioDir = path.join(uploadDir, 'audio');

// 디렉토리가 없으면 생성
[uploadDir, audioDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 파일 저장 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      cb(null, audioDir);
    } else {
      cb(null, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname) || '.wav';
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  }
});

// 파일 필터링
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'audio') {
    // 오디오 파일만 허용
    if (file.mimetype.startsWith('audio/') || 
        ['.wav', '.mp3', '.m4a', '.ogg', '.webm'].includes(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  } else {
    // 기타 파일 타입
    cb(null, true);
  }
};

// Multer 설정
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    files: 5 // 최대 5개 파일
  },
  fileFilter: fileFilter
});

// 특화된 업로드 미들웨어들
const uploadMiddleware = {
  // 단일 오디오 파일
  singleAudio: upload.single('audio'),
  
  // 여러 오디오 파일
  multipleAudio: upload.array('audio', 5),
  
  // 혼합 파일 (오디오 + 기타)
  mixed: upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'transcript', maxCount: 1 },
    { name: 'metadata', maxCount: 1 }
  ]),

  // 에러 핸들링
  handleUploadError: (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File too large',
          message: `Maximum file size is ${(parseInt(process.env.MAX_FILE_SIZE) || 10485760) / (1024*1024)}MB`
        });
      } else if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          error: 'Too many files',
          message: 'Maximum 5 files allowed'
        });
      } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          error: 'Unexpected file field',
          message: 'Check the file field name'
        });
      }
    } else if (err) {
      return res.status(400).json({
        success: false,
        error: 'Upload error',
        message: err.message
      });
    }
    next();
  }
};

// 파일 정리 유틸리티
const fileUtils = {
  // 파일 삭제
  deleteFile: (filePath) => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
    } catch (error) {
      console.error('File deletion error:', error);
    }
    return false;
  },

  // 임시 파일 정리 (1시간 이상 된 파일)
  cleanupTempFiles: () => {
    try {
      const dirs = [audioDir, uploadDir];
      const maxAge = 60 * 60 * 1000; // 1시간
      const now = Date.now();

      dirs.forEach(dir => {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          files.forEach(file => {
            const filePath = path.join(dir, file);
            const stats = fs.statSync(filePath);
            
            if (now - stats.mtime.getTime() > maxAge) {
              fs.unlinkSync(filePath);
              console.log(`Cleaned up old file: ${filePath}`);
            }
          });
        }
      });
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  },

  // 파일 정보 가져오기
  getFileInfo: (filePath) => {
    try {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        return {
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          extension: path.extname(filePath),
          name: path.basename(filePath)
        };
      }
    } catch (error) {
      console.error('File info error:', error);
    }
    return null;
  }
};

// 정기적으로 임시 파일 정리 (매 30분)
setInterval(() => {
  fileUtils.cleanupTempFiles();
}, 30 * 60 * 1000);

module.exports = {
  upload,
  uploadMiddleware,
  fileUtils,
  uploadDir,
  audioDir
};