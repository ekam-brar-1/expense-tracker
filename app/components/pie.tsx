import React from "react";
import { View, Text, StyleSheet } from "react-native";
import PieChart from "react-native-pie-chart";

type NetPieChartProps = {
  totalExpenses: number;
  totalIncome: number;
};

const NetPieChart: React.FC<NetPieChartProps> = ({
  totalExpenses,
  totalIncome,
}) => {
  const sum = totalExpenses + totalIncome;
  const netValue = totalIncome - totalExpenses;


  if (sum === 0) {
    return (
      <View style={styles.chartWrapper}>
        <Text style={styles.chartValue}>No data available</Text>
      </View>
    );
  }

  const series = [
    { value: totalExpenses, color: "#FF6B6B" },
    { value: totalIncome, color: "#2ecc71" },
  ];

  const widthAndHeight = 200;

  return (
    <View style={styles.chartWrapper}>
      <PieChart
        widthAndHeight={widthAndHeight}
        series={series}
        cover={0.6} 
      />
      <View style={styles.centerLabel}>
        <Text style={styles.netText}>Net:</Text><Text style={styles.netText}> ${netValue.toFixed(2)}</Text>
      </View>
    </View>
  );
};

export default NetPieChart;

const styles = StyleSheet.create({
  chartWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  centerLabel: {
    position: "absolute",
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  netText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  chartValue: {
    fontSize: 16,
    color: "#333",
  },
});
