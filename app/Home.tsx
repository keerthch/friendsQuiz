import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  Modal,
  SafeAreaView,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type RootStackParamList = {
  Home: undefined;
  Challenge: undefined;
  Multiplayer: undefined;
  Quiz: { level?: number; isQuoteQuiz?: boolean; questions?: (QuoteQuestion | LevelQuestion)[] };
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
  const [levelModalVisible, setLevelModalVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [level, setLevel] = useState<number | null>(null);
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


  const handleStartQuiz = async (level: number) => {
    if (level > unlockedLevels && level < 11) {
      Alert.alert(
        "Locked Level",
        "You must unlock this level by completing the previous one."
      );
    } else {
      try {
        setLevel(level);
        setIsVisible(true);

        const response = await fetch(
          `https://5jw0kp4zk5.execute-api.ap-south-1.amazonaws.com/prod?level=${level}`
        );

        if (!response.ok) {
          throw new Error(`Error fetching questions: ${response.status}`);
        }

        const data = await response.json();

        navigation.navigate("Quiz", { level, questions: data.questions });
      } catch (error) {
        Alert.alert("Error", "Failed to fetch questions.");
      } finally {
        setLevelModalVisible(false); 
        setIsVisible(false);
      }
    }
  };

  const handleWeeklyChallenge = () => {
   
      navigation.navigate("Challenge");
 
  };

  const handleMultiplayer = () => {
    navigation.navigate("Multiplayer");
  };

  const handleRandomOpponent = () => {
    const possibleLevels = [15, 16, 17, 18];
    const randomLevel = possibleLevels[Math.floor(Math.random() * possibleLevels.length)];
    handleStartQuiz(randomLevel);
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
          onPress={() => {
      
            if (!isLocked) {
              setLevelModalVisible(false)
              console.log("Closing modal and starting quiz for level:", level);
              console.log("Closing modal and starting quiz for level:", modalVisible);       
              handleStartQuiz(level);
            }
          }}
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



  return (

    

    
    <View style={styles.container}>
        
      {isVisible && (
        <Modal transparent={true} animationType="fade" visible={isVisible}>
          <View style={styles.modalBackground}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3CB371" />
              <Text style={styles.loadingText}>
                {(level === 15 || level === 16 || level === 17 || level === 18)
                  ? "Finding player... 🔍"
                  : "Starting! 🚀"}
              </Text>
            </View>
          </View>
        </Modal>
      )}
      <SafeAreaView style={styles.container}></SafeAreaView>

      {/* Rules Icon */}
      <TouchableOpacity
        style={styles.rulesIconContainer}
        onPress={() => setModalVisible(true)} // Show the modal
      >
        <Ionicons name="information-circle-outline" size={30} color="#fff" />
      </TouchableOpacity>

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
              3. To move to the next level, you must score above 70%.
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


      
  
      <View style={styles.imageContainer}>
    <Image
      source={require("../assets/images/ipl.png")}
      style={styles.image}
      resizeMode="cover"
    />
  </View>

  {/* Title */}
  <Text style={styles.title}>IPL Quiz</Text>

  {/* Buttons */}
  <View style={styles.cardContainer}>
    <View style={styles.row}>
      <TouchableOpacity style={styles.card} onPress={handleWeeklyChallenge}>
        <Image
          source={require("../assets/images/weekly.png")}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <Text style={styles.cardText}>Event</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={handleMultiplayer}>
        <Image
          source={require("../assets/images/multiplayer.png")}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <Text style={styles.cardText}>Multiplayer</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.row}>
      <TouchableOpacity style={styles.card} onPress={handleRandomOpponent}>
        <Image
          source={require("../assets/images/random.png")}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <Text style={styles.cardText}>Battle</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => setLevelModalVisible(true)}>
        <Image
          source={require("../assets/images/single.png")}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <Text style={styles.cardText}>Solo</Text>
      </TouchableOpacity>
    </View>
  </View>




      {/* Levels Modal */}
      <Modal
        visible={levelModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setLevelModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Level</Text>
            <View style={styles.levelsContainer}>{renderLevels()}</View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setLevelModalVisible(false)}
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

  cardContainer: {
    width: "90%",
    marginTop: SCREEN_HEIGHT * 0.03, // Space between the title and buttons
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-evenly", // Ensures even distribution
    alignItems: "center", // Centers buttons along the cross-axis
    width: "100%",
    marginBottom: 20,
    

  },
  

  card: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  cardImage: {
    width: 100, // Adjust size as needed
    height: 100, // Adjust size as needed
    borderRadius: 40, // Make it circular
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
    color: "white"
  },
  imageButton: {
    width: "38%", // Two buttons per row
    aspectRatio: 1, // Ensures square shape
    borderRadius: 100,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  
  image: {
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'stretch', // Ensures the image covers the entire screen
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
    paddingVertical: SCREEN_HEIGHT * 0.05,
  },
  rulesIconContainer: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.03,
    right: SCREEN_WIDTH * 0.05,
  },
  imageContainer: {
    width: SCREEN_WIDTH * 0.55,
    height: SCREEN_WIDTH * 0.55,
    borderRadius: (SCREEN_WIDTH * 0.55) / 2, // Ensures perfect circular shape
    overflow: "hidden",
    backgroundColor: "#333",
    marginBottom: SCREEN_HEIGHT * 0.02, // Adds space below the image container
    justifyContent: "center", // Centers any child content inside the container
    alignItems: "center", // Centers any child content inside the container
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.070,
    fontWeight: "bold",
    color: "#f9f9f9",
    marginBottom: 25, // Reduced margin
    textAlign: "center",
    fontFamily: "Montserrat_900Black",
  },

  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap", // Allows buttons to wrap to the next line if needed
    justifyContent: "space-evenly", // Distribute buttons evenly
    alignItems: "center", // Center buttons along the cross-axis
    width: "100%",
    marginBottom: 50,
    paddingHorizontal: 0,
  },
  circularButtonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  circularButton: {
    width: SCREEN_WIDTH * 0.12,
    height: SCREEN_WIDTH * 0.12,
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
  bottomContainer: {
    flex: 0,
    justifyContent: 'flex-end',
    paddingBottom: 25, // Space at the bottom
    marginTop: 10, 

   
  },
  
  levelButton: {
    width: "22%", // Adjust width for better spacing
    height: SCREEN_WIDTH * 0.15,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#4caf50", // Green for unlocked levels
    marginBottom: 15, // Add vertical spacing between rows
  },
  

  levelsContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20, // Add spacing below levels
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Transparent black background
  },
  modalContent: {
    width: '90%', // Increase the width of the modal
    maxHeight: '80%', // Allow more space vertically
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: "#fff",
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