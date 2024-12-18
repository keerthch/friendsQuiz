import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  Modal,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type RootStackParamList = {
  Home: undefined;
  Multiplayer: undefined;
  Quiz: {
    level?: number;
    isQuoteQuiz?: boolean;
    questions?: (QuoteQuestion | LevelQuestion)[];
  };
  Results: { score: number; total: number; level?: number };
};
type QuoteQuestion = {
  quote: string;
  correctAnswer: string;
};

type LevelQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
};

export default function Home({ navigation }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [isVisible, setisVisible] = useState(false);

  useEffect(() => {
    const loadUnlockedLevels = async () => {
      try {
        const savedLevels = await AsyncStorage.getItem("unlockedLevels");
        if (savedLevels) {
        }
      } catch (error) {
        console.error("Failed to load unlocked levels:", error);
      }
    };

    loadUnlockedLevels();
  }, []);

  const handleButtonPress = (buttonName: string) => {
    switch (buttonName) {
      case "Guess the Team":
        navigation.navigate("Quiz", { isQuoteQuiz: true });
        break;
      case "Multiplayer":
        navigation.navigate("Multiplayer");
        break;
      case "Guess the Song":
        Alert.alert("Feature Coming Soon", "Guess the Song is under development!");
        break;
      case "Random Opponent":
        Alert.alert("Feature Coming Soon", "Random Opponent is under development!");
        break;
    }
  };

  const renderButtons = () => {
    const buttons = ["Guess the Team", "Multiplayer", "Single Player", "Random Opponent"];
    return (
      <View style={styles.buttonGrid}>
        {buttons.map((buttonName, index) => (
          <TouchableOpacity
            key={index}
            style={styles.curvedButton}
            onPress={() => handleButtonPress(buttonName)}
          >
            <Text style={styles.buttonText}>{buttonName}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isVisible && (
        <Modal transparent={true} animationType="fade" visible={isVisible}>
          <View style={styles.modalBackground}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3CB371" />
              <Text style={styles.loadingText}>Starting! 🚀</Text>
            </View>
          </View>
        </Modal>
      )}
      

      
      {/* Circular Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require("../assets/images/icon.png")}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

       {/* Title */}
       <Text style={styles.title}>IPL Trivia Quiz</Text>
      {renderButtons()}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rules</Text>
            <Text style={styles.modalText}>1. You can get a maximum of 10 points per question.</Text>
            <Text style={styles.modalText}>
              2. The faster you answer, the more points you earn.
            </Text>
            <Text style={styles.modalText}>3. To move to the next level, you must score above 85%.</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
    paddingVertical: SCREEN_HEIGHT * 0.05,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
  },
  imageContainerFullWidth: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.6,
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  imageFullWidth: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.08,
    fontWeight: "bold",
    color: "#f9f9f9",
    marginBottom: SCREEN_HEIGHT * 0.02,
    textAlign: "center",
  },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    width: "100%",
    marginTop: 50,
  },
  curvedButton: {
    width: SCREEN_WIDTH * 0.35,
    height: SCREEN_WIDTH * 0.35,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    borderRadius: 20,
  },
  buttonText: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  loadingContainer: {
    padding: 20,
    backgroundColor: "#333",
    borderRadius: 10,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#3CB371",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContent: {
    width: SCREEN_WIDTH * 0.8,
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  modalText: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: "#ccc",
    textAlign: "center",
    marginVertical: 5,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#4caf50",
  },
  closeButtonText: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: "#fff",
    fontWeight: "bold",
  },
  imageContainer: {
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_WIDTH * 0.5,
    borderRadius: (SCREEN_WIDTH * 0.5) / 2,
    overflow: "hidden",
    backgroundColor: "#333",
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
