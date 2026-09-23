import { Router } from 'express';
import { TransportController } from './transport.controller.js';

export const transportRouter = Router();
const controller = new TransportController();

transportRouter.get('/summary', (request, response, next) => void controller.listSummary(request, response).catch(next));
transportRouter.get('/drivers', (request, response, next) => void controller.listDrivers(request, response).catch(next));
transportRouter.post('/drivers', (request, response, next) => void controller.createDriver(request, response).catch(next));
transportRouter.patch('/drivers/:id/status', (request, response, next) => void controller.updateDriverStatus(request, response).catch(next));
transportRouter.patch('/drivers/:id', (request, response, next) => void controller.updateDriver(request, response).catch(next));
transportRouter.get('/vehicles', (request, response, next) => void controller.listVehicles(request, response).catch(next));
transportRouter.post('/vehicles', (request, response, next) => void controller.createVehicle(request, response).catch(next));
