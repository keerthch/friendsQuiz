import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  ImageBackground,
  Dimensions,
  Linking
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";

const androidAdmobBanner = "ca-app-pub-8141886191578873/6310845835";
const androidInterstitialAd = "ca-app-pub-8141886191578873/5723304857";


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type RootStackParamList = {
  Home: undefined;
  Challenge: undefined;
  Multiplayer: undefined;
  Quiz: {
    level?: number;
    isQuoteQuiz?: boolean;
    questions?: (QuoteQuestion | LevelQuestion)[];
  };
  Results: { score: number; total: number; level?: number; name: string; email: string };
  Leaderboard: {type: string};
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
  navigation: NativeStackNavigationProp<RootStackParamList, "Challenge">;
};


const Challenge = ({ navigation }: Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const [isVisible, setIsVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchStoredData = async () => {
      try {
        const storedName = await AsyncStorage.getItem("name");
        const storedEmail = await AsyncStorage.getItem("email");
        if (storedName && storedEmail) {
          setName(storedName);
          setEmail(storedEmail);
          setIsFormSubmitted(true);
        }
      } catch (error) {
        console.error("Error fetching stored data:", error);
      }
    };

    fetchStoredData();
  }, []);

  const handleFormSubmit = async () => {
    if (!name || !email) {
      Alert.alert("Error", "Please fill in both name and email.");
      return;
    }

    try {
      const response = await fetch(
        `https://z94udtqgs9.execute-api.ap-south-1.amazonaws.com/prod?level=${200}&name=${name}`
      );

      const data = await response.json();
      if (data.message && data.message.includes("already exist")) {
        alert("A player with this name already exists. Please choose a different username.");
        return; // Exit the function after showing the alert
      } else  {
        await AsyncStorage.setItem("name", name);
        await AsyncStorage.setItem("email", email);

      }

  
      setIsFormSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      Alert.alert("Error", "Failed to submit form. Please try again.");
    }
  };
  const backgroundImage = require('../assets/images/weekly.png');

  const fetchQuestions = async () => {
    try {
      setIsVisible(true);
      const response = await fetch(
        
        `https://z94udtqgs9.execute-api.ap-south-1.amazonaws.com/prod?level=${200}&name=${name}`
      );

      const data = await response.json();
      if (data.message && data.message.includes("already played 10 times")) {
        alert("You’ve already played 10 times. Please come back next week!");
        return; // Exit the function after showing the alert
      }
      

        // Check if the response status is not OK
      if (!response.ok) {
      if (response.status === 400) {
      // Parse the error response JSON
      const errorData = await response.json();

      // Check if the message contains the specific error
      if (errorData.message && errorData.message.includes("already played 10 times")) {
        alert("You’ve already played 10 times. Please come back next week!");
        return; // Exit the function after showing the alert
      }
    }
  }
     
  

  
      navigation.navigate("Quiz", { level: 100, questions: data.questions });
    } catch (error) {
      console.error("Error fetching questions:", error);
      Alert.alert("Error", "Failed to fetch questions. Please try again.");
    } finally  {
      setIsVisible(false);
    }
  };

  const handleStartQuiz = () => {
    fetchQuestions();
  };

  const handleWeeklyLeaderboard = () => {
    navigation.navigate("Leaderboard", { type: "weekly" });
  };

  const handlePointsLeaderboard = () => {
    navigation.navigate("Leaderboard", { type: "points" });
  };

  const startFadeAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (isFormSubmitted) {
      startFadeAnimation();
    }
  }, [isFormSubmitted]);



    return (

        <ImageBackground source={backgroundImage} style={styles.backgroundImage}>



          
          {/* Rules Icon */}
          <TouchableOpacity
            style={styles.rulesIconContainer}
            onPress={() => setModalVisible(true)} // Show the modal
          >
            <Ionicons name="information-circle-outline" size={30} color="#fff" />
          </TouchableOpacity>
      
        
          {/* Main Content */}
          <View style={styles.container}>

          {isVisible && (
        <Modal transparent={true} animationType="fade" visible={isVisible}>
          <View style={styles.modalBackground}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3CB371" />
              <Text style={styles.loadingText}>
                  "Starting! 🚀"
              </Text>
            </View>
          </View>
        </Modal>
      )}
            {!isFormSubmitted ? (
              <>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                />
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                />
                <Text style={styles.note}>
                  The same email will be used to contact you regarding any prizes or
                  awards. Please ensure it is correct.
                </Text>
                <Button title="Submit" onPress={handleFormSubmit} />
              </>
            ) : (
              <Animated.View style={{ opacity: fadeAnim, alignItems: "center" }}>
                <Text style={styles.successMessage}>
                  Welcome back, {name}!
                </Text>
                <View style={styles.rectangularButtonContainer}>
                  <TouchableOpacity
                    style={[styles.rectangularButton, styles.weeklyLeaderboardButton]}
                    onPress={handleWeeklyLeaderboard}
                  >
                    <Text style={styles.rectangularButtonText}>Weekly Leaderboard</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.rectangularButton, styles.pointsLeaderboardButton]}
                    onPress={handlePointsLeaderboard}
                  >
                    <Text style={styles.rectangularButtonText}>Points Leaderboard</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[styles.button, styles.startQuizButton]}
                  onPress={handleStartQuiz}
                >
                  <Text style={styles.buttonText}>Start Quiz</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

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



          </View>


              {/* Rules Modal */}
              <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Rules</Text>
