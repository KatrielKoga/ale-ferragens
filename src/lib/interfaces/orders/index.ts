import z from 'zod';

export const orderCreateBody = z.object({
  userId: z.uuid(),
  points: z.coerce.number().min(1),
});

export type OrderCreateBody = z.infer<typeof orderCreateBody>;

export const orderResponse = z.object({
  id: z.uuid(),
  points: z.coerce.number().min(1),
  createdAt: z.date(),
  user: z.object({
    name: z.string(),
    document: z.string(),
  }),
});

export type OrderResponse = z.infer<typeof orderResponse>;
