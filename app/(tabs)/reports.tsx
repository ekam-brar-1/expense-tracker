import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuth } from "../auth-context";
import { fetchTransactions, Transaction } from "../../lib/fetchTransactions";

const reportsScreen: React.FC = () => {
  const { user } = useAuth();
  const [reportStartDate, setReportStartDate] = useState<Date>(
    new Date(2024, 0, 1)
  );
  const [reportEndDate, setReportEndDate] = useState<Date>(
    new Date(2025, 11, 31)
  );

  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // Optional: Keep the raw fetched data in state for debugging
  const [expenseData, setExpenseData] = useState<Transaction[]>([]);
  const [incomeData, setIncomeData] = useState<Transaction[]>([]);

  const [showStartDatePicker, setShowStartDatePicker] =
    useState<boolean>(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [reportStartDate, reportEndDate, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (!user) return;
      const { expenseData, incomeData } = await fetchTransactions(
        user.id,
        reportStartDate,
        reportEndDate
      );

      setExpenseData(expenseData);
      setIncomeData(incomeData);

      // Calculate totals (using your existing logic)
      const totalExpensesCalc = expenseData.reduce((sum, exp: Transaction) => {
        return (
          sum + computeTransactionTotal(exp, reportStartDate, reportEndDate)
        );
      }, 0);
      const totalIncomeCalc = incomeData.reduce((sum, inc: Transaction) => {
        return (
          sum + computeTransactionTotal(inc, reportStartDate, reportEndDate)
        );
      }, 0);

      setTotalExpenses(totalExpensesCalc);
      setTotalIncome(totalIncomeCalc);
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  };

  const computeTransactionTotal = (
    transaction: Transaction,
    rangeStart: Date,
    rangeEnd: Date
  ): number => {
    const amount = transaction.amount;
    const repeat = transaction.repeat ?? 0;
    const startDate = new Date(transaction.start_date);
    const endDate = transaction.end_date
      ? new Date(transaction.end_date)
      : null;

    if (endDate && endDate < rangeStart) return 0;
    if (startDate > rangeEnd) return 0;

    if (repeat === 0) {
      return startDate >= rangeStart && startDate <= rangeEnd ? amount : 0;
    }

    const effectiveEnd = endDate && endDate < rangeEnd ? endDate : rangeEnd;
    const msPeriod = repeat * 24 * 60 * 60 * 1000;
    if (startDate > effectiveEnd) return 0;

    let diffToRangeStart = rangeStart.getTime() - startDate.getTime();
    let n = diffToRangeStart > 0 ? Math.ceil(diffToRangeStart / msPeriod) : 0;
    const firstOccurrenceMs = startDate.getTime() + n * msPeriod;
    const firstOccurrence = new Date(firstOccurrenceMs);
    if (firstOccurrence > effectiveEnd) return 0;

    const diff = effectiveEnd.getTime() - firstOccurrenceMs;
    const occurrences = 1 + Math.floor(diff / msPeriod);
    return occurrences * amount;
  };

  const formatDate = (date: Date): string => date.toISOString().split("T")[0];

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) setReportStartDate(selectedDate);
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) setReportEndDate(selectedDate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Reports</Text>
      <View style={styles.dateContainer}>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowStartDatePicker(true)}
        >
          <Text style={styles.dateText}>
            Start Date: {formatDate(reportStartDate)}
          </Text>
        </TouchableOpacity>
        {showStartDatePicker && (
          <DateTimePicker
            value={reportStartDate}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={handleStartDateChange}
          />
        )}
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowEndDatePicker(true)}
        >
          <Text style={styles.dateText}>
            End Date: {formatDate(reportEndDate)}
          </Text>
        </TouchableOpacity>
        {showEndDatePicker && (
          <DateTimePicker
            value={reportEndDate}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={handleEndDateChange}
          />
        )}
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#333" />
      ) : (
        <View style={styles.totalsContainer}>
          <Text style={styles.totalText}>Total Expenses: {totalExpenses}</Text>
          <Text style={styles.totalText}>Total Income: {totalIncome}</Text>
          <Text style={styles.totalText}>
            Net: {totalIncome - totalExpenses}
          </Text>
        </View>
      )}
    </View>
  );
};

export default reportsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "white" },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  dateContainer: { marginBottom: 20, alignItems: "center" },
  dateInput: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    marginVertical: 5,
  },
  dateText: { fontSize: 16, color: "#333" },
  totalsContainer: { alignItems: "center" },
  totalText: { fontSize: 18, marginVertical: 8 },
});
