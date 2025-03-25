"use client";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { supabase } from "../lib/supabaseclient";
import { useRouter } from "expo-router";

// Icons (you'll need to replace these with actual icon imports)
const GroceryIcon = () => (
  <View style={styles.iconContainer}>
    <Image source={require("../assets/grocery-icon.png")} style={styles.icon} />
  </View>
);

export default function HomeScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [repeat, setRepeat] = useState("");

  const handleAddExpense = () => {
    // Implement add expense logic
    console.log("Adding Expense:", { name, amount, date, repeat });
  };

  const handleAddIncome = () => {
    // Implement add income logic
    console.log("Adding Income:", { name, amount, date, repeat });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Logo and Welcome */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/spendsavvy.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.welcomeText}>Welcome, John</Text>
        </View>

        {/* Input Fields */}
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
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="Select date"
              placeholderTextColor="#888"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Repeat:</Text>
            <TextInput
              style={styles.input}
              value={repeat}
              onChangeText={setRepeat}
              placeholder="Select repeat"
              placeholderTextColor="#888"
            />
          </View>

          {/* Action Buttons */}
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

        {/* Recently Added Section */}
        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>Recently added Expense/Income:</Text>
          <View style={styles.recentItem}>
            <View style={styles.recentItemLeft}>
              <GroceryIcon />
              <View>
                <Text style={styles.recentItemTitle}>Grocery</Text>
                <Text style={styles.recentItemSubtitle}>Freshco</Text>
                <Text style={styles.recentItemDate}>12-2-25</Text>
              </View>
            </View>
            <View style={styles.recentItemRight}>
              <Text style={styles.expenseAmount}>- $1000</Text>
              <TouchableOpacity style={styles.removeButton}>
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNavigation}>
          <TouchableOpacity style={styles.navItem}>
            <Image
              source={require("../assets/home-icon.png")}
              style={styles.navIcon}
            />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Image
              source={require("../assets/graph-icon.png")}
              style={styles.navIcon}
            />
            <Text style={styles.navText}>Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Image
              source={require("../assets/scan-icon.png")}
              style={styles.navIcon}
            />
            <Text style={styles.navText}>Scan Receipt</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Image
              source={require("../assets/account-icon.png")}
              style={styles.navIcon}
            />
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>
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
    height: 75,
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
  recentSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  recentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    padding: 15,
  },
  recentItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 15,
    backgroundColor: "#2ecc71",
    borderRadius: 8,
    padding: 10,
  },
  icon: {
    width: 30,
    height: 30,
  },
  recentItemTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  recentItemSubtitle: {
    color: "#666",
  },
  recentItemDate: {
    color: "#999",
    fontSize: 12,
  },
  recentItemRight: {
    alignItems: "flex-end",
  },
  expenseAmount: {
    color: "red",
    fontWeight: "bold",
    marginBottom: 5,
  },
  removeButton: {
    backgroundColor: "red",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  removeButtonText: {
    color: "white",
    fontSize: 12,
  },
  bottomNavigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#f1f1f1",
    paddingVertical: 10,
  },
  navItem: {
    alignItems: "center",
  },
  navIcon: {
    width: 25,
    height: 25,
  },
  navText: {
    fontSize: 12,
    marginTop: 5,
  },
});
