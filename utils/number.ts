export const formatCurrency = ({
	amount,
	currency = 'UAH',
	locale = 'uk-UA',
	maximumFractionDigits = 4
}: {
	amount: number
	currency?: string
	locale?: string
	maximumFractionDigits?: number
}) => {
	return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits }).format(amount)
}
