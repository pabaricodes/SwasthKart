import { prisma } from "../db/prisma";

export async function getIdempotencyRecord(params: { key: string }) {
  return prisma.idempotencyKey.findUnique({
    where: { key: params.key }
  });
}

export async function saveIdempotencyRecord(params: {
  key: string;
  response: any;
}) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 1);

  return prisma.idempotencyKey.create({
    data: {
      key: params.key,
      response: params.response,
      expiresAt
    }
  });
}
