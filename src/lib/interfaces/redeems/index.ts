import { z } from 'zod';

export const redeemCreateBody = z.object({
  userId: z.uuid(),
  productId: z.uuid(),
});

export type RedeemCreateBody = z.infer<typeof redeemCreateBody>;

export const redeemResponse = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  productId: z.uuid(),
  points: z.number(),
  createdAt: z.date(),
  expiredAt: z.date().nullable(),
  user: z.object({
    name: z.string(),
    document: z.string(),
  }),
  product: z.object({
    name: z.string(),
  }),
});

export type RedeemResponse = z.infer<typeof redeemResponse>;
