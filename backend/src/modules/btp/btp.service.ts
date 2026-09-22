import { randomUUID } from 'node:crypto';
import { mkdir, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import { env } from '../../config/env.js';
import { AppError } from '../../core/errors/app-error.js';
import { ErrorCodes } from '../../core/errors/error-codes.js';
import { BtpRepository, type BtpPlan, type BtpProject } from './btp.repository.js';

const storageRoot = path.resolve(process.cwd(), env.BTP_STORAGE_DIR);

export class BtpService {
  constructor(private readonly repository = new BtpRepository()) {}

  listProjects(): Promise<BtpProject[]> {
    return this.repository.listProjects();
  }

  listPlans(projectId?: number): Promise<BtpPlan[]> {
    return this.repository.listPlans(projectId);
  }

  async importPlan(input: {
    projectId: number;
    file: Express.Multer.File;
    planType: string;
    version?: string;
    uploadedByUserId?: number;
  }): Promise<BtpPlan> {
    if (!(await this.repository.projectExists(input.projectId))) {
      await unlink(input.file.path).catch(() => undefined);
      throw new AppError(404, ErrorCodes.NOT_FOUND, 'Project not found');
    }

    const extension = path.extname(input.file.originalname).toLowerCase();
    const projectDirectory = path.join(storageRoot, String(input.projectId));
    const storedName = `${randomUUID()}${extension}`;
    const relativePath = path.posix.join('projects', String(input.projectId), storedName);
    const targetPath = path.join(projectDirectory, storedName);

    await mkdir(projectDirectory, { recursive: true });
    try {
      await rename(input.file.path, targetPath);
      const id = await this.repository.createPlan({
        projectId: input.projectId,
        name: path.basename(input.file.originalname, extension).slice(0, 200),
        planType: input.planType,
        filePath: relativePath,
        version: input.version,
        uploadedByUserId: input.uploadedByUserId,
      });
      const plan = await this.repository.getPlanById(id);
      if (!plan) {
        throw new AppError(500, ErrorCodes.INTERNAL_ERROR, 'Imported plan could not be loaded');
      }
      return plan;
    } catch (error) {
      await unlink(targetPath).catch(() => undefined);
      await unlink(input.file.path).catch(() => undefined);
      throw error;
    }
  }
}
