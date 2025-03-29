"use client";
import { View, Text, Image, TouchableOpacity, Switch, Button, StyleSheet, Alert} from "react-native";
import React, { useState, useEffect } from "react";
import { useAuth } from "../auth-context";
import { supabase } from "../../lib/supabaseclient";


export default function ProfileScreen() {
    const { user} = useAuth();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const { logout } = useAuth();
    const [firstName, setFirstName] = useState<string>("");

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
    

    const handleDeleteAccount = () => {
        // TODO
    };

    const handleLogout = async () => {
        try {
          await logout();
        } catch (error: any) {
          Alert.alert('Logout Error', error.message)
        };
    };
    

    return(
        <View style={styles.container}>
            
            {/* Profile Header  */}
            <View style={styles.profileHeader}>
                <Image 
                    style={styles.profileImage}
                    source={require("../../assets/account-icon.png")}
                />
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{firstName|| "Placeholder"}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                    
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutButtonText}>LOGOUT</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Settings Section  */}
            <View style={styles.section}>
                
                <View style={styles.sectionHeading}>
                  <Image style={styles.iconImage} source={require("../../assets/account-icon.png")}/>
                  <Text style={styles.sectionTitle}>Settings</Text>
                </View>
                
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Language</Text>
                  <Text style={styles.dropdown}>English</Text>
                </View>
                <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Dark Mode</Text>
                    <Switch
                        value={isDarkMode}
                        onValueChange={() => setIsDarkMode(!isDarkMode)}
                    />
                </View>
            </View>

            {/* Account Section  */}
            <View style={styles.section}>
                  <View style={styles.sectionHeading}>
                      <Image style={styles.iconImage} source={require("../../assets/account-icon.png")}/>
                      <Text style={styles.sectionTitle}>Account</Text>
                  </View>

                <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Delete Account</Text>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleDeleteAccount}>
                        <Text style={styles.logoutButtonText}>DELETE</Text>
                    </TouchableOpacity>
                </View>
                
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      padding: 16,
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
      paddingBottom: 16,
      borderWidth: 1,        
      borderColor: '#E0E0E0',
      borderRadius: 8,
      padding: 10
    },
    profileImage: {
      width: 80,
      height: 80,
      borderRadius: 30,
      marginRight: 12,
    },
    iconImage: {
      width: 30,
      height: 30,
      marginRight: 2,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#000000',
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 14,
      color: '#777777',
      marginBottom: 10,
    },
    logoutButton: {
      backgroundColor: '#FF4D4D',
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 6,
      alignSelf: 'flex-start' 
    },
    logoutButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '500',
    },
    section: {
      marginBottom: 24,
      padding: 16,
      borderWidth: 1,         
      borderColor: '#E0E0E0',
      borderRadius: 8, 
      backgroundColor: '#FFFFFF',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
    },
    sectionHeading: {
      flexDirection: 'row',
      marginBottom: 10,
      alignItems: 'center',
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      backgroundColor:'#F1F1F1',
      borderRadius: 5,
      padding: 5
    },
    settingLabel: {
      fontSize: 14,
      color: '#333333',
    },
    dropdown: {
      fontSize: 14,
      color: '#333333',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 4,
    },
  });