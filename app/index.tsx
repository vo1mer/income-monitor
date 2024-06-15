import { Button } from '@/components/Button.tsx'
import { IncomeCard } from '@/components/IncomeCard.tsx'
import { TIncome, incomeSchema } from '@/types/income.ts'
import { getPaginatedIncomes } from '@/utils/database.ts'
import { routes } from '@/utils/routes.ts'
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import moment from 'moment/moment'
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  SafeAreaView,
} from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Text, View, getTokens } from 'tamagui'
import { P, isMatching, match } from 'ts-pattern'

type ListData = {
  indices: number[]
  data: (TIncome | { id: number; title: string })[]
}

export default function MainScreen() {
  const router = useRouter()
  const colorTokens = getTokens().color

  const queryResult = useInfiniteQuery({
    queryKey: ['incomes'],
    queryFn: ({ pageParam }) => getPaginatedIncomes(pageParam, 15),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (lastPage.length === 0) {
        return undefined
      }

      return lastPageParam + 1
    },
  })

  const flatInfiniteData = (data: InfiniteData<TIncome[], unknown>) =>
    data.pages
      .flatMap(page => page)
      .filter(Boolean)
      .reduce(
        (acc, income, index, array) => {
          const currentDate = moment(income.incomeDate)
          const prevItem = array[index - 1]

          const isFirstOfMonth =
            !prevItem || moment(prevItem.incomeDate).month() !== currentDate.month()

          if (isFirstOfMonth) {
            acc = {
              indices: [...(acc.indices ?? []), index + (acc.indices ?? []).length],
              data: [
                ...acc.data,
                {
                  id: parseInt(currentDate.format('MMYYYY')),
                  title: currentDate.format('MMMM, YYYY'),
                },
                income,
              ],
            }

            return acc
          }

          acc = {
            indices: [...(acc.indices ?? [])],
            data: [...acc.data, income],
          }

          return acc
        },
        { data: [], indices: [] } as ListData
      )

  const renderListItem = ({ item }: ListRenderItemInfo<ListData['data'][number]>) => {
    const incomeBody = incomeSchema.safeParse(item)

    if (incomeBody.success) {
      return <IncomeCard {...incomeBody.data} />
    }

    if (isMatching({ id: P.number, title: P.string }, item)) {
      return (
        <View flex={1} pb={10} bg="$primary">
          <Text ta="center" col="$quaternary" fow="$bold" fos="$heading">
            {item.title}
          </Text>
        </View>
      )
    }

    return null
  }

  return (
    <View flex={1} p={10} gap={10} ai="center">
      {match(queryResult)
        .with({ data: P.nullish, isLoading: true }, () => (
          <View flex={1} jc="center">
            <View fd="row" gap={10}>
              <Text fow="$bold" col="$quaternary">
                Loading
              </Text>
              <ActivityIndicator size="small" color={colorTokens.quaternary.val} />
            </View>
          </View>
        ))
        .with(
          { data: P.not(P.nullish) },
          ({ data, refetch, isLoading, isFetching, fetchNextPage, isFetchingNextPage }) => {
            const flattenData = flatInfiniteData(data)

            return (
              <GestureHandlerRootView style={{ flex: 1, alignSelf: 'stretch' }}>
                <FlatList
                  data={flattenData.data}
                  keyExtractor={({ id }) => id.toString()}
                  renderItem={renderListItem}
                  stickyHeaderIndices={flattenData.indices}
                  style={{ borderRadius: 10 }}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ gap: 10 }}
                  onEndReached={() => !isFetching && fetchNextPage()}
                  ListFooterComponent={() => {
                    if (isFetchingNextPage) {
                      return (
                        <View jc="center" ai="center" p={10}>
                          <ActivityIndicator size="small" color={colorTokens.quaternary.val} />
                        </View>
                      )
                    }

                    return null
                  }}
                  refreshControl={
                    <RefreshControl
                      tintColor={colorTokens.quaternary.val}
                      refreshing={isLoading}
                      onRefresh={refetch}
                    />
                  }
                />
              </GestureHandlerRootView>
            )
          }
        )
        .with({ data: P.nullish }, { data: P.array(P.nullish) }, () => (
          <View flex={1} jc="center">
            <Text fow="$bold" col="$quaternary">
              No incomes
            </Text>
          </View>
        ))
        .otherwise(() => null)}

      <SafeAreaView style={{ width: '100%', marginTop: 'auto' }}>
        <Button centered type="primary" onPress={() => router.navigate(routes.newIncome)}>
          <Text tt="uppercase" fow="$bold" col="$quaternary">
            Add Income
          </Text>
        </Button>
      </SafeAreaView>
    </View>
  )
}
