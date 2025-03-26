import { supabase } from "./supabaseclient"; // Adjust the path as needed

export type Transaction = {
  user_id: string;
  name: string;
  amount: number;
  start_date: string;
  end_date?: string | null;
  repeat?: number | null;
};

// Helper function to format a Date as "YYYY-MM-DD"
const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

/**
 * Fetches expense and income transactions for a given user within a date range.
 * Applies filters to return transactions with a start_date up to reportEndDate and either no end_date
 * or an end_date that is after or equal to reportStartDate.
 *
 * @param userId - The user's ID.
 * @param reportStartDate - The report's start date.
 * @param reportEndDate - The report's end date.
 * @returns An object containing expenseData and incomeData arrays.
 * @throws An error if any query fails.
 */
export async function fetchTransactions(
  userId: string,
  reportStartDate: Date,
  reportEndDate: Date
): Promise<{
  expenseData: Transaction[];
  incomeData: Transaction[];
}> {
  // Query for expenses:
  const { data: expenseData, error: expenseError } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", userId)
    // Compare using ISO strings (adjust if needed based on your DB column types)
    .lte("start_date", reportEndDate.toISOString())
    .or(`end_date.is.null,end_date.gte.${reportStartDate.toISOString()}`);

  // Query for income:
  const { data: incomeData, error: incomeError } = await supabase
    .from("income")
    .select("*")
    .eq("user_id", userId)
    // If your dates are stored as "YYYY-MM-DD", you might want to use formatDate
    .lte("start_date", formatDate(reportEndDate))
    .or(`end_date.is.null,end_date.gte.${formatDate(reportStartDate)}`);

  if (expenseError || incomeError) {
    console.error("Error fetching transactions:", expenseError, incomeError);
    throw new Error("Error fetching transactions");
  }
  const { data, error } = await supabase
    .from("income")
    .select("*")
    .eq("user_id", userId);
  console.log("All income for user:", data, "userid", userId);

  return {
    expenseData: expenseData ?? [],
    incomeData: incomeData ?? [],
  };
}
