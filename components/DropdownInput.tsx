import { Check, ChevronDown } from '@tamagui/lucide-icons'
import { useMemo } from 'react'
import { FullWindowOverlay } from 'react-native-screens'
import { Adapt, Select, Sheet, View } from 'tamagui'

interface Props {
  onChange: (value: string) => void
  currentItem?: string
  selectItems: { value: string; label: string }[]
}

export function DropdownInput({ onChange, currentItem, selectItems }: Props) {
  return (
    <Select value={currentItem} onValueChange={onChange} disablePreventBodyScroll size={'$body'}>
      <Select.Trigger
        iconAfter={ChevronDown}
        bg="$quaternary"
        pressStyle={{ bg: '$quaternary', opacity: 0.8 }}
      >
        <Select.Value placeholder="Something" col="$secondary" fos="$heading" fow="$bold" />
      </Select.Trigger>

      <Adapt when="sm" platform="ios" key="select">
        <Sheet
          modal
          dismissOnSnapToBottom
          containerComponent={useMemo(
            () => props => (
              <FullWindowOverlay>
                <View flex={1} pointerEvents="box-none">
                  {props.children}
                </View>
              </FullWindowOverlay>
            ),
            []
          )}
          snapPoints={[30]}
          snapPointsMode="percent"
          animation="medium"
        >
          <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
          <Sheet.Handle />
          <Sheet.Frame bg="$quaternary" p={20}>
            <Adapt.Contents />
          </Sheet.Frame>
        </Sheet>
      </Adapt>

      <Select.Content>
        <Select.Viewport>
          <Select.Group gap={10} fd="row" fw="wrap">
            {selectItems.map((item, i) => {
              return (
                <Select.Item
                  index={i}
                  key={item.value}
                  value={item.value}
                  br={10}
                  gap={10}
                  bg={currentItem === item.value ? '$secondary' : '$secondaryLight'}
                  w="fit-content"
                >
                  <Select.ItemText col="$quaternary">{item.label}</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check col="$quaternary" size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
              )
            })}
          </Select.Group>
        </Select.Viewport>
      </Select.Content>
    </Select>
  )
}
