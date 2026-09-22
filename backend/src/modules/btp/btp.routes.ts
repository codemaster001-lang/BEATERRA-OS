import { Router } from 'express';
import multer from 'multer';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { env } from '../../config/env.js';
import { AppError } from '../../core/errors/app-error.js';
import { ErrorCodes } from '../../core/errors/error-codes.js';
import { BtpController } from './btp.controller.js';

export const btpRouter = Router();
const controller = new BtpController();
const temporaryDirectory = path.resolve(process.cwd(), env.BTP_STORAGE_DIR, 'tmp');
const allowedExtensions = new Set(['.pdf', '.png', '.jpg', '.jpeg']);
const allowedMimeTypes = new Set(['application/pdf', 'image/png', 'image/jpeg', 'image/pjpeg']);

const normalizeMimeType = (mimeType: string): string => mimeType.toLowerCase() === 'image/pjpeg' ? 'image/jpeg' : mimeType.toLowerCase();

const upload = multer({
  storage: multer.diskStorage({
    destination: async (_request, _file, callback) => {
      try {
        await mkdir(temporaryDirectory, { recursive: true });
        callback(null, temporaryDirectory);
      } catch (error) {
        callback(error as Error, temporaryDirectory);
      }
    },
    filename: (_request, file, callback) => callback(null, `${Date.now()}-${Math.random().toString(36).slice(2)}` + path.extname(file.originalname).toLowerCase()),
  }),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const mimeType = normalizeMimeType(file.mimetype || '');

    if (!allowedExtensions.has(extension)) {
      callback(new AppError(400, ErrorCodes.VALIDATION_ERROR, 'Unsupported plan file type'));
      return;
    }

    if (mimeType && !allowedMimeTypes.has(mimeType)) {
      callback(new AppError(400, ErrorCodes.VALIDATION_ERROR, 'Unsupported plan file type'));
      return;
    }

    callback(null, true);
  },
});

btpRouter.get('/projects', (request, response, next) => void controller.listProjects(request, response).catch(next));
btpRouter.get('/plans', (request, response, next) => void controller.listPlans(request, response).catch(next));
btpRouter.post('/plans', upload.single('file'), (request, response, next) => void controller.importPlan(request, response).catch(next));
