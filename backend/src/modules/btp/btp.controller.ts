import type { Request, Response } from 'express';
import path from 'node:path';
import { ok } from '../../core/utils/api-response.js';
import { importPlanBodySchema, plansQuerySchema } from './btp.schemas.js';
import { BtpService } from './btp.service.js';

const service = new BtpService();

const toResponsePlan = (request: Request, plan: Awaited<ReturnType<BtpService['listPlans']>>[number]) => ({
  id: plan.id,
  project_id: plan.project_id,
  plan_name: plan.name,
  file_name: plan.file_path.split('/').pop() ?? plan.name,
  file_type: path.extname(plan.file_path).slice(1).toLowerCase(),
  plan_type: plan.plan_type,
  file_path: plan.file_path,
  file_url: `${request.protocol}://${request.get('host')}/storage/${plan.file_path.replace(/^projects\//, '')}`,
  version: plan.version,
  created_at: plan.created_at,
  updated_at: plan.updated_at,
});

export class BtpController {
  async listProjects(_request: Request, response: Response) {
    return ok(response, await service.listProjects());
  }

  async listPlans(request: Request, response: Response) {
    const query = plansQuerySchema.parse(request.query);
    const plans = await service.listPlans(query.projectId);
    return ok(response, plans.map((plan) => toResponsePlan(request, plan)));
  }

  async importPlan(request: Request, response: Response) {
    const body = importPlanBodySchema.parse(request.body);
    if (!request.file) {
      return response.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'A plan file is required' } });
    }
    const plan = await service.importPlan({
      projectId: body.project_id,
      planType: body.plan_type,
      version: body.version,
      file: request.file,
      uploadedByUserId: request.auth ? Number(request.auth.sub) : undefined,
    });
    return ok(response, toResponsePlan(request, plan), 201);
  }
}
