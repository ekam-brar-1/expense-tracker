import { supabase } from "./supabaseclient";

export type Transaction = {
  user_id: string;
  name: string;
  amount: number;
  start_date: string;
  end_date?: string | null;
  repeat?: number | null;
};

const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

export async function fetchTransactions(
  userId: string,
  reportStartDate: Date,
  reportEndDate: Date
): Promise<{
  expenseData: Transaction[];
  incomeData: Transaction[];
}> {
  const { data: expenseData, error: expenseError } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", userId)

    .lte("start_date", reportEndDate.toISOString())
    .or(`end_date.is.null,end_date.gte.${reportStartDate.toISOString()}`);

  const { data: incomeData, error: incomeError } = await supabase
    .from("income")
    .select("*")
    .eq("user_id", userId)

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
