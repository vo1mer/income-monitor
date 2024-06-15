import { config as defaultConfig } from '@tamagui/config/v3'

import { createFont, createTamagui, createTokens } from 'tamagui'

const DMSansFont = createFont({
	family: 'DMRegular',
	size: {
		...defaultConfig.tokens.size,
		thin: 12,
		body: 14,
		heading: 15,
	},
	weight: {
		regular: '400',
		medium: '500',
		bold: '700',
	},
	face: {
		400: { normal: 'DMRegular' },
		500: { normal: 'DMMedium' },
		700: { normal: 'DMBold' },
	}
})

export const tokens = createTokens({
	...defaultConfig.tokens,
	size: {
		...defaultConfig.tokens.size,
		'1/2': '50%',
		'$test': 50,
	},
	color: {
		...defaultConfig.tokens.color,

		// primary: '#27374D',
		// secondary: '#526D82',
		// tertiary: '#9DB2BF',
		// quaternary: '#DDE6ED',

		primary: '#2C3639',
		secondary: '#3F4E4F',
		secondaryLight: '#657172',
		tertiary: '#A27B5C',
		quaternary: '#DCD7C9',
	}
})

export const tamaguiConfig = createTamagui({
	...defaultConfig,
	fonts: {
		heading: DMSansFont,
		body: DMSansFont,
		thin: DMSansFont,
	},

	tokens,

	shorthands: {
		...defaultConfig.shorthands,
	} as const,
})

export default tamaguiConfig

export type Conf = typeof tamaguiConfig
declare module 'tamagui' {

	interface TamaguiCustomConfig extends Conf {}

}
