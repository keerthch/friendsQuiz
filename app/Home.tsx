import React, { useEffect, useState } from "react";
import {
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
  Quiz: { level?: number; isQuoteQuiz?: boolean };
  Results: { score: number; total: number; level?: number };
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
};

export default function Home({ navigation }: Props) {
  const [unlockedLevels, setUnlockedLevels] = useState<number>(1);
  const [modalVisible, setModalVisible] = useState(false);

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

  const handleStartQuiz = (level: number) => {
    if (level > unlockedLevels) {
      Alert.alert(
        "Locked Level",
        "You must unlock this level by completing the previous one."
      );
    } else {
      navigation.navigate("Quiz", { level });
    }
  };

  const handleGuessTheQuote = () => {
    navigation.navigate("Quiz", { isQuoteQuiz: true });
  };

  const renderLevels = () => {
    const levels = [...Array(5)].map((_, index) => {
      const level = index + 1;
      const isLocked = level > unlockedLevels;

      return (
        <TouchableOpacity
          key={level}
          style={[
            styles.levelButton,
            isLocked ? styles.lockedButton : styles.unlockedButton,
          ]}
          onPress={() => handleStartQuiz(level)}
        >
          <Text style={styles.levelText}>{`Level ${level}`}</Text>
        </TouchableOpacity>
      );
    });

    const rows = [];
    for (let i = 0; i < levels.length; i += 2) {
      rows.push(levels.slice(i, i + 2));
    }

    return rows.map((row, rowIndex) => (
      <View
        key={rowIndex}
        style={[
          styles.row,
          row.length === 1 ? { justifyContent: "center" } : {},
        ]}
      >
        {row}
      </View>
    ));
  };

  return (
    <View style={styles.container}>
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
          source={require("../assets/images/friends.png")}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>Friends TV Show Quiz!</Text>

      {/* Guess the Quote */}
      <TouchableOpacity
        style={[styles.levelButton, styles.unlockedButton, styles.quoteButton]}
        onPress={handleGuessTheQuote}
      >
        <Text style={styles.levelText}>Guess the Quote</Text>
      </TouchableOpacity>

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
              1. You can get a maximum of 30 points per question.
            </Text>
            <Text style={styles.modalText}>
              2. The faster you answer, the more points you earn. At 30 seconds,
              points will be 30, and they decrease with time.
            </Text>
            <Text style={styles.modalText}>
              3. To move to the next level, you must score above 90%.
            </Text>
            <Text style={styles.modalText}>
              4. A new set of quotes is generated every time you play "Guess the Quote."
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
    marginBottom: SCREEN_HEIGHT * 0.02,
    textAlign: "center",
  },
  levelsContainer: {
    width: "100%",
    alignItems: "center",
  },
  quoteButton: {
    marginBottom: SCREEN_HEIGHT * 0.05,
    marginTop: SCREEN_HEIGHT * 0.02,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: SCREEN_HEIGHT * 0.02,
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
  unlockedButton: {
    backgroundColor: "#4caf50",
  },
  lockedButton: {
    backgroundColor: "#cccccc",
  },
  levelText: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: "bold",
    color: "#fff",
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
