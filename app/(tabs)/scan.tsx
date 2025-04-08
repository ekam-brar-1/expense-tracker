import { View, Text, TouchableOpacity, Button, StyleSheet, Alert, ActivityIndicator} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState(false);
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processingToken, setProcessingToken] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  //helper function to implement wait
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  //this function uploads the reciept to tabscanner api (function > supabase edge function > tabscanner) and returns the id for the scanned reciept
  //need another function to call the results endpoint with receipt id to get the results
  const uploadImage = async () => {
    if (!uri) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: 'reciept.jpg',
        type: 'image/jpeg',
      } as any);

      const response = await fetch(
        'https://fzqovfkwzunvgxjmtfob.supabase.co/functions/v1/super-task', 
        {
          method: 'POST',
          body: formData,
        },
      );

      const data = await response.json();
      if (data.error) throw data.error;
      
      console.log(data.token)
      setProcessingToken(data.token);
      await sleep (10000)
      setUploading(false)
      checkResult(data.token);

    } catch(error) {
      Alert.alert('Upload Failed', error.message);
      setUploading(false)
    } 
  }

  // Add result checking logic
  const checkResult = async (token: string) => {
    try {
      const response = await fetch(`https://fzqovfkwzunvgxjmtfob.supabase.co/functions/v1/hyper-service?token=${token}`);
      const result = await response.json();
      setIsProcessing(false);
      setScanResult(result);
      Alert.alert('Scan Complete', 'Receipt processed successfully');
    } catch (error) {
      setIsProcessing(false);
      Alert.alert('Processing Error', error.message);
      }
  };
    
    


  const takePicture = async () => {
    const photo = await ref.current?.takePictureAsync();
    setUri(photo?.uri);
  };

  const renderPicture = () => {
    return (
      <View style={styles.previewContainer}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri }}
            contentFit="contain"
            style={styles.previewImage}
          />
          {scanResult && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>
              Total: ${scanResult.result.total?.toFixed(2)}
            </Text>
            <Text style={styles.resultText}>
              Date: {new Date(scanResult.result.date).toLocaleDateString()}
            </Text>
            <Text style={styles.resultText}>
              Merchant: {scanResult.result.establishment}
            </Text>
          </View>
        )}
          {isProcessing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.processingText}>Processing...</Text>
          </View>
        )}
        </View>
        
        <View style={styles.buttonGroup}>
          <Button 
            onPress={() => {
              setUri(null);
              setProcessingToken(null);
              setScanResult(null);
            }} 
            title="Retake" 
            disabled={uploading || isProcessing}
          />
          <Button
            onPress={uploadImage}
            title={uploading ? "Uploading..." : "Upload"}
            disabled={uploading || isProcessing}
          />
        </View>

          
      </View>
    );
  };

  const renderCamera = () => {
    return (
        <CameraView
          style={styles.camera}
          ref = {ref}
          mode="picture"
          facing="back"
          enableTorch={flash}
          responsiveOrientationWhenOrientationLocked
        >
          {/* Camera Shutter Button */}
          <View style={styles.shutterContainer}>
            <TouchableOpacity style={styles.shutterBtn} onPress={takePicture}>
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
    <View style={styles.container}>
      {uri ? renderPicture() : renderCamera()}
    </View>
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
    previewContainer: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      padding: 20,
    },
    imageContainer: {
      flex: 1,
      width: '100%',
      marginBottom: 20,
    },
    previewImage: {
      width: '100%',
      aspectRatio: 1,
    },
    buttonGroup: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      gap: 20,
    },
    processingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    processingText: {
      color: 'white',
      marginTop: 10,
    },
    resultContainer: {
      marginTop: 20,
      padding: 15,
      backgroundColor: '#f0f0f0',
      borderRadius: 10,
      width: '100%',
    },
    resultText: {
      fontSize: 16,
      marginVertical: 4,
    },
  });
