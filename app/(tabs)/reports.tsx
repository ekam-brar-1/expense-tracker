import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuth } from "../auth-context";
import { fetchTransactions, Transaction } from "../../lib/fetchTransactions";

const ReportsScreen: React.FC = () => {
  const { user } = useAuth();
  // Use a date range that covers your test records.
  const [reportStartDate, setReportStartDate] = useState<Date>(
    new Date(2024, 0, 1)
  );
  const [reportEndDate, setReportEndDate] = useState<Date>(
    new Date(2025, 11, 31)
  );

  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // State hooks for the raw fetched data.
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

  /**
   * Computes the total amount contributed by a transaction within the given range.
   * (This is similar to your existing logic.)
   */
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

  /**
   * Returns an array of occurrence dates (as Date objects) for a transaction within the given range.
   * For one-time transactions (repeat=0), returns the start_date if it falls in range.
   */
  const getOccurrences = (
    transaction: Transaction,
    rangeStart: Date,
    rangeEnd: Date
  ): Date[] => {
    const occurrences: Date[] = [];
    const repeat = transaction.repeat ?? 0;
    const startDate = new Date(transaction.start_date);
    const endDate = transaction.end_date
      ? new Date(transaction.end_date)
      : null;

    if (repeat === 0) {
      if (startDate >= rangeStart && startDate <= rangeEnd) {
        occurrences.push(startDate);
      }
      return occurrences;
    }

    const effectiveEnd = endDate && endDate < rangeEnd ? endDate : rangeEnd;
    if (startDate > effectiveEnd) return occurrences;

    const msPeriod = repeat * 24 * 60 * 60 * 1000;
    let firstOccurrence: Date;
    if (startDate >= rangeStart) {
      firstOccurrence = startDate;
    } else {
      const diff = rangeStart.getTime() - startDate.getTime();
      const intervals = Math.ceil(diff / msPeriod);
      firstOccurrence = new Date(startDate.getTime() + intervals * msPeriod);
    }

    let current = firstOccurrence;
    while (current <= effectiveEnd) {
      occurrences.push(new Date(current));
      current = new Date(current.getTime() + msPeriod);
    }
    return occurrences;
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
    <ScrollView contentContainerStyle={styles.container}>
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
        <>
          <View style={styles.totalsContainer}>
            <Text style={styles.totalText}>
              Total Expenses: {totalExpenses}
            </Text>
            <Text style={styles.totalText}>Total Income: {totalIncome}</Text>
            <Text style={styles.totalText}>
              Net: {totalIncome - totalExpenses}
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Expenses</Text>
            {expenseData.length === 0 ? (
              <Text style={styles.emptyText}>No expenses found.</Text>
            ) : (
              expenseData.map((exp, index) => {
                const occurrences = getOccurrences(
                  exp,
                  reportStartDate,
                  reportEndDate
                );
                return (
                  <View key={index} style={styles.item}>
                    <Text style={styles.itemText}>
                      {exp.name}: ${exp.amount}
                    </Text>
                    <Text style={styles.itemSubText}>
                      First Date: {formatDate(new Date(exp.start_date))}
                    </Text>
                    {exp.repeat && exp.repeat > 0 && occurrences.length > 0 && (
                      <View style={styles.occurrenceContainer}>
                        <Text style={styles.occurrenceHeader}>
                          Occurrences:
                        </Text>
                        {occurrences.map((date, idx) => (
                          <Text key={idx} style={styles.occurrenceText}>
                            {formatDate(date)}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Income</Text>
            {incomeData.length === 0 ? (
              <Text style={styles.emptyText}>No income found.</Text>
            ) : (
              incomeData.map((inc, index) => {
                const occurrences = getOccurrences(
                  inc,
                  reportStartDate,
                  reportEndDate
                );
                return (
                  <View key={index} style={styles.item}>
                    <Text style={styles.itemText}>
                      {inc.name}: ${inc.amount}
                    </Text>
                    <Text style={styles.itemSubText}>
                      First Date: {formatDate(new Date(inc.start_date))}
                    </Text>
                    {inc.repeat && inc.repeat > 0 && occurrences.length > 0 && (
                      <View style={styles.occurrenceContainer}>
                        <Text style={styles.occurrenceHeader}>
                          Occurrences:
                        </Text>
                        {occurrences.map((date, idx) => (
                          <Text key={idx} style={styles.occurrenceText}>
                            {formatDate(date)}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default ReportsScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "white",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  dateContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  dateInput: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    marginVertical: 5,
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  totalsContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  totalText: {
    fontSize: 18,
    marginVertical: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  item: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 6,
    marginBottom: 6,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  itemSubText: {
    fontSize: 14,
    color: "#666",
  },
  occurrenceContainer: {
    marginTop: 6,
    paddingLeft: 8,
  },
  occurrenceHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  occurrenceText: {
    fontSize: 14,
    color: "#555",
  },
  emptyText: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    color: "#666",
  },
});
