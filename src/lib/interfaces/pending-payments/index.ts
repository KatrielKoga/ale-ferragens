import z from 'zod';

export const pendingPaymentCreateBody = z.object({
  userId: z.uuid(),
  valueInCents: z.coerce.number(),
  observation: z.string().optional(),
  createdAt: z.date().optional(),
});

export type PendingPaymentCreateBody = z.infer<typeof pendingPaymentCreateBody>;

export const pendingPaymentResponse = z.object({
  user: z.object({
    name: z.string(),
    document: z.string(),
  }),
  pendingPayments: z
    .array(
      z.object({
        id: z.uuid(),
        valueInCents: z.coerce.number().min(1),
        observation: z.string().nullable().optional(),
        createdAt: z.date(),
      })
    )
    .optional(),
  balanceInCents: z.coerce.number(),
});

export type PendingPaymentResponse = z.infer<typeof pendingPaymentResponse>;

export const pendingPaymentByUserResponse = z.array(pendingPaymentResponse);

export type PendingPaymentByUserResponse = z.infer<
  typeof pendingPaymentByUserResponse
>;
