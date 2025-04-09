
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, Button } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';
import { supabase } from '../../lib/supabaseclient'; // Adjust the import path as needed
import { useAuth } from '../auth-context';


const formatDate = (date: Date): string => {
  return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
};

export default function AskAI() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const API_KEY =
    Constants.manifest?.extra?.GEMINI_API_KEY || Constants.expoConfig?.extra?.GEMINI_API_KEY;
 console.log('API_KEY:', API_KEY); 
  const fetchMonthlyTransactions = async (userId: string) => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    
    const { data: expenseData, error: expenseError } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .gte('start_date', oneMonthAgo.toISOString())
      .order('start_date', { ascending: false });

    if (expenseError) {
      console.error('Error fetching expenses:', expenseError);
    }

    const { data: incomeData, error: incomeError } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', userId)
      .gte('start_date', oneMonthAgo.toISOString())
      .order('start_date', { ascending: false });

    if (incomeError) {
      console.error('Error fetching incomes:', incomeError);
    }

    return {
      expenses: expenseData || [],
      incomes: incomeData || [],
    };
  };

  
  const buildTransactionsList = (transactions: any[], type: string): string => {
    if (transactions.length === 0) {
      return `No ${type} transactions in the past month.`;
    }
    return transactions
      .map((tx) => {
        const date = formatDate(new Date(tx.start_date));
        return `- Date: ${date}, Amount: $${tx.amount}, Description: ${tx.name}`;
      })
      .join('\n');
  };

  const askGemini = async () => {
    if (!question.trim() || !user) return;
    setLoading(true);

    try {
      
      const { expenses, incomes } = await fetchMonthlyTransactions(user.id);

     
      const expensesList = buildTransactionsList(expenses, 'expense');
      const incomesList = buildTransactionsList(incomes, 'income');
 console.log('Expenses:', expensesList);
        console.log('Incomes:', incomesList);
     
      const promptText = `You are a personal expense assistant. Below is the user's transaction data from the past month:

Income Transactions:
${incomesList}

Expense Transactions:
${expensesList}

Based on this information and the following user question: "${question}",
word limit: 300
please provide advice in plain text on how the user can improve their expense management and financial planning.`;

      const result = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          contents: [
            {
              parts: [{ text: promptText }],
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const aiText =
        result.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';
      setResponse(aiText);
    } catch (error: any) {
      console.error('Gemini error:', error.response?.data || error.message);
      setResponse(
        'Something went wrong while talking to Gemini: ' +
          (error.response?.data?.error?.message || error.message)
      );
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Ask AI About Your Expenses</Text>
      <TextInput
        style={styles.input}
        placeholder="Type your question..."
        value={question}
        onChangeText={setQuestion}
        multiline
      />
      <Button
        title={loading ? 'Thinking...' : 'Ask AI'}
        onPress={askGemini}
        disabled={loading}
      />
      <Text style={styles.response}>{response}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 50,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    minHeight: 80,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  response: {
    marginTop: 20,
    fontSize: 16,
  },
});
