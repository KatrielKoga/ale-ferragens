import z from 'zod';

export const pendingPaymentCreateBody = z.object({
  userId: z.uuid(),
  valueInCents: z.coerce.number(),
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
