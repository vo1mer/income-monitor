import { useState } from 'react'
import { LayoutChangeEvent } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { View } from 'tamagui'

interface Props {
  children: React.ReactNode
  expanded: boolean
}

export function CollapsableContainer({ expanded, children }: Props) {
  const [height, setHeight] = useState(0)
  const animatedHeight = useSharedValue(0)

  const onLayout = (event: LayoutChangeEvent) => {
    const onLayoutHeight = event.nativeEvent.layout.height

    if (onLayoutHeight > 0 && height !== onLayoutHeight) {
      setHeight(onLayoutHeight)
    }
  }

  const collapsableStyle = useAnimatedStyle(() => {
    animatedHeight.value = expanded
      ? withSpring(height, { damping: 90 })
      : withSpring(0, { damping: 90 })

    return {
      height: animatedHeight.value,
    }
  }, [expanded])

  return (
    <Animated.View style={[collapsableStyle, { overflow: 'hidden' }]}>
      <View style={{ position: 'absolute', width: '100%' }} onLayout={onLayout}>
        {children}
      </View>
    </Animated.View>
  )
}

CollapsableContainer.displayName = 'CollapsableContainer'
