import { Button } from '@/components/Button.tsx'
import { CollapsableContainer } from '@/components/CollapsableContainer.tsx'
import { TIncome } from '@/types/income.ts'
import { deleteIncome } from '@/utils/database.ts'
import { formatCurrency } from '@/utils/number.ts'
import { routes } from '@/utils/routes'
import { Trash } from '@tamagui/lucide-icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import moment from 'moment'
import { useState } from 'react'
import { Dimensions, Animated as NativeAnimated } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Swipeable from 'react-native-gesture-handler/Swipeable'
import Animated, {
  FadeIn,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { Separator, Text, View } from 'tamagui'

const OFFSET_WIDTH = 100
const { width: SCREEN_WIDTH } = Dimensions.get('window')

export function IncomeCard({
  id,
  amount,
  currency,
  incomeDate,
  exchangeRate,
  amountInUah,
  esvTax,
  epTax,
  taxesSum,
  amountAfterTaxes,
}: TIncome) {
  const [isExpanded, setIsExpanded] = useState(false)
  const client = useQueryClient()
  const router = useRouter()
  const cardTranslateX = useSharedValue(0)
  const cardOpacity = useSharedValue(1)

  const removeIncomeMutation = useMutation({
    mutationFn: (incomeId: TIncome['id']) => deleteIncome(incomeId),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['incomes'] })
    },
  })

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: cardTranslateX.value }],
    }
  })

  const rContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: cardOpacity.value,
    }
  })

  const renderRightActions = (dragX: NativeAnimated.AnimatedInterpolation<string | number>) => {
    const opacity = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.5],
    })

    const scale = dragX.interpolate({
      inputRange: [-90, 0],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    })

    return (
      <NativeAnimated.View
        style={[
          { transform: [{ scale }], opacity },
          { alignItems: 'center', justifyContent: 'center', width: OFFSET_WIDTH },
        ]}
      >
        <Button
          centered
          size="$3"
          type="negative"
          color="white"
          aspectRatio={1}
          scaleIcon={0.5}
          onPress={() => {
            cardTranslateX.value = withTiming(-SCREEN_WIDTH, { duration: 200 })
            cardOpacity.value = withTiming(0, { duration: 200 })

            removeIncomeMutation.mutate(id)
          }}
          icon={Trash}
        />
      </NativeAnimated.View>
    )
  }

  return (
    <Animated.View
      entering={FadeIn}
      layout={LinearTransition.springify(500).damping(90)}
      style={rContainerStyle}
    >
      <Swipeable
        renderRightActions={(_, dragAnimatedValue) => renderRightActions(dragAnimatedValue)}
        rightThreshold={OFFSET_WIDTH / 2}
      >
        <Animated.View style={[rStyle]}>
          <TouchableOpacity
            activeOpacity={1}
            onLongPress={() =>
              router.push({
                pathname: routes.editIncome,
                params: {
                  incomeId: id,
                },
              })
            }
            onPress={() => setIsExpanded(!isExpanded)}
          >
            <View fd="column" ai="stretch" p={10} br={10} bg="$secondaryLight">
              <View fd="row" jc="space-between">
                <Text col="$quaternary" fos="$heading" fow="700">
                  {moment(incomeDate).format('D MMMM YYYY')}
                </Text>

                <Text col="$quaternary" fos="$heading" fow="700">
                  {formatCurrency({ amount, currency, locale: 'EUR' })}
                </Text>
              </View>

              <CollapsableContainer expanded={isExpanded}>
                <View gap={5} mt={20}>
                  <View fd="row" jc="space-between" fw="wrap">
                    <Text col="$quaternary">Курс валют для {currency}</Text>
                    <Text col="$quaternary">{formatCurrency({ amount: exchangeRate })}</Text>
                  </View>
                  <Separator opacity={0.5} my="$0.5" bg="gray" width="100%" />

                  <View fd="row" jc="space-between" fw="wrap">
                    <Text col="$quaternary">Сума, грн</Text>
                    <Text col="$quaternary">{formatCurrency({ amount: amountInUah })}</Text>
                  </View>
                  <Separator opacity={0.5} my="$0.5" bg="gray" width="100%" />

                  <View fd="row" jc="space-between" fw="wrap">
                    <Text col="$quaternary">ЄСВ, грн</Text>
                    <Text col="$quaternary">{formatCurrency({ amount: esvTax })}</Text>
                  </View>
                  <Separator opacity={0.5} my="$0.5" bg="gray" width="100%" />

                  <View fd="row" jc="space-between" fw="wrap">
                    <Text col="$quaternary">ЄП, грн</Text>
                    <Text col="$quaternary">{formatCurrency({ amount: epTax })}</Text>
                  </View>
                  <Separator opacity={0.5} my="$0.5" bg="gray" width="100%" />

                  <View fd="row" jc="space-between" fw="wrap">
                    <Text col="$quaternary">Сума податків, грн</Text>
                    <Text col="$quaternary">{formatCurrency({ amount: taxesSum })}</Text>
                  </View>
                  <Separator opacity={0.5} my="$0.5" bg="gray" width="100%" />

                  <View fd="row" jc="space-between" fw="wrap">
                    <Text col="$quaternary">Сума після податків, грн</Text>
                    <Text col="$quaternary">{formatCurrency({ amount: amountAfterTaxes })}</Text>
                  </View>
                </View>
              </CollapsableContainer>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Swipeable>
    </Animated.View>
  )
}
