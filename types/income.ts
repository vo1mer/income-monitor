import { z } from 'zod'

export const incomeSchema = z.object({
	id: z.number(),
	incomeDate: z.string(),
	amount: z.number(),
	exchangeRate: z.number(),
	currency: z.string(),
	amountInUah: z.number(),
	esvTax: z.number(),
	epTax: z.number(),
	taxesSum: z.number(),
	amountAfterTaxes: z.number(),
})

export type TIncome = z.infer<typeof incomeSchema>
