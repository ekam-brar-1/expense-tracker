import { View, Text, TouchableOpacity, Button, StyleSheet} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();

  const renderCamera = () => {
    return (
        <CameraView
          style={styles.camera}
          mode="picture"
          facing="back"
          responsiveOrientationWhenOrientationLocked
        >
        </CameraView>
      );
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
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 30,
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
      width: 70,
      height: 70,
      borderRadius: 50,
    },
  });
