"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "../../lib/supabaseclient";
import { useRouter } from "expo-router";
import { useAuth } from "../auth-context";

// Define types outside of the component
type Transaction = {
  id?: string; // Add ID field for better tracking
  user_id: number;
  name: string;
  amount: number;
  start_date: string;
  creation_date: string;
  type: "expense" | "income";
  repeat?: number;
};

type RepeatOption = {
  label: string;
  value: number;
};

// Constants moved outside component
const REPEAT_OPTIONS: RepeatOption[] = [
  { label: "No", value: 0 },
  { label: "Daily", value: 1 },
  { label: "Weekly", value: 7 },
  { label: "Bi-Weekly", value: 14 },
  { label: "Monthly", value: 30 },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // State management
  const [firstName, setFirstName] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    date: new Date(),
    repeat: "",
  });
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [isRepeatModalVisible, setRepeatModalVisible] =
    useState<boolean>(false);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Format date helper
  const formatDate = (selectedDate: Date): string => {
    return selectedDate.toISOString().split("T")[0];
  };

  // Fetch user data
  const fetchUserFirstName = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("user_details")
        .select("first_name")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setFirstName(data?.first_name || "User");
    } catch (error) {
      console.error("Error fetching user first name:", error);
      setFirstName("User");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch transactions
  const fetchRecentTransactions = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Fetch expenses
      const { data: expenses, error: expensesError } = await supabase
        .from("expenses")
        .select("user_id, name, amount, start_date, creation_date, repeat")
        .eq("user_id", user.id)
        .order("creation_date", { ascending: false })
        .limit(3);

      if (expensesError) throw expensesError;

      // Fetch income
      const { data: income, error: incomeError } = await supabase
        .from("income")
        .select("user_id, name, amount, start_date, creation_date, repeat")
        .eq("user_id", user.id)
        .order("creation_date", { ascending: false })
        .limit(3);

      if (incomeError) throw incomeError;

      // Process and combine data
      const expensesWithType = expenses.map((item) => ({
        ...item,
        type: "expense" as const,
        creation_date: item.creation_date,
      }));

      const incomeWithType = income.map((item) => ({
        ...item,
        type: "income" as const,
        creation_date: item.creation_date,
      }));

      // Sort and limit combined results
      const combined = [...expensesWithType, ...incomeWithType]
        .sort(
          (a, b) =>
            new Date(b.creation_date).getTime() -
            new Date(a.creation_date).getTime()
        )
        .slice(0, 3);

      setRecentTransactions(combined);
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
      Alert.alert("Error", "Failed to load recent transactions");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial data loading
  useEffect(() => {
    fetchUserFirstName();
    fetchRecentTransactions();
  }, [fetchUserFirstName, fetchRecentTransactions]);

  // Form input handlers
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleInputChange("date", selectedDate);
    }
  };

  const handleRepeatSelect = (option: RepeatOption): void => {
    handleInputChange("repeat", option.label);
    setRepeatModalVisible(false);
  };

  // Form submission
  const validateForm = (): boolean => {
    const { name, amount, date } = formData;

    if (!name.trim() || !amount.trim() || !date) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return false;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid positive number.");
      return false;
    }

    if (!user) {
      Alert.alert("Authentication Error", "You must be logged in to continue.");
      return false;
    }

    return true;
  };

  const handleAddTransaction = async (
    type: "expense" | "income"
  ): Promise<void> => {
    if (!validateForm()) return;

    setIsLoading(true);
    const { name, amount, date, repeat } = formData;
    const parsedAmount = parseFloat(amount);

    // Find repeat value from selected option
    const selectedRepeat = REPEAT_OPTIONS.find(
      (option) => option.label === repeat
    );
    const repeatValue = selectedRepeat ? selectedRepeat.value : 0;

    try {
      const { error } = await supabase
        .from(type === "expense" ? "expenses" : "income")
        .insert({
          user_id: user?.id,
          name: name.trim(),
          amount: parsedAmount,
          start_date: formatDate(date),
          repeat: repeatValue,
        });

      if (error) throw error;

      // Reset form and refresh data
      setFormData({
        name: "",
        amount: "",
        date: new Date(),
        repeat: "",
      });

      fetchRecentTransactions();
      Alert.alert(
        "Success",
        `${type === "expense" ? "Expense" : "Income"} added successfully.`
      );
    } catch (error: any) {
      console.error(`Error adding ${type}:`, error);
      Alert.alert(
        "Error",
        error.message || `Failed to add ${type}. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Helper for transaction display
  const getRepeatLabel = (value: number): string => {
    const option = REPEAT_OPTIONS.find((opt) => opt.value === value);
    return option?.label || "No";
  };

  // UI Components
  const renderTransactionCard = (transaction: Transaction, index: number) => {
    const uniqueKey =
      transaction.id ||
      `${transaction.type}-${index}-${new Date(
        transaction.creation_date
      ).getTime()}`;
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
            {repeatLabel !== "No" ? repeatLabel : "One-time"} {transaction.name}
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
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Logo and welcome section */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/spendsavvy.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.welcomeText}>Welcome, {firstName}</Text>
        </View>

        {/* Form section */}
        <View style={styles.inputSection}>
          {/* Name input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Name:</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleInputChange("name", value)}
              placeholder="Enter name"
              placeholderTextColor="#888"
            />
          </View>

          {/* Amount input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Amount:</Text>
            <TextInput
              style={styles.input}
              value={formData.amount}
              onChangeText={(value) => handleInputChange("amount", value)}
              placeholder="Enter amount"
              placeholderTextColor="#888"
              keyboardType="numeric"
            />
          </View>

          {/* Date picker */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Date:</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.inputText}>{formatDate(formData.date)}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={formData.date}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>

          {/* Repeat selector */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Repeat:</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setRepeatModalVisible(true)}
            >
              <Text style={styles.inputText}>
                {formData.repeat || "Select"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Repeat options modal */}
          <Modal
            transparent={true}
            visible={isRepeatModalVisible}
            animationType="fade"
            onRequestClose={() => setRepeatModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Select Repeat Option</Text>
                {REPEAT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.label}
                    style={styles.modalOption}
                    onPress={() => handleRepeatSelect(option)}
                  >
                    <Text style={styles.modalOptionText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setRepeatModalVisible(false)}
                >
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.expenseButton}
              onPress={() => handleAddTransaction("expense")}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Add Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.incomeButton}
              onPress={() => handleAddTransaction("income")}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Add Income</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent transactions section */}
        <View style={styles.recentTransactionsSection}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>

          {isLoading && recentTransactions.length === 0 ? (
            <Text style={styles.loadingText}>Loading transactions...</Text>
          ) : recentTransactions.length > 0 ? (
            recentTransactions.map((transaction, index) =>
              renderTransactionCard(transaction, index)
            )
          ) : (
            <Text style={styles.noTransactionsText}>
              No recent transactions found
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Existing styles...
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  logoContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  logo: {
    width: 150,
    height: 150,
  },
  welcomeText: {
    fontSize: 18,
    color: "#333",
    marginTop: 10,
  },
  inputSection: {
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    color: "#333",
    marginBottom: 5,
    marginLeft: 10,
  },
  input: {
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    justifyContent: "center",
  },
  inputText: {
    fontSize: 16,
    color: "#333",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  expenseButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flex: 0.48,
  },
  incomeButton: {
    backgroundColor: "#2ecc71",
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flex: 0.48,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalOption: {
    width: "100%",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
    alignItems: "center",
  },
  modalOptionText: {
    fontSize: 16,
  },
  modalCancelButton: {
    marginTop: 15,
    width: "100%",
    padding: 15,
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
  },
  modalCancelButtonText: {
    color: "red",
    fontWeight: "bold",
  },
  recentTransactionsSection: {
    marginTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
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
  },
  removeButton: {
    backgroundColor: "#FF0000",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 5,
  },
  removeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  noTransactionsText: {
    textAlign: "center",
    color: "#888",
    padding: 20,
  },
  loadingText: {
    textAlign: "center",
    color: "#888",
    padding: 20,
  },
});
