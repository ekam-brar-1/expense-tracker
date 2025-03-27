import { View, Text, TouchableOpacity, Button, StyleSheet} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState(false);

  const renderCamera = () => {
    return (
        <CameraView
          style={styles.camera}
          mode="picture"
          facing="back"
          enableTorch={flash}
          responsiveOrientationWhenOrientationLocked
        >
          {/* Camera Shutter Button */}
          <View style={styles.shutterContainer}>
            <TouchableOpacity style={styles.shutterBtn}>
              <View style={styles.shutterBtnInner} />
            </TouchableOpacity>
          </View>

          {/* Flash Button */}
          <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
            <Ionicons
              name={flash ? "flash" : "flash-off"}
              size={28}
              color="white"
            />
          </TouchableOpacity>
        </CameraView>
      );
  };

  const toggleFlash = () => {
    setFlash((prev) => !prev);
  };


  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    return(
        <View>
            <Text>Need permission placeholder</Text>
            <Button title="Request Camera Permissions" onPress={requestPermission} />
        </View>
    );
  }

  return (
    renderCamera()
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
    },
    camera: {
      flex: 1,
      width: "100%",
    },
    shutterContainer: {
      position: "absolute",
      bottom: 44,
      left: 0,
      width: "100%",
      alignItems: "center",
    },
    shutterBtn: {
      backgroundColor: "transparent",
      borderWidth: 5,
      borderColor: "white",
      width: 85,
      height: 85,
      borderRadius: 45,
      alignItems: "center",
      justifyContent: "center",
    },
    shutterBtnInner: {
      backgroundColor: "white",
      width: 70,
      height: 70,
      borderRadius: 50,
    },
    flashButton: {
      position: "absolute",
      top: 40,
      right: 20,
      backgroundColor: "rgba(0,0,0,0.5)",
      padding: 10,
      borderRadius: 25,
    },
  });
