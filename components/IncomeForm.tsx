import { Button } from '@/components/Button.tsx'
import { DatePicker } from '@/components/DatePicker.tsx'
import { DropdownInput } from '@/components/DropdownInput.tsx'
import { InputText } from '@/components/InputText.tsx'
import { TIncome, incomeSchema } from '@/types/income.ts'
import { createIncome, updateIncome } from '@/utils/database.ts'
import { formatCurrency } from '@/utils/number.ts'
import { isNotEmpty, isNotNullish } from '@/utils/types.ts'
import { Edit3 } from '@tamagui/lucide-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import moment from 'moment/moment'
import { useEffect, useState } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  TouchableWithoutFeedback,
} from 'react-native'
import { useForm } from 'react-ux-form'
import { ScrollView, Text, View, XStack } from 'tamagui'
import { P, match } from 'ts-pattern'

const DEFAULT_CURRENCY = 'EUR'
const CURRENCIES = [
  { value: 'EUR', label: 'EUR, €' },
  { value: 'USD', label: 'USD, $' },
  { value: 'CAD', label: 'CAD, $' },
  { value: 'GBP', label: 'GBP, £' },
  { value: 'UAH', label: 'UAH, ₴' },
]
const ESV_TAX_VALUE = '1760'

interface Props {
  incomeToEdit?: TIncome
}

