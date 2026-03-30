import { prisma } from "../db/prisma";
import { NotFoundError } from "../utils/errors";
import type { CreateAddressInput, UpdateProfileInput } from "../schemas/authSchemas";

function maskPhone(phone: string): string {
  return "****" + phone.slice(-6);
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError("user", userId);
  return {
    user_id: user.id,
    phone_masked: maskPhone(user.phone),
    name: user.name,
    role: user.role,
    created_at: user.createdAt,
  };
}

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: data.name },
  });
  return {
    user_id: user.id,
    phone_masked: maskPhone(user.phone),
    name: user.name,
    role: user.role,
    created_at: user.createdAt,
  };
}

export async function listAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export async function getAddress(userId: string, addressId: string) {
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!address) throw new NotFoundError("address", addressId);
  return address;
}

export async function createAddress(userId: string, data: CreateAddressInput) {
  // If this is the first address, make it default
  const count = await prisma.address.count({ where: { userId } });
  return prisma.address.create({
    data: {
      ...data,
      userId,
      isDefault: count === 0,
    },
  });
}

export async function updateAddress(userId: string, addressId: string, data: CreateAddressInput) {
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!address) throw new NotFoundError("address", addressId);

  return prisma.address.update({
    where: { id: addressId },
    data,
  });
}

export async function deleteAddress(userId: string, addressId: string) {
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!address) throw new NotFoundError("address", addressId);

  await prisma.address.delete({ where: { id: addressId } });
}

export async function setDefaultAddress(userId: string, addressId: string) {
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!address) throw new NotFoundError("address", addressId);

  // Unset all defaults for this user, then set the target
  await prisma.$transaction([
    prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    }),
    prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    }),
  ]);

  return prisma.address.findUnique({ where: { id: addressId } });
}