<Text style={styles.modalText}>
  1. Visit <Text style={{ color: 'green' }} onPress={() => Linking.openURL('https://bingebrain.com')}>
    bingebrain.com
  </Text> to explore this week's rewards! 🏆✨
</Text>
<Text style={styles.modalText}>
  2. The faster you answer, the more points you score. At 10 seconds, the score is 10 points, and it decreases as time passes.
</Text>
<Text style={styles.modalText}>
  3. You can attempt a maximum of 10 quizzes per week.
</Text>
<Text style={styles.modalText}>
  4. There will be two winners each week:
</Text>
<Text style={styles.modalText}>
  &nbsp;&nbsp;a. The player with the highest cumulative score across 10 games - Weekly Leaderboard.
</Text>
<Text style={styles.modalText}>
  &nbsp;&nbsp;b. The player with the highest score in a single game - Points Leaderboard.
</Text>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => 
                    setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          

        
      
        </ImageBackground>


      );
      
    


};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center", // Center the modal vertically
    alignItems: "center", // Center the modal horizontally
    backgroundColor: "#1a1a2e",
  },
  modalContent: {
    width: SCREEN_WIDTH * 0.8,
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
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
  modalText: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: "#ccc",
    textAlign: "center",
    marginVertical: 5,
  },
  adContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    alignItems: "center",
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
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "white",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    width: "80%",
    color: "white",
    marginBottom: 10,
    textAlign: "center",
  },
  note: {
    fontSize: 14,
    color: "gray",
    marginBottom: 20,
    textAlign: "center",
    width: "80%",
  },
  successMessage: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "white",
  },
  button: {
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginVertical: 10,
    width: 230,
    elevation: 5,
    marginTop: 20,
    alignItems: "center",
  },
  startQuizButton: {
    backgroundColor: "#F0FFFF",
  },
  rectangularButtonContainer: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-between",
    width: "80%",
  },
  rectangularButton: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: "#FFFDD0",
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    elevation: 5,
  },
  weeklyLeaderboardButton: {
    backgroundColor: "#F0FFFF",
  },
  pointsLeaderboardButton: {
    backgroundColor: "#F0FFFF",
  },
  rectangularButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  rulesIconContainer: {
    position: "absolute", // Ensure it's positioned relative to the screen
    top: 20, // Distance from the top of the screen
    right: 20, // Distance from the right of the screen
    zIndex: 10, // Ensure it stays above other elements
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover', // Ensures the image covers the entire screen
  },
});

export default Challenge;