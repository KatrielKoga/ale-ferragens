import { z } from 'zod';

export const userCreateBody = z.object({
  name: z.string().min(1),
  document: z
    .string()
    .min(1)
    .max(14)
    .refine(
      (val) => {
        if (val.length === 11) {
          return true;
        }
        return val.length === 14;
      },
      {
        message: 'Documento inválido',
      }
    ),
});

export type UserCreateBody = z.infer<typeof userCreateBody>;

export const userResponse = z.object({
  id: z.uuid(),
  name: z.string(),
  document: z.string(),
  createdAt: z.date(),
  points: z.number(),
});

export type UserResponse = z.infer<typeof userResponse>;

export const userByDocumentResponse = z.object({
  id: z.uuid(),
  name: z.string(),
  document: z.string(),
  createdAt: z.date(),
  points: z.number(),
  orders: z.array(
    z.object({
      points: z.number(),
      createdAt: z.date(),
      expiredAt: z.date().nullable(),
    })
  ),
  redeems: z.array(
    z.object({
      points: z.number(),
      createdAt: z.date(),
      expiredAt: z.date().nullable(),
      product: z.object({
        name: z.string(),
      }),
    })
  ),
});

export type UserByDocumentResponse = z.infer<typeof userByDocumentResponse>;
