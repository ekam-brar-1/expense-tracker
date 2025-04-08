"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { supabase } from "../lib/supabaseclient";
import { useRouter } from "expo-router";
import { useAuth } from "./auth-context";

type Transaction = {
  expense_id?: string;
  income_id?: string;
  user_id: number;
  name: string;
  amount: number;
  start_date: string;
  end_date?: string;
  creation_date: string;
  type: "expense" | "income";
  repeat?: number;
};

const REPEAT_OPTIONS = [
  { label: "No", value: 0 },
  { label: "Daily", value: 1 },
  { label: "Weekly", value: 7 },
  { label: "Bi-Weekly", value: 14 },
  { label: "Monthly", value: 30 },
];

export default function AllTransactionsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const getRepeatLabel = (value: number): string => {
    const option = REPEAT_OPTIONS.find((opt) => opt.value === value);
    return option?.label || "No";
  };

  const fetchAllTransactions = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data: expenses } = await supabase
        .from("expenses")
        .select(
          "expense_id, user_id, name, amount, start_date, end_date, creation_date, repeat"
        )
        .eq("user_id", user.id)
        .order("creation_date", { ascending: false });

      const { data: income } = await supabase
        .from("income")
        .select(
          "income_id, user_id, name, amount, start_date, end_date, creation_date, repeat"
        )
        .eq("user_id", user.id)
        .order("creation_date", { ascending: false });

      const expensesWithType = (expenses || []).map((item) => ({
        ...item,
        type: "expense" as const,
      }));

      const incomeWithType = (income || []).map((item) => ({
        ...item,
        type: "income" as const,
      }));

      const combined = [...expensesWithType, ...incomeWithType].sort(
        (a, b) =>
          new Date(b.creation_date).getTime() -
          new Date(a.creation_date).getTime()
      );

      setTransactions(combined);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      Alert.alert("Error", "Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const deleteTransaction = async (transaction: Transaction) => {
    if (!user) return;

    setIsDeleting(true);
    try {
      if (transaction.type === "expense" && transaction.expense_id) {
        await supabase
          .from("expenses")
          .delete()
          .eq("expense_id", transaction.expense_id);
      } else if (transaction.type === "income" && transaction.income_id) {
        await supabase
          .from("income")
          .delete()
          .eq("income_id", transaction.income_id);
      }

      setTransactions((current) =>
        current.filter((t) => {
          if (t.type === "expense" && transaction.type === "expense") {
            return t.expense_id !== transaction.expense_id;
          }
          if (t.type === "income" && transaction.type === "income") {
            return t.income_id !== transaction.income_id;
          }
          return true;
        })
      );

      Alert.alert("Success", "Transaction deleted successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to delete transaction");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete ${transaction.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => deleteTransaction(transaction),
          style: "destructive",
        },
      ]
    );
  };

  useEffect(() => {
    fetchAllTransactions();
  }, [fetchAllTransactions]);

  const renderTransactionCard = (transaction: Transaction, index: number) => {
    const uniqueKey =
      transaction.type === "expense"
        ? `expense-${transaction.expense_id}-${index}`
        : `income-${transaction.income_id}-${index}`;

    const repeatLabel = getRepeatLabel(transaction.repeat || 0);

    return (
      <View key={uniqueKey} style={styles.transactionCard}>
        <View style={styles.transactionIconContainer}>
          <View
            style={[
              styles.iconBackground,
              transaction.type === "expense"
                ? styles.expenseIconBg
                : styles.incomeIconBg,
            ]}
          >
            <Text style={styles.iconText}>$</Text>
          </View>
        </View>

        <View style={styles.transactionDetails}>
          <Text style={styles.transactionName}>{transaction.name}</Text>
          <Text style={styles.transactionSubtext}>
            {repeatLabel !== "No" ? repeatLabel : "One-time"} {transaction.type}
          </Text>
        </View>

        <View style={styles.transactionRightContainer}>
          <Text
            style={[
              styles.transactionAmount,
              transaction.type === "expense"
                ? styles.expenseText
                : styles.incomeText,
            ]}
          >
            {transaction.type === "expense" ? "-" : "+"} $
            {transaction.amount.toFixed(2)}
          </Text>
          <Text style={styles.transactionDate}>{transaction.start_date}</Text>
          {transaction.end_date && (
            <Text style={styles.transactionDate}>
              to {transaction.end_date}
            </Text>
          )}

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteTransaction(transaction)}
            disabled={isDeleting}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Transactions</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a6da7" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {transactions.length > 0 ? (
            transactions.map((transaction, index) =>
              renderTransactionCard(transaction, index)
            )
          ) : (
            <Text style={styles.noTransactionsText}>No transactions found</Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    color: "#4a6da7",
    fontSize: 16,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 50, // To balance the header
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#888",
  },
  transactionCard: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 15,
    marginBottom: 15,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  transactionIconContainer: {
    marginRight: 15,
  },
  iconBackground: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  expenseIconBg: {
    backgroundColor: "#86BBF9",
  },
  incomeIconBg: {
    backgroundColor: "#7ED957",
  },
  iconText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
  },
  transactionDetails: {
    flex: 1,
    justifyContent: "center",
  },
  transactionName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  transactionSubtext: {
    fontSize: 14,
    color: "#888",
  },
  transactionRightContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  expenseText: {
    color: "#FF0000",
  },
  incomeText: {
    color: "#2ecc71",
  },
  transactionDate: {
    fontSize: 14,
    color: "#888",
    marginBottom: 6,
  },
  deleteButton: {
    backgroundColor: "#FF0000",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  noTransactionsText: {
    textAlign: "center",
    color: "#888",
    padding: 20,
  },
});
