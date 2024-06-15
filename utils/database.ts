import { TIncome } from '@/types/income.ts'
import * as SQLite from 'expo-sqlite/next'

const dbName = 'incomeMonitor.db'

export const initDB = async () => {
  const db = await SQLite.openDatabaseAsync(dbName)

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS incomes (
      id INTEGER PRIMARY KEY NOT NULL,
      incomeDate TEXT NOT NULL,
      amount REAL NOT NULL,
      exchangeRate REAL NOT NULL,
      currency TEXT NOT NULL,
      amountInUah REAL NOT NULL,
      esvTax REAL,
      epTax REAL NOT NULL,
      taxesSum REAL NOT NULL,
      amountAfterTaxes REAL NOT NULL
    );
	`)
}

export const getIncome = async (incomeId: TIncome['id']) => {
  const db = await SQLite.openDatabaseAsync(dbName)

  return await db.getFirstAsync<TIncome>(
    `
    SELECT * FROM incomes WHERE id = $incomeId
	`,
    {
      $incomeId: incomeId,
    }
  )
}

export const getPaginatedIncomes = async (page: number = 1, pageSize: number) => {
  const db = await SQLite.openDatabaseAsync(dbName)
  const skip = (page - 1) * pageSize

  const statement = await db.prepareAsync(`
		SELECT * FROM incomes
			ORDER BY incomeDate DESC
			LIMIT $pageSize
			OFFSET $skip;
	`)

  try {
    const result = await statement.executeAsync<TIncome>({ $pageSize: pageSize, $skip: skip })
    const incomes = await result.getAllAsync()

    return incomes
  } finally {
    await statement.finalizeAsync()
  }
}

export const createIncome = async (payload: Omit<TIncome, 'id'>) => {
  const db = await SQLite.openDatabaseAsync(dbName)

  const statement = await db.prepareAsync(
    `
    INSERT INTO incomes (
			incomeDate,
			amount,
			exchangeRate,
			currency,
			amountInUah,
			esvTax,
			epTax,
			taxesSum,
			amountAfterTaxes
		)
    VALUES (
			$incomeDate,
			$amount,
			$exchangeRate,
			$currency,
			$amountInUah,
			$esvTax,
			$epTax,
			$taxesSum,
			$amountAfterTaxes
		)
	`
  )

  try {
    await statement.executeAsync({
      $incomeDate: payload.incomeDate,
      $amount: payload.amount,
      $exchangeRate: payload.exchangeRate,
      $currency: payload.currency,
      $amountInUah: payload.amountInUah,
      $esvTax: payload.esvTax,
      $epTax: payload.epTax,
      $taxesSum: payload.taxesSum,
      $amountAfterTaxes: payload.amountAfterTaxes,
    })
  } catch (err) {
    console.log('err', err)
  } finally {
    await statement.finalizeAsync()
  }
}

export const updateIncome = async (incomeId: TIncome['id'], payload: Omit<TIncome, 'id'>) => {
  const db = await SQLite.openDatabaseAsync(dbName)

  const statement = await db.prepareAsync(`
    UPDATE incomes
    SET
			incomeDate = $incomeDate,
			amount = $amount,
			exchangeRate = $exchangeRate,
			currency = $currency,
			amountInUah = $amountInUah,
			esvTax = $esvTax,
			epTax = $epTax,
			taxesSum = $taxesSum,
			amountAfterTaxes = $amountAfterTaxes
    WHERE
			id = $incomeId
  `)

  try {
    await statement.executeAsync({
      $incomeId: incomeId,
      $incomeDate: payload.incomeDate,
      $amount: payload.amount,
      $exchangeRate: payload.exchangeRate,
      $currency: payload.currency,
      $amountInUah: payload.amountInUah,
      $esvTax: payload.esvTax,
      $epTax: payload.epTax,
      $taxesSum: payload.taxesSum,
      $amountAfterTaxes: payload.amountAfterTaxes,
    })
  } catch (err) {
    console.log('err', err)
  } finally {
    await statement.finalizeAsync()
  }
}

export const deleteIncome = async (incomeId: TIncome['id']) => {
  const db = await SQLite.openDatabaseAsync(dbName)

  await db.runAsync(
    `
    DELETE FROM incomes WHERE id = $incomeId
	`,
    {
      $incomeId: incomeId,
    }
  )
}
