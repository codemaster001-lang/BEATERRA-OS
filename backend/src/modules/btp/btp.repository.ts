import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { getDatabasePool } from '../../core/database/mysql.pool.js';

export type BtpProject = RowDataPacket & {
  id: number;
  name: string;
  code: string;
  status: string;
};

export type BtpPlan = RowDataPacket & {
  id: number;
  project_id: number;
  name: string;
  plan_type: string;
  file_path: string;
  version: string | null;
  uploaded_by_user_id: number | null;
  created_at: Date;
  updated_at: Date;
};

export class BtpRepository {
  async listProjects(): Promise<BtpProject[]> {
    const [rows] = await getDatabasePool().execute<BtpProject[]>(
      'SELECT id, name, code, status FROM projects ORDER BY updated_at DESC, id DESC',
    );
    return rows;
  }

  async projectExists(projectId: number): Promise<boolean> {
    const [rows] = await getDatabasePool().execute<RowDataPacket[]>(
      'SELECT id FROM projects WHERE id = ? LIMIT 1',
      [projectId],
    );
    return rows.length > 0;
  }

  async listPlans(projectId?: number): Promise<BtpPlan[]> {
    const query = projectId
      ? 'SELECT id, project_id, name, plan_type, file_path, version, uploaded_by_user_id, created_at, updated_at FROM plans WHERE project_id = ? ORDER BY created_at DESC, id DESC'
      : 'SELECT id, project_id, name, plan_type, file_path, version, uploaded_by_user_id, created_at, updated_at FROM plans ORDER BY created_at DESC, id DESC';
    const [rows] = await getDatabasePool().execute<BtpPlan[]>(query, projectId ? [projectId] : []);
    return rows;
  }

  async createPlan(input: {
    projectId: number;
    name: string;
    planType: string;
    filePath: string;
    version?: string;
    uploadedByUserId?: number;
  }): Promise<number> {
    const [result] = await getDatabasePool().execute<ResultSetHeader>(
      'INSERT INTO plans (project_id, name, plan_type, file_path, version, uploaded_by_user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [
        input.projectId,
        input.name,
        input.planType,
        input.filePath,
        input.version ?? null,
        input.uploadedByUserId ?? null,
      ],
    );
    return result.insertId;
  }

  async getPlanById(id: number): Promise<BtpPlan | undefined> {
    const [rows] = await getDatabasePool().execute<BtpPlan[]>(
      'SELECT id, project_id, name, plan_type, file_path, version, uploaded_by_user_id, created_at, updated_at FROM plans WHERE id = ? LIMIT 1',
      [id],
    );
    return rows[0];
  }
}
