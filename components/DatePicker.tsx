import DateTimePicker from '@react-native-community/datetimepicker'
import moment from 'moment/moment'
import { useMemo } from 'react'
import { Platform } from 'react-native'
import { FullWindowOverlay } from 'react-native-screens'
import { Sheet, View } from 'tamagui'

interface Props {
  isOpen: boolean
  setOpen: (open: boolean) => void
  currentDate: string
  setDate: (date: string) => void
}

export function DatePicker({ isOpen, setOpen, currentDate, setDate }: Props) {
  return (
    <Sheet
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
      forceRemoveScrollEnabled={isOpen}
      modal
      open={isOpen}
      onOpenChange={setOpen}
      snapPoints={[30]}
      snapPointsMode="percent"
      dismissOnSnapToBottom
      zIndex={100_000}
      animation="medium"
    >
      <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
      <Sheet.Handle />
      <Sheet.Frame padding="$4" justifyContent="center" alignItems="center" bg="$quaternary">
        <DateTimePicker
          themeVariant="light"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          testID="dateTimePicker"
          value={new Date(currentDate)}
          mode="date"
          is24Hour={true}
          onChange={(_, date) =>
            setDate(date ? moment(date).format('YYYY-MM-DD') : new Date().toISOString())
          }
        />
      </Sheet.Frame>
    </Sheet>
  )
}
