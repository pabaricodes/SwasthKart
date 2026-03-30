import { Request, Response } from "express";
import * as orderService from "../services/orderService";
import { adminListOrdersQuery, listOrdersQuery, updateStatusSchema } from "../schemas/orderSchemas";

export async function listOrders(req: Request, res: Response): Promise<void> {
  const userId = req.headers["x-user-id"] as string;
  const { page, page_size } = listOrdersQuery.parse(req.query);
  const result = await orderService.listOrders(userId, page, page_size);
  res.json(result);
}

export async function getOrder(req: Request, res: Response): Promise<void> {
  const userId = req.headers["x-user-id"] as string;
  const result = await orderService.getOrder(req.params.orderId, userId);
  res.json(result);
}

export async function listAllOrders(req: Request, res: Response): Promise<void> {
  const { page, page_size, status } = adminListOrdersQuery.parse(req.query);
  const result = await orderService.listAllOrders(page, page_size, status);
  res.json(result);
}

export async function adminGetOrder(req: Request, res: Response): Promise<void> {
  const result = await orderService.getOrder(req.params.orderId);
  res.json(result);
}

export async function updateStatus(req: Request, res: Response): Promise<void> {
  const { status } = updateStatusSchema.parse(req.body);
  const actor = req.headers["x-user-id"] as string;
  const result = await orderService.updateOrderStatus(req.params.orderId, status, actor);
  res.json(result);
}
