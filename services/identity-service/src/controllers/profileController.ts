import { Request, Response } from "express";
import {
  updateProfileSchema,
  createAddressSchema,
  updateAddressSchema,
} from "../schemas/authSchemas";
import * as profileService from "../services/profileService";
import { asyncHandler } from "../utils/asyncHandler";

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await profileService.getProfile(req.user!.user_id);
  res.json(profile);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const data = updateProfileSchema.parse(req.body);
  const profile = await profileService.updateProfile(req.user!.user_id, data);
  res.json(profile);
});

export const listAddresses = asyncHandler(async (req: Request, res: Response) => {
  const addresses = await profileService.listAddresses(req.user!.user_id);
  res.json(addresses);
});

export const getAddress = asyncHandler(async (req: Request, res: Response) => {
  const address = await profileService.getAddress(req.user!.user_id, req.params.id);
  res.json(address);
});

export const createAddress = asyncHandler(async (req: Request, res: Response) => {
  const data = createAddressSchema.parse(req.body);
  const address = await profileService.createAddress(req.user!.user_id, data);
  res.status(201).json(address);
});

export const updateAddress = asyncHandler(async (req: Request, res: Response) => {
  const data = updateAddressSchema.parse(req.body);
  const address = await profileService.updateAddress(
    req.user!.user_id,
    req.params.id,
    data
  );
  res.json(address);
});

export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
  await profileService.deleteAddress(req.user!.user_id, req.params.id);
  res.status(204).end();
});

export const setDefaultAddress = asyncHandler(async (req: Request, res: Response) => {
  const address = await profileService.setDefaultAddress(
    req.user!.user_id,
    req.params.id
  );
  res.json(address);
});
