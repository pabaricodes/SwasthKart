import { z } from "zod";

export const createCartSchema = z.object({
  body: z.object({
    customerId: z.string().min(1).optional(),
    currency: z.string().min(3).max(3)
  })
});

export const cartIdParamSchema = z.object({
  params: z.object({
    cartId: z.string().min(1)
  })
});

export const addItemSchema = z.object({
  params: z.object({
    cartId: z.string().min(1)
  }),
  body: z.object({
    product_id: z.string().min(1),
    quantity: z.number().int().min(1)
  }),
  headers: z
    .object({
      "idempotency-key": z.string().min(1).max(200).optional()
    })
    .passthrough()
});

export const updateItemSchema = z.object({
  params: z.object({
    cartId: z.string().min(1),
    productId: z.string().min(1)
  }),
  body: z.object({
    quantity: z.number().int().min(0)
  }),
  headers: z
    .object({
      "idempotency-key": z.string().min(1).max(200).optional()
    })
    .passthrough()
});

export const removeItemSchema = z.object({
  params: z.object({
    cartId: z.string().min(1),
    productId: z.string().min(1)
  })
});