export function IncomeForm({ incomeToEdit }: Props) {
  const router = useRouter()
  const client = useQueryClient()
  const editIncomeResult = incomeSchema.safeParse(incomeToEdit)
  const editIncome = editIncomeResult.success ? editIncomeResult.data : null

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(moment(editIncome?.incomeDate).format('YYYYMMDD'))
  const [currentCurrency, setCurrentCurrency] = useState(editIncome?.currency ?? DEFAULT_CURRENCY)
  const [isEsvInclude, setIsEsvInclude] = useState(editIncome?.esvTax === 0 ? false : true)
  const [isEsvEditable, setIsEsvEditable] = useState(false)

  const { data: exchangeRateData, isLoading } = useQuery({
    queryKey: ['currency', currentDate, currentCurrency],
    queryFn: async ({ queryKey: [, date, currency] }) => {
      if (currency === 'UAH') return Promise.resolve([{ rate: 1 }] as { rate: number }[])

      return fetch(
        `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchangenew?json&valcode=${currency}&date=${date}`
      ).then(res => res.json())
    },
    select: data => data[0].rate,
    enabled: !!currentDate && !!currentCurrency,
  })

  const { Field, submitForm, setFieldValue, listenFields, resetForm } = useForm({
    incomeDate: {
      initialValue: moment(currentDate).format('YYYY-MM-DD'),
      validate: value => {
        const isValidDate = moment(value, 'YYYY-MM-DD', true).isValid()

        if (!isValidDate) {
          return 'Date is invalid'
        }
      },
    },
    amount: {
      initialValue: editIncome?.amount.toString() ?? '',
      sanitize: value => value.trim().replace(',', '.'),
      validate: value => {
        if (value === '') {
          return '*'
        }

        const parsed = Number(value)
        if (isNaN(parsed)) {
          return 'number required'
        }

        if (parsed < 0) {
          return 'only positive'
        }
      },
    },
    exchangeRate: {
      initialValue: editIncome?.exchangeRate.toString() ?? '',
      sanitize: value => value.trim().replace(',', '.'),
      validate: value => {
        if (value === '') {
          return '*'
        }

        const parsed = Number(value)
        if (isNaN(parsed)) {
          return 'number required'
        }

        if (parsed < 0) {
          return 'only positive'
        }
      },
    },
    currency: {
      initialValue: editIncome?.currency ?? currentCurrency,
      sanitize: value => value.trim().replace(',', '.'),
      validate: value => {
        if (value === '') {
          return '*'
        }
      },
    },
    amountInUah: {
      initialValue: editIncome?.amountInUah.toString() ?? '',
      sanitize: value => value.trim().replace(',', '.'),
      validate: value => {
        if (value === '') {
          return '*'
        }
      },
    },
    esvTax: {
      initialValue: editIncome?.esvTax.toString() ?? ESV_TAX_VALUE,
      sanitize: value => value.trim().replace(',', '.'),
      validate: value => {
        if (value === '') {
          return '*'
        }

        const parsed = Number(value)
        if (isNaN(parsed)) {
          return 'number required'
        }

        if (parsed < 0) {
          return 'only positive'
        }
      },
    },
    epTax: {
      initialValue: editIncome?.epTax.toString() ?? '',
      sanitize: value => value.trim().replace(',', '.'),
      validate: value => {
        if (value === '') {
          return '*'
        }

        const parsed = Number(value)
        if (isNaN(parsed)) {
          return 'number required'
        }

        if (parsed < 0) {
          return 'only positive'
        }
      },
    },
    taxesSum: {
      initialValue: editIncome?.taxesSum.toString() ?? '',
      sanitize: value => value.trim().replace(',', '.'),
      validate: value => {
        if (value === '') {
          return '*'
        }

        const parsed = Number(value)
        if (isNaN(parsed)) {
          return 'number required'
        }

        if (parsed < 0) {
          return 'only positive'
        }
      },
    },
    amountAfterTaxes: {
      initialValue: editIncome?.amountAfterTaxes.toString() ?? '',
      sanitize: value => value.trim().replace(',', '.'),
      validate: value => {
        if (value === '') {
          return '*'
        }

        const parsed = Number(value)
        if (isNaN(parsed)) {
          return 'number required'
        }
      },
    },
  })

  const addMutation = useMutation({
    mutationFn: (variables: Omit<TIncome, 'id'>) => {
      return match(editIncomeResult.success)
        .with(true, () => updateIncome(editIncome!.id, variables))
        .with(false, () => createIncome(variables))
        .exhaustive()
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['incomes'] })
      if (editIncomeResult.success) {
        client.invalidateQueries({ queryKey: ['incomeToEdit'] })
      }
    },
    onError: error => {
      console.log('error ', error)
    },
  })

  useEffect(() => {
    if (isNotNullish(exchangeRateData)) {
      setFieldValue('exchangeRate', exchangeRateData.toString())
    }
  }, [exchangeRateData])

  useEffect(() => {
    const removeAmountInUahListener = listenFields(
      ['amount', 'exchangeRate'],
      ({ amount, exchangeRate }) => {
        match({ amount: amount.value, exchangeRate: exchangeRate.value })
          .with(
            {
              amount: P.when(val => typeof val === 'string' && isNotEmpty(val)),
              exchangeRate: P.when(val => typeof val === 'string' && isNotEmpty(val)),
            },
            () =>
              setFieldValue(
                'amountInUah',
                (
                  parseFloat(amount.value.replace(',', '.')) *
                  parseFloat(exchangeRate.value.replace(',', '.'))
                )
                  .toFixed(2)
                  .toString()
              )
          )
          .otherwise(() => setFieldValue('amountInUah', ''))
      }
    )

    const removeEpListener = listenFields(['amountInUah'], ({ amountInUah }) => {
      match(amountInUah.value)
        .with(
          P.when(val => typeof val === 'string' && isNotEmpty(val)),
          () =>
            setFieldValue(
              'epTax',
              (parseFloat(amountInUah.value.replace(',', '.')) * 0.05).toFixed(2).toString()
            )
        )
        .otherwise(() => setFieldValue('epTax', ''))
    })

    const removeTaxSumListener = listenFields(['esvTax', 'epTax'], ({ esvTax, epTax }) => {
      match({ esvTax: esvTax.value, epTax: epTax.value })
        .with(
          {
            esvTax: P.when(val => typeof val === 'string' && isNotEmpty(val)),
            epTax: P.when(val => typeof val === 'string' && isNotEmpty(val)),
          },
          () =>
            setFieldValue(
              'taxesSum',
              (
                parseFloat(esvTax.value.replace(',', '.')) +
                parseFloat(epTax.value.replace(',', '.'))
              )
                .toFixed(2)
                .toString()
            )
        )
        .otherwise(() => setFieldValue('taxesSum', ''))
    })

    const removeAmountAfterTaxesListener = listenFields(
      ['amountInUah', 'taxesSum'],
      ({ amountInUah, taxesSum }) => {
        match({ amountInUah: amountInUah.value, taxesSum: taxesSum.value })
          .with(
            {
              amountInUah: P.when(val => typeof val === 'string' && isNotEmpty(val)),
              taxesSum: P.when(val => typeof val === 'string' && isNotEmpty(val)),
            },
            () =>
              setFieldValue(
                'amountAfterTaxes',
                (
                  parseFloat(amountInUah.value.replace(',', '.')) -
                  parseFloat(taxesSum.value.replace(',', '.'))
                )
                  .toFixed(2)
                  .toString()
              )
          )
          .otherwise(() => setFieldValue('amountAfterTaxes', ''))
      }
    )

    return () => {
      removeAmountInUahListener()
      removeEpListener()
      removeTaxSumListener()
      removeAmountAfterTaxesListener()
    }
  }, [])

  useEffect(() => {
    if (['error', 'success'].includes(addMutation.status)) {
      const timeout = setTimeout(() => {
        addMutation.reset()

        if (addMutation.status === 'success') {
          router.back()
        }
      }, 200)

      return () => {
        clearTimeout(timeout)
      }
    }
  }, [addMutation, resetForm])

  const submit = () =>
    submitForm(async values => {
      const variables = {
        incomeDate: moment(values.incomeDate!).format('YYYY-MM-DD'),
        amount: parseFloat(values.amount!),
        exchangeRate: parseFloat(values.exchangeRate!),
        currency: values.currency!,
        amountInUah: parseFloat(values.amountInUah!),
        esvTax: parseFloat(values.esvTax!),
        epTax: parseFloat(values.epTax!),
        taxesSum: parseFloat(values.taxesSum!),
        amountAfterTaxes: parseFloat(values.amountAfterTaxes!),
      }

      addMutation.mutate(variables)
    })

  const handleEsvTaxChange = () => {
    if (!isEsvEditable) {
      setIsEsvInclude(prev => {
        setFieldValue('esvTax', !prev ? ESV_TAX_VALUE : '0')
        return !prev
      })
    }
  }

  return (
    <View flex={1} gap={10} p={10}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, zIndex: 999 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 112 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 10 }}
            overScrollMode="always"
          >
            <View flex={1} gap={10}>
              <Field name="incomeDate">
                {({ value, onChange, error }) => (
                  <>
                    <InputText
                      value={moment(value).format('YYYY-MM-DD')}
                      onPress={() => setIsDatePickerOpen(true)}
                      label="Дата"
                      placeholder="Дата"
                      error={error}
                      editable={false}
                    />

                    <DatePicker
                      isOpen={isDatePickerOpen}
                      setOpen={setIsDatePickerOpen}
                      currentDate={value}
                      setDate={(date: string) => {
                        onChange(date)
                        setCurrentDate(moment(date).format('YYYYMMDD'))
                      }}
                    />
                  </>
                )}
              </Field>

              <XStack gap={10} alignItems="flex-end">
                <View w="66%">
                  <Field name="amount">
                    {({ value, onChange, error }) => (
                      <InputText
                        value={value}
                        onChange={onChange}
                        placeholder="Сума"
                        error={error}
                        label="Сума"
                      />
                    )}
                  </Field>
                </View>

                <View flex={1}>
                  <Field name="currency">
                    {({ value, onChange }) => (
                      <DropdownInput
                        onChange={value => {
                          onChange(value)
                          setCurrentCurrency(value)
                        }}
                        currentItem={value}
                        selectItems={CURRENCIES}
                      />
                    )}
                  </Field>
                </View>
              </XStack>

              <XStack gap={10} alignItems="flex-end">
                <View w="66%">
                  <Field name="amountInUah">
                    {({ value, error }) => (
                      <InputText
                        value={value ? formatCurrency({ amount: parseFloat(value) }) : ''}
                        placeholder="Сума, грн"
                        error={error}
                        label="Сума, грн"
                        editable={false}
                      />
                    )}
                  </Field>
                </View>

                <View flex={1}>
                  <Field name="exchangeRate">
                    {({ value, onChange, error }) => (
                      <InputText
                        value={value ? formatCurrency({ amount: parseFloat(value) }) : ''}
                        onChange={onChange}
                        placeholder="Курс валют"
                        error={error}
                        label="Курс валют"
                        isLoading={isLoading}
                        editable={false}
                      />
                    )}
                  </Field>
                </View>
              </XStack>

              <XStack gap={10} alignItems="flex-end">
                <XStack w="66%" gap={10} alignItems="flex-end">
                  <View flex={1}>
                    <Field name="esvTax">
                      {({ value, onChange, error }) => (
                        <InputText
                          value={
                            value
                              ? formatCurrency({
                                  amount: parseFloat(value),
                                  maximumFractionDigits: 0,
                                })
                              : ''
                          }
                          onChange={onChange}
                          placeholder="ЄСВ, грн"
                          error={error}
                          label="ЄСВ, грн"
                          onPress={handleEsvTaxChange}
                          editable={isEsvEditable}
                          disabled={!isEsvInclude}
                          rightIcon={
                            <Pressable
                              onPress={() => isEsvInclude && setIsEsvEditable(!isEsvEditable)}
                            >
                              <Edit3
                                size={20}
                                col={match({ isEsvInclude, isEsvEditable })
                                  .with({ isEsvInclude: false }, () => '$secondary' as const)
                                  .with(
                                    { isEsvInclude: true, isEsvEditable: true },
                                    () => '$blue11'
                                  )
                                  .with(
                                    { isEsvInclude: true, isEsvEditable: false },
                                    () => '$secondary'
                                  )
                                  .exhaustive()}
                              />
                            </Pressable>
                          }
                        />
                      )}
                    </Field>
                  </View>

                  <View flex={1}>
                    <Field name="epTax">
                      {({ value, error }) => (
                        <InputText
                          value={value ? formatCurrency({ amount: parseFloat(value) }) : ''}
                          placeholder="ЄП, грн"
                          error={error}
                          label="ЄП, грн"
                          editable={false}
                        />
                      )}
                    </Field>
                  </View>
                </XStack>

                <View flex={1}>
                  <Field name="taxesSum">
                    {({ value, onChange, error }) => (
                      <InputText
                        value={value ? formatCurrency({ amount: parseFloat(value) }) : ''}
                        onChange={onChange}
                        placeholder="Податки всього, грн"
                        error={error}
                        label="Податки всього, грнqweqweqwe"
                        editable={false}
                      />
                    )}
                  </Field>
                </View>
              </XStack>

              <View style={{ marginBottom: 10 }}>
                <Field name="amountAfterTaxes">
                  {({ value, onChange, error }) => (
                    <InputText
                      value={
                        value
                          ? formatCurrency({ amount: parseFloat(value), maximumFractionDigits: 2 })
                          : ''
                      }
                      onChange={onChange}
                      placeholder="Після податків, грн"
                      error={error}
                      label="Після податків, грн"
                      editable={false}
                    />
                  )}
                </Field>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <SafeAreaView>
        <Button
          centered
          type={addMutation.status === 'error' ? 'negative' : 'primary'}
          onPress={submit}
          disabled={addMutation.status === 'pending'}
        >
          <Text fontSize="$heading" tt="uppercase" fow="$bold" col="$quaternary">
            {match(addMutation.status)
              .with('idle', () => 'Save')
              .with('pending', () => 'Saving...')
              .with('success', () => 'Saved')
              .with('error', () => 'Error')
              .exhaustive()}
          </Text>
        </Button>
      </SafeAreaView>
    </View>
  )
}
