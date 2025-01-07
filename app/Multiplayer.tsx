import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";

const androidAdmobBanner = "ca-app-pub-8141886191578873/5682247727";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type QuoteQuestion = {
  quote: string;
  correctAnswer: string;
};

type QuizType = 'single' | 'multiplayer' | 'quote';

type LevelQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
};

type RootStackParamList = {
  Home: undefined;
  Multiplayer: undefined;
  Quiz: { 
    level?: number; 
    isQuoteQuiz?: boolean; 
    questions?: (QuoteQuestion | LevelQuestion)[] | null; 
    roomId?: string; 
    quizType: QuizType; // Add this property
    playerName: string;
  };
  Results: { score: number; total: number; level?: number; points: number };
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Multiplayer">;
};

export default function Multiplayer({ navigation }: Props) {
  const [playerName, setPlayerName] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [questions, setQuestions] = useState<(QuoteQuestion | LevelQuestion)[] | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null); // State for countdown
  const [modalVisible, setModalVisible] = useState(false);
  const[isVisible, setisVisible] = useState(false)

  const handleCreateRoom = async () => {
    if (!playerName) {
      Alert.alert("Error", "Please enter your name to create a room.");
      return;
    }

    try {
      const response = await fetch(
        "https://ywy4ojcgcl.execute-api.ap-south-1.amazonaws.com/prod/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create", playerName }),
        }
      );

      
      const data = await response.json();
      if (data.success) {
        setRoomId(data.roomId); // Save the room ID
        setQuestions(data.questions); // Save questions
        setIsModalVisible(true); // Show the modal
        startPolling(data.roomId); // Start polling to check for second player
      } else {
        Alert.alert("Error", data.message || "Failed to create room.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "An error occurred while creating the room.");
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName || !roomId) {
      Alert.alert("Error", "Please enter your name and room ID to join.");
      return;
    }
  
    try {
      const response = await fetch(
        "https://ywy4ojcgcl.execute-api.ap-south-1.amazonaws.com/prod/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "join", playerName, roomId }),
        }
      );
  
      const data = await response.json();
  
      if (data.success) {
        setisVisible(true); // Show the modal
            // Wait for 3 seconds, then navigate
        setTimeout(() => {
            setisVisible(false); // Hide the modal
            navigation.navigate("Quiz", {
            questions: data.questions,
            roomId,
            quizType: "multiplayer",
            playerName: playerName,
            });
        }, 3000); // Display for 3 seconds
      } else {
        Alert.alert("Error", data.message || "Failed to josin room.");
      }
    } catch (error) {
      console.error(error);
      setisVisible(false); //
      Alert.alert("Error", "An error occurred while joining the room.");
    }
  };
  

  const startPolling = (roomId : string) => {

    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          "https://ywy4ojcgcl.execute-api.ap-south-1.amazonaws.com/prod/",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "checkStatus", roomId }),
          }
        );
        const data = await response.json();
    
        if (data.success && data.playerJoined) {
          // Stop polling when the second player joins
          if (pollingInterval) clearInterval(pollingInterval);
          setPollingInterval(null);

          // Navigate to Quiz with questions
          setIsModalVisible(false)
          navigation.navigate("Quiz", { questions: data.questions || [], roomId, quizType: "multiplayer",playerName: playerName });
        }
      } catch (error) {
        console.error("Error polling room status:", error);
      }
    }, 15000); // Poll every 15 seconds

    setPollingInterval(interval);
  };

  useEffect(() => {
    return () => {
      // Cleanup polling interval on component unmount
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [pollingInterval]);


  return (
    <View style={styles.container}>

       {true && (
        <Modal transparent={true} animationType="fade" visible={isVisible}>
          <View style={styles.modalBackground}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#98FB98" />
              <Text style={styles.loadingText}>Starting in 3! 🚀</Text>
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
      {/* Main Content */}
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={playerName}
        onChangeText={setPlayerName}
      />
  
      <TextInput
        style={styles.input}
        placeholder="Room ID (Only for Join Room)"
        value={roomId}
        onChangeText={setRoomId}
        keyboardType="numeric"
      />
  
      <View style={styles.buttonRow}>
        <View style={styles.iconContainer}>
          <TouchableOpacity
            style={styles.circularButton}
            onPress={handleCreateRoom}
          >
            <Ionicons name="add" size={SCREEN_WIDTH * 0.08} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.iconLabel}>Create Room</Text>
        </View>
        <View style={styles.iconContainer}>
        <TouchableOpacity
          style={styles.circularButton1}
          onPress={() => navigation.navigate("Home")}
        >
          <Ionicons name="home" size={20} color="#fff" />
          <Text style={styles.buttonLabel}>Home</Text>
        </TouchableOpacity>
        </View>
  
        <View style={styles.iconContainer}>
          <TouchableOpacity
            style={styles.circularButton}
            onPress={handleJoinRoom}
          >
            <Ionicons name="log-in" size={SCREEN_WIDTH * 0.08} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.iconLabel}>Join Room</Text>
        </View>
      </View>
  
      {/* Countdown Display */}
      {countdown !== null && (
        <Text style={{ fontSize: 24, textAlign: "center", marginTop: 20, color: "#fff" }}>
          Starting in {countdown}...
        </Text>
      )}
  
    {/* Room Details Modal */}
<Modal
  animationType="slide"
  transparent={true}
  visible={isModalVisible}
  onRequestClose={() => setIsModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      {/* Cancel Button */}
      <Ionicons
        name="close-circle"
        size={SCREEN_WIDTH * 0.06}
        color="#ADD8E6"
        style={styles.cancelIcon}
        onPress={() => setIsModalVisible(false)}
      />
      <Text style={styles.roomIdText}>ID: {roomId} </Text>
      <Text style={styles.roomIdText1}>Invite your friend to join the game with the above ID</Text>
      <Ionicons
        name="person-circle"
        size={SCREEN_WIDTH * 0.15}
        color="#fff"
        style={styles.icon}
      />
      <Text style={styles.playerText}>{playerName}</Text>
      <Text style={styles.waitingText}>Your opponent is on their way...</Text>
    </View>
  </View>
</Modal>

  
      {/* Ad Container */}
      <View style={styles.adContainer}>
        <BannerAd
          unitId={androidAdmobBanner}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          onAdFailedToLoad={(error) =>
            console.error("Ad failed to load: ", error)
          }
        />
      </View>

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
              1.Create Room 🏠: Player 1 enters their name and clicks "Create Room." A unique Room ID is generated. Share it with Player 2.
            </Text>
            <Text style={styles.modalText}>
              2. Join Room 🤝: Player 2 enters their name and the shared Room ID, then clicks "Join Room."
            </Text>
            <Text style={styles.modalText}>
              3. Start Quiz 🎯: Once both players join, the quiz begins. Compete and see who scores higher! 🏆
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
  input: {
    width: "80%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
    fontSize: SCREEN_WIDTH * 0.045,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  iconContainer: {
    alignItems: "center",
  },
  cancelIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#1a1a2e', // Matches modal background
    borderRadius: 20,       // Makes it circular
    padding: 2,             // Adds spacing around the icon
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  circularButton: {
    width: SCREEN_WIDTH * 0.2,
    height: SCREEN_WIDTH * 0.2,
    borderRadius: (SCREEN_WIDTH * 0.2) / 2,
    backgroundColor: "#123456",
    justifyContent: "center",
    alignItems: "center",
  },
  iconLabel: {
    marginTop: 10,
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: "bold",
    color: "#fff",
  },
  loadingContainer: {
    padding: 20,
    backgroundColor: "#333",
    borderRadius: 10,
    alignItems: "center",
  },
  circularButton1: {
    width: 60,
    height: 60,
    borderRadius: 40,
    backgroundColor: "#123456",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  buttonLabel: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
    marginTop: 4,
  },
  loadingText: {
    marginTop: 10,
    color: "#98FB98",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
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
  modalContent: {
    width: "80%",
    padding: 15,
    backgroundColor: "#1a1a2e",
    borderRadius: 15,
    alignItems: "center",
  },
  roomIdText: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: "bold",
    color: "#ADD8E6",
    marginBottom: 10,
  },
  roomIdText1: {
    fontSize: SCREEN_WIDTH * 0.030,
    color: "#ADD8E6",
    marginBottom: 10,
  },
  playerText: {
    fontSize: SCREEN_WIDTH * 0.05,
    color: "#ADD8E6",
    marginBottom: 10,
  },
  waitingText: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: "#ADD8E6",
    marginBottom: 10,
  },
  icon: {
    marginBottom: 10,
    color: "#ADD8E6",
  },
  adContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    alignItems: "center",
  },
});
