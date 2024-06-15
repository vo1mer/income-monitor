import { isNotEmpty, isNotNullish } from '@/utils/types.ts'
import { ActivityIndicator, NativeSyntheticEvent, NativeTouchEvent } from 'react-native'
import { Input, Label, View, YStack, getTokens } from 'tamagui'
import { P, match } from 'ts-pattern'

interface Props {
  label?: string
  value: string
  error?: string
  onChange?: (value: string) => void
  onPress?: (e: NativeSyntheticEvent<NativeTouchEvent>) => void
  placeholder?: string
  isLoading?: boolean
  disabled?: boolean
  editable?: boolean
  rightIcon?: React.ReactNode
}

export function InputText({
  value,
  onChange,
  onPress,
  error,
  placeholder,
  label,
  isLoading = false,
  disabled = false,
  editable = true,
  rightIcon,
}: Props) {
  const colorTokens = getTokens().color

  return (
    <YStack gap={5}>
      {isNotNullish(label) && isNotEmpty(label) && (
        <Label fos="$thin" lh={0} col="$quaternary" disabled numberOfLines={1}>
          {label}
        </Label>
      )}

      <View pos="relative">
        <Input
          br={10}
          px={10}
          pr={rightIcon ? 40 : 'inherit'}
          h="$4"
          bw={1}
          bc={error ? '$red9' : '$quaternary'}
          fos="$heading"
          fow="$bold"
          opacity={disabled ? 0.6 : 1}
          bg="$quaternary"
          col="$secondary"
          onChangeText={onChange}
          placeholder={placeholder}
          onPressIn={onPress}
          value={value}
          readOnly={!editable}
          flex={1}
        />

        {match({ isLoading, rightIcon })
          .with({ isLoading: true }, () => (
            <View pos="absolute" w={20} h={20} t={12} r={10}>
              <ActivityIndicator size="small" color={colorTokens.primary.val} />
            </View>
          ))
          .with({ isLoading: false, rightIcon: P.not(P.nullish) }, ({ rightIcon }) => (
            <View pos="absolute" w={20} h={20} t={12} r={10}>
              {rightIcon}
            </View>
          ))
          .otherwise(() => null)}
      </View>
    </YStack>
  )
}
