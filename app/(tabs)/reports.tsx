import React, { useState, useEffect } from "react";
import { LogBox } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "../auth-context";
import NetPieChart from "../components/pie";
import { fetchTransactions, Transaction } from "../../lib/fetchTransactions";

const ReportsScreen: React.FC = () => {
  const { user } = useAuth();

  // Date range
  const DateBeforeAWeek= new Date();
  DateBeforeAWeek.setDate(DateBeforeAWeek.getDate() - 7);
  const [reportStartDate, setReportStartDate] = useState<Date>(DateBeforeAWeek); // 7 days ago
  const [reportEndDate, setReportEndDate] = useState<Date>(new Date());

  // Totals
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [totalIncome, setTotalIncome] = useState<number>(0);

  // Fetched data
  const [expenseData, setExpenseData] = useState<Transaction[]>([]);
  const [incomeData, setIncomeData] = useState<Transaction[]>([]);
LogBox.ignoreAllLogs(true);
  // Loading state
  const [loading, setLoading] = useState<boolean>(false);

  // Date picker visibility
  const [showStartDatePicker, setShowStartDatePicker] = useState<boolean>(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState<boolean>(false);

  // Toggle between Expense and Income
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");

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

      // Calculate totals
      const totalExpensesCalc = expenseData.reduce((sum, exp) => {
        return sum + computeTransactionTotal(exp, reportStartDate, reportEndDate);
      }, 0);

      const totalIncomeCalc = incomeData.reduce((sum, inc) => {
        return sum + computeTransactionTotal(inc, reportStartDate, reportEndDate);
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
    const endDate = transaction.end_date ? new Date(transaction.end_date) : null;

    if (endDate && endDate < rangeStart) return 0;
    if (startDate > rangeEnd) return 0;

    if (repeat === 0) {
      return startDate >= rangeStart && startDate <= rangeEnd ? amount : 0;
    }

    const effectiveEnd = endDate && endDate < rangeEnd ? endDate : rangeEnd;
    if (startDate > effectiveEnd) return 0;

    const msPeriod = repeat * 24 * 60 * 60 * 1000;
    let diffToRangeStart = rangeStart.getTime() - startDate.getTime();
    let n = diffToRangeStart > 0 ? Math.ceil(diffToRangeStart / msPeriod) : 0;
    const firstOccurrenceMs = startDate.getTime() + n * msPeriod;
    const firstOccurrence = new Date(firstOccurrenceMs);
    if (firstOccurrence > effectiveEnd) return 0;

    const diff = effectiveEnd.getTime() - firstOccurrenceMs;
    const occurrences = 1 + Math.floor(diff / msPeriod);
    return occurrences * amount;
  };

  const getOccurrences = (
    transaction: Transaction,
    rangeStart: Date,
    rangeEnd: Date
  ): Date[] => {
    const occurrences: Date[] = [];
    const repeat = transaction.repeat ?? 0;
    const startDate = new Date(transaction.start_date);
    const endDate = transaction.end_date ? new Date(transaction.end_date) : null;

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

  const formatDate = (date: Date): string => {
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  };

  const handleStartDateChange = (_event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) setReportStartDate(selectedDate);
  };

  const handleEndDateChange = (_event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) setReportEndDate(selectedDate);
  };

  const currentData = activeTab === "expense" ? expenseData : incomeData;
  const netValue = totalIncome - totalExpenses;

  return (
    <ScrollView style={styles.container}>
      {/* DATE ROW */}
      <View style={styles.dateRow}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowStartDatePicker(true)}
        >
          <Text style={styles.dateText}>
            Start Date: 
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.dateText}>
              {formatDate(reportStartDate)}
            </Text>
            <Ionicons name="calendar" size={20} color="#333" />
          </View>
          {showStartDatePicker && (
            <DateTimePicker
              value={reportStartDate}
              mode="date"
              display="default"
              onChange={handleStartDateChange}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowEndDatePicker(true)}
        >
          <Text style={styles.dateText}>
            End Date: 
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.dateText}>
              {formatDate(reportEndDate)}
            </Text>
            <Ionicons name="calendar" size={20} color="#333" />
          </View>
          {showEndDatePicker && (
            <DateTimePicker
            value={reportEndDate}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
          />
        )}
        </TouchableOpacity>
      </View>

      {/* PIE CHART */}
      <View style={styles.chartContainer}>
        <NetPieChart totalExpenses={totalExpenses} totalIncome={totalIncome} />
      </View>

      {/* TOTALS */}
      <View style={styles.totalsContainer}>
        <Text style={styles.totalText}>Total Expenses: {totalExpenses}</Text>
        <Text style={styles.totalText}>Total Income: {totalIncome}</Text>
        <Text style={styles.totalText}>Net: {netValue}</Text>
      </View>

      {/* TAB TOGGLE */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "expense" && styles.tabButtonActiveExpense,
          ]}
          onPress={() => setActiveTab("expense")}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "expense" && styles.tabButtonTextActive,
            ]}
          >
            Expense
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "income" && styles.tabButtonActiveIncome,
          ]}
          onPress={() => setActiveTab("income")}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "income" && styles.tabButtonTextActive,
            ]}
          >
            Income
          </Text>
        </TouchableOpacity>
      </View>

      {/* LIST OF TRANSACTIONS */}
      {loading ? (
        <ActivityIndicator size="large" color="#333" style={{ marginTop: 20 }} />
      ) : (
        <ScrollView style={styles.listContainer}>
          {currentData.length === 0 ? (
            <Text style={styles.emptyText}>
              No {activeTab === "expense" ? "expenses" : "income"} found.
            </Text>
          ) : (
            currentData.map((item, index) => {
              const occurrences = getOccurrences(item, reportStartDate, reportEndDate);
              return (
                <View key={index} style={styles.itemContainer}>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>
                      {item.name}: ${item.amount}
                    </Text>
                    <Text style={styles.itemDate}>
                      First Date: {formatDate(new Date(item.start_date))}
                    </Text>
                    {item.repeat && occurrences.length > 0 && (
                      <View style={styles.occurrenceContainer}>
                        <Text style={styles.occurrenceHeader}>Occurrences:</Text>
                        {occurrences.map((date, idx) => (
                          <Text key={idx} style={styles.occurrenceText}>
                            {formatDate(date)}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.itemAmount,
                      activeTab === "expense"
                        ? styles.expenseAmount
                        : styles.incomeAmount,
                    ]}
                  >
                    {activeTab === "expense" ? "-" : "+"}${item.amount}
                  </Text>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </ScrollView>
  );
};

export default ReportsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
   
    marginTop: 50,
  },
  dateButton: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: "space-between",
  },
  dateText: {
    fontSize: 14,
    color: "#333",
    alignSelf: "center",
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  totalsContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  totalText: {
    fontSize: 16,
    marginVertical: 2,
    fontWeight: "600",
    color: "#333",
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#f1f1f1",
    marginHorizontal: 4,
    borderRadius: 25,
    alignItems: "center",
  },
  tabButtonActiveExpense: {
    backgroundColor: "#FF6B6B",
  },
  tabButtonActiveIncome: {
    backgroundColor: "#2ecc71",
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  tabButtonTextActive: {
    color: "#fff",
  },
  listContainer: {
    marginTop: 10,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginVertical: 10,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f9f9f9",
    marginBottom: 10,
    borderRadius: 10,
    padding: 12,
  },
  itemDetails: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 14,
    color: "#666",
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  expenseAmount: {
    color: "#FF6B6B",
  },
  incomeAmount: {
    color: "#2ecc71",
  },
  occurrenceContainer: {
    marginTop: 6,
    paddingLeft: 8,
  },
  occurrenceHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  occurrenceText: {
    fontSize: 14,
    color: "#555",
  },
});
