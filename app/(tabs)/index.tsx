"use client";
import React, { useState, useEffect } from "react";
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

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [firstName, setFirstName] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [repeat, setRepeat] = useState<string>("");
  const [isRepeatModalVisible, setRepeatModalVisible] =
    useState<boolean>(false);

  useEffect(() => {
    const fetchUserFirstName = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("user_details")
          .select("first_name")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        if (data) {
          setFirstName(data.first_name || "User");
        }
      } catch (error) {
        console.error("Error fetching user first name:", error);
        setFirstName("User");
      }
    };

    fetchUserFirstName();
  }, [user]);

  const repeatOptions: string[] = [
    "No",
    "Daily",
    "Weekly",
    "Bi-Weekly",
    "Monthly",
  ];

  const repeatValueMap: { [key: string]: number } = {
    No: 0,
    Daily: 1,
    Weekly: 2,
    "Bi-Weekly": 3,
    Monthly: 4,
  };

  const formatDate = (selectedDate: Date): string => {
    return selectedDate.toISOString().split("T")[0];
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const handleAddExpense = async (): Promise<void> => {
    // Validate inputs
    if (!name || !amount || !date) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // Validate user is logged in
    if (!user) {
      Alert.alert("Error", "You must be logged in to add expenses");
      return;
    }

    try {
      const { error } = await supabase.from("expenses").insert({
        user_id: user.id,
        name: name,
        amount: parseFloat(amount),
        start_date: formatDate(date),
        repeat: repeatValueMap[repeat] || 0,
      });

      if (error) throw error;

      // Clear inputs after successful submission
      setName("");
      setAmount("");
      setDate(new Date());
      setRepeat("");

      Alert.alert("Success", "Expense added successfully");
    } catch (error) {
      console.error("Error adding expense:", error);
      Alert.alert("Error", "Failed to add expense");
    }
  };

  const handleAddIncome = async (): Promise<void> => {
    // Validate inputs
    if (!name || !amount || !date) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // Validate user is logged in
    if (!user) {
      Alert.alert("Error", "You must be logged in to add income");
      return;
    }

    try {
      const { error } = await supabase.from("income").insert({
        user_id: user.id,
        name: name,
        amount: parseFloat(amount),
        start_date: formatDate(date),
        repeat: repeatValueMap[repeat] || 0,
      });

      if (error) throw error;

      // Clear inputs after successful submission
      setName("");
      setAmount("");
      setDate(new Date());
      setRepeat("");

      Alert.alert("Success", "Income added successfully");
    } catch (error) {
      console.error("Error adding income:", error);
      Alert.alert("Error", "Failed to add income");
    }
  };

  const handleRepeatSelect = (option: string): void => {
    setRepeat(option);
    setRepeatModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/spendsavvy.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.welcomeText}>Welcome, {firstName}</Text>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Name:</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter name"
              placeholderTextColor="#888"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Amount:</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
              placeholderTextColor="#888"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Date:</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.inputText}>{formatDate(date)}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Repeat:</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setRepeatModalVisible(true)}
            >
              <Text style={styles.inputText}>{repeat || "Select"}</Text>
            </TouchableOpacity>
          </View>

          <Modal
            transparent={true}
            visible={isRepeatModalVisible}
            animationType="fade"
            onRequestClose={() => setRepeatModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Select Repeat Option</Text>
                {repeatOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.modalOption}
                    onPress={() => handleRepeatSelect(option)}
                  >
                    <Text style={styles.modalOptionText}>{option}</Text>
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

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.expenseButton}
              onPress={handleAddExpense}
            >
              <Text style={styles.buttonText}>Add Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.incomeButton}
              onPress={handleAddIncome}
            >
              <Text style={styles.buttonText}>Add Income</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
});
