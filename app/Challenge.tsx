import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

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
      await AsyncStorage.setItem("name", name);
      await AsyncStorage.setItem("email", email);
      setIsFormSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      Alert.alert("Error", "Failed to submit form. Please try again.");
    }
  };

  const fetchQuestions = async () => {
    try {
      console.log("getting questions");
      const response = await fetch(
        `https://cxn8d58dd1.execute-api.ap-south-1.amazonaws.com/prod?level=${1}`
      );
      console.log(response);
      if (!response.ok) {
        throw new Error(`Error fetching questions: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      navigation.navigate("Quiz", { level: 100, questions: data.questions });
    } catch (error) {
      console.error("Error fetching questions:", error);
      Alert.alert("Error", "Failed to fetch questions. Please try again.");
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
    <View style={styles.container}>
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
          <TouchableOpacity
            style={[styles.button, styles.startQuizButton]}
            onPress={handleStartQuiz}
          >
            <Text style={styles.buttonText}>Start Quiz</Text>
          </TouchableOpacity>
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
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    width: "80%",
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
  },
  button: {
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginVertical: 10,
    width: 200,
    alignItems: "center",
  },
  startQuizButton: {
    backgroundColor: "#2196F3",
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
    backgroundColor: "#f5f5f5",
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    elevation: 5,
  },
  weeklyLeaderboardButton: {
    backgroundColor: "#2196F3",
  },
  pointsLeaderboardButton: {
    backgroundColor: "#2196F3",
  },
  rectangularButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Challenge;
