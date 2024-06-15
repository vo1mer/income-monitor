import { IncomeForm } from '@/components/IncomeForm.tsx'
import { getIncome } from '@/utils/database.ts'
import { useQuery } from '@tanstack/react-query'
import { Stack, useLocalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ActivityIndicator, Platform } from 'react-native'
import { getTokens } from 'tamagui'
import { P, match } from 'ts-pattern'

export default function ModalScreen() {
  const params = useLocalSearchParams()
  const colorTokens = getTokens().color

  const incomeId = match(params)
    .with({ action: 'edit-income', incomeId: P.string }, ({ incomeId }) => parseInt(incomeId))
    .with({ action: 'new-income' }, () => null)
    .otherwise(() => null)

  const queryResult = useQuery({
    queryKey: ['incomeToEdit', incomeId] as [string, number],
    queryFn: ({ queryKey: [, incomeId] }) => getIncome(incomeId),
    enabled: !!incomeId,
  })

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: incomeId ? 'Edit income' : `New income`,
          headerStyle: { backgroundColor: colorTokens.$primary.val },
          contentStyle: { backgroundColor: colorTokens.$secondary.val },
          headerTintColor: colorTokens.$quaternary.val,
        }}
      />

      {match({ queryResult, incomeId })
        .with({ queryResult: { isLoading: true, data: P.nullish }, incomeId: P.number }, () => (
          <ActivityIndicator size="large" color="white" />
        ))
        .with(
          { queryResult: { isLoading: false, data: P.not(P.nullish) }, incomeId: P.number },
          ({ queryResult: { data } }) => <IncomeForm incomeToEdit={data} />
        )
        .with({ incomeId: P.nullish }, () => <IncomeForm />)
        .otherwise(() => null)}

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </>
  )
}
