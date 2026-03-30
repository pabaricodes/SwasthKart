import { Request, Response } from "express";
import * as deliveryService from "../services/deliveryService";
import { updateStatusSchema } from "../schemas/deliverySchemas";

export async function getByOrderId(req: Request, res: Response): Promise<void> {
  const result = await deliveryService.getDeliveryByOrderId(req.params.orderId);
  res.json(result);
}

export async function getDelivery(req: Request, res: Response): Promise<void> {
  const result = await deliveryService.getDelivery(req.params.deliveryId);
  res.json(result);
}

export async function listAllDeliveries(req: Request, res: Response): Promise<void> {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const pageSize = Math.max(1, Math.min(100, parseInt(req.query.page_size as string) || 20));
  const status = req.query.status as string | undefined;
  const result = await deliveryService.listDeliveries(page, pageSize, status);
  res.json(result);
}

export async function updateStatus(req: Request, res: Response): Promise<void> {
  const { status, notes } = updateStatusSchema.parse(req.body);
  const result = await deliveryService.updateDeliveryStatus(req.params.deliveryId, status, notes);
  res.json(result);
}
