import z from 'zod';

export const productCreateBody = z.object({
  name: z.string().min(1),
  points: z.coerce.number().min(1),
  description: z.string().optional(),
  image: z.instanceof(File).optional(),
});

export type ProductCreateBody = z.infer<typeof productCreateBody>;

export const productResponse = z.object({
  id: z.uuid(),
  name: z.string(),
  points: z.coerce.number().min(1),
  description: z.string().optional(),
  image: z.string(),
  createdAt: z.date(),
  code: z.coerce.number(),
  _count: z.object({
    redeems: z.number(),
  }),
});

export type ProductResponse = z.infer<typeof productResponse>;

export const productUpdateBody = productCreateBody
  .extend({
    id: z.uuid(),
    active: z.boolean().optional(),
  })
  .partial();

export type ProductUpdateBody = z.infer<typeof productUpdateBody>;
