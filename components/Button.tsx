import { styled, Button as TButton } from 'tamagui'

export const Button = styled(TButton, {
  borderRadius: 10,

  pressStyle: {
    bg: 'inherit',
    borderWidth: 0,
    opacity: 0.8,
  },

  variants: {
    centered: {
      true: {
        alignItems: 'center',
        justifyContent: 'center',
      },
    },

    fullWidth: {
      true: {
        width: '100%',
      },
    },

    type: {
      primary: {
        backgroundColor: '$tertiary',
      },
      negative: {
        backgroundColor: '$red9',
      },
    },
  } as const,
})
