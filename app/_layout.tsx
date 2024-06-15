import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import 'react-native-gesture-handler'
import 'react-native-reanimated'
import 'reflect-metadata'

import { queryClient } from '@/utils/fetch.ts'
import { QueryClientProvider } from '@tanstack/react-query'
import { DevToolsBubble } from 'react-native-react-query-devtools'
import { getTokens, TamaguiProvider } from 'tamagui'

import { initDB } from '@/utils/database.ts'
import { tamaguiConfig } from '../tamagui.config.ts'

export { ErrorBoundary } from 'expo-router'

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded, error] = useFonts({
    DMBold: require('../assets/fonts/DMSans-Bold.ttf'),
    DMMedium: require('../assets/fonts/DMSans-Medium.ttf'),
    DMRegular: require('../assets/fonts/DMSans-Regular.ttf'),
  })

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error
  }, [error])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  // Initialize the database
  useEffect(() => {
    initDB()
  }, [])

  if (!loaded) {
    return null
  }

  return <RootLayoutNav />
}

function RootLayoutNav() {
  const colorTokens = getTokens().color
  const sizeTokens = getTokens().size

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={tamaguiConfig}>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: 'Incomes',
              headerShadowVisible: false,
              contentStyle: {
                backgroundColor: colorTokens.primary.val,
              },
              headerTitleStyle: {
                color: colorTokens.quaternary.val,
                fontSize: sizeTokens.$1.val,
              },
              headerStyle: {
                backgroundColor: colorTokens.secondary.val,
              },
            }}
          />
          <Stack.Screen name="incomeFormModal" options={{ presentation: 'modal' }} />
        </Stack>
      </TamaguiProvider>
      <DevToolsBubble />
    </QueryClientProvider>
  )
}
