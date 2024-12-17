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
  Animated,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type RootStackParamList = {
  Home: undefined;
  Multiplayer: undefined;
  Quiz: { level?: number; isQuoteQuiz?: boolean; questions?: (QuoteQuestion | LevelQuestion)[];   };
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
  const [unlockedLevels, setUnlockedLevels] = useState<number>(1);
  const [modalVisible, setModalVisible] = useState(false);
  const[isVisible, setisVisible] = useState(false)

  useEffect(() => {
    const loadUnlockedLevels = async () => {
      try {
        const savedLevels = await AsyncStorage.getItem("unlockedLevels");
        if (savedLevels) {
          setUnlockedLevels(parseInt(savedLevels, 10));
        }
      } catch (error) {
        console.error("Failed to load unlocked levels:", error);
      }
    };

    loadUnlockedLevels();
  }, []);

  const handleStartQuiz = async (level: number) => {
    if (level > unlockedLevels) {
      Alert.alert(
        "Locked Level",
        "You must unlock this level by completing the previous one."
      );
    } else {
      try {
        // Show a loading indicator while fetching questions
        setisVisible(true)
        // Fetch questions from the API
        const response = await fetch(
          `https://5jw0kp4zk5.execute-api.ap-south-1.amazonaws.com/prod?level=${level}`
        );
  
        if (!response.ok) {
          throw new Error(`Error fetching questions: ${response.status}`);
        }
  
        const data = await response.json();
  
        // Navigate to the Quiz component with the questions
        navigation.navigate("Quiz", { level, questions: data.questions });
      } catch (error) {
        setisVisible(false)
        // Handle errors
        Alert.alert("Error", `Failed to fetch questions: `);
      } finally {
        setisVisible(false)
        // Hide loading indicator

      }
    }
  };
  

  const handleGuessTheQuote = () => {
    if (unlockedLevels < 0) {
      Alert.alert(
        "Locked Feature",
        "You need to unlock Level 5 to access 'Guess the Quote.'"
      );
    } else {
      navigation.navigate("Quiz", { isQuoteQuiz: true });
    }
  };

  const handleMultiplayer = () => {
    navigation.navigate("Multiplayer");
  };



  const renderLevels = () => {
    const levels = [...Array(10)].map((_, index) => {
      const level = index + 1;
      const isLocked = level > unlockedLevels;

      return (
        <TouchableOpacity
          key={level}
          style={[
            styles.circularButton,
            isLocked ? styles.lockedButton : styles.greenButton,
          ]}
          onPress={() => handleStartQuiz(level)}
        >
          <Text style={styles.buttonText}>{level}</Text>
        </TouchableOpacity>
      );
    });

    const rows = [];
    for (let i = 0; i < levels.length; i += 5) {
      rows.push(levels.slice(i, i + 5));
    }

    return rows.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.circularButtonRow}>
        {row}
      </View>
    ));
  };

  return  (

    
    <View style={styles.container}>
       {true && (
        <Modal transparent={true} animationType="fade" visible={isVisible}>
          <View style={styles.modalBackground}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3CB371" />
              <Text style={styles.loadingText}>Starting! 🚀</Text>
            </View>
          </View>
        </Modal>
      )}

      {/* Rules Icon */}
      <TouchableOpacity
        style={styles.rulesIconContainer}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="information-circle-outline" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Circular Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require("../assets/images/app_icon.png")}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>Sitcom Quiz - Friends</Text>

      {/* Guess the Quote and Multiplayer */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.levelButton, styles.blueButton]}
          onPress={handleGuessTheQuote}
        >
          <Text >Guess the Team</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.levelButton, styles.blueButton]}
          onPress={handleMultiplayer}
        >
          <Text>Multiplayer</Text>
        </TouchableOpacity>

        



      </View>
     

      {/* Levels */}
      <View style={styles.levelsContainer}>{renderLevels()}</View>

      {/* Rules Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rules</Text>
            <Text style={styles.modalText}>
              1. You can get a maximum of 10 points per question.
            </Text>
            <Text style={styles.modalText}>
              2. The faster you answer, the more points you earn. At 10 seconds,
              points will be 10, and they decrease with time.
            </Text>
            <Text style={styles.modalText}>
              3. To move to the next level, you must score above 80%.
            </Text>
            <Text style={styles.modalText}>
              4. A new set of quotes is generated every time you play "Guess the
              Team."
            </Text>
            <Text style={styles.modalText}>
              5. Unlock level 5 to enjoy "Guess the Team" anytime, even without an internet connection! 😊
            </Text>
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
    paddingVertical: SCREEN_HEIGHT * 0.05,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
  },
  rulesIconContainer: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.03,
    right: SCREEN_WIDTH * 0.05,
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
  title: {
    fontSize: SCREEN_WIDTH * 0.08,
    fontWeight: "bold",
    color: "#f9f9f9",
    marginBottom: SCREEN_HEIGHT * 0.04,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: 50,
  },
  circularButtonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  circularButton: {
    width: SCREEN_WIDTH * 0.15,
    height: SCREEN_WIDTH * 0.15,
    borderRadius: (SCREEN_WIDTH * 0.15) / 2,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
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

  greenButton: {
    backgroundColor: "#4caf50", // Green for unlocked levels
  },
  lockedButton: {
    backgroundColor: "#cccccc", // Gray for locked levels
  },
  blueButton: {
    backgroundColor: "#ffff", // Blue for Guess the Quote and Multiplayer
  },
  buttonText: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  levelButton: {
    width: "45%",
    height: SCREEN_HEIGHT * 0.08,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  levelsContainer: {
    width: "100%",
    alignItems: "center",
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
});

