import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { levelBasedQuestions } from "../constants/questions";
import { quotes } from "../constants/quotes"; // Import quotes

type QuizType = 'single' | 'multiplayer' | 'quote';

type RootStackParamList = {
  Home: undefined;
  Quiz: { 
    level?: number; 
    isQuoteQuiz?: boolean; 
    questions?: (QuoteQuestion | LevelQuestion)[]; 
    quizType: QuizType; // Add this property
    roomId?: string;
    playerName? : string;
};

  Results: { score: number; total: number; level?: number; points: number, quizType: QuizType, roomId?: string, 
    playerName?: string, questions?: (QuoteQuestion | LevelQuestion)[];     name?: string; email?: string  };
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

type Props = NativeStackScreenProps<RootStackParamList, "Quiz">;

const characterImages: Record<"Mercedes" | "Alpine" | "Ferrari" | "Williams" | "Redbull" | "McLaren", any> = {
  Mercedes: require("../assets/images/mercedes.png"),
  Alpine: require("../assets/images/alpine.png"),
  Ferrari: require("../assets/images/ferrari.png"),
  Williams: require("../assets/images/williams.png"),
  Redbull: require("../assets/images/redbull.png"),
  McLaren: require("../assets/images/mclaren.png"),
};

export default function Quiz({ route, navigation }: Props) {
  const { questions: passedQuestions, level, isQuoteQuiz, quizType, roomId, playerName } = route.params;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [points, setPoints] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const animatedProgress = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to pick 10 random quotes
  const getRandomQuotes = () => {
    const shuffledQuotes = [...quotes].sort(() => Math.random() - 0.5);
    return shuffledQuotes.slice(0, 6);
  };

  const questions: (QuoteQuestion | LevelQuestion)[] = React.useMemo(() => {
    if (passedQuestions) {
      // Use questions passed via navigation if available
      return passedQuestions;
    }

    // Otherwise, generate questions dynamically
    return isQuoteQuiz
      ? getRandomQuotes() // Use random quotes when isQuoteQuiz is true
      : level !== undefined
      ? levelBasedQuestions[level - 1] || []
      : [];
  }, [passedQuestions, level, isQuoteQuiz]);

  const totalQuestions = questions.length;

  useEffect(() => {
    // Start animation
    Animated.timing(animatedProgress, {
      toValue: 0,
      duration: 10000,
      useNativeDriver: true,
    }).start();

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          clearInterval(timerRef.current!); // Clear timer when reaching timeout
          handleTimeout();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerRef.current!); // Clear timer on unmount or question change
      timerRef.current = null;
      animatedProgress.stopAnimation();
    };
  }, [currentQuestion]);

  const handleTimeout = () => {
    if (!selectedAnswer) {
      setSelectedAnswer(""); // Mark as unanswered
      setTimeout(() => moveToNextQuestion(false), 1000); // Move to next question after timeout
      const current = questions[currentQuestion];
      if (currentQuestion === totalQuestions - 1) {
        navigateToResults(points); // Navigate with current points if wrong
      }
  
    }
  };

  const handleAnswer = async (selectedOption: string) => {
    if (selectedAnswer) return; // Prevent multiple answers

    clearInterval(timerRef.current!); // Stop the timer immediately when answered
    timerRef.current = null;

    const current = questions[currentQuestion];
    const correct = selectedOption === current.correctAnswer;

    setSelectedAnswer(selectedOption);

    if (correct) {
      setPoints((prev) => {
        const updatedPoints = prev + timeLeft; // Add remaining time as points
        if (currentQuestion === totalQuestions - 1) {
          navigateToResults(updatedPoints); // Navigate on last question
        }
        return updatedPoints;
      });
    } else if (currentQuestion === totalQuestions - 1) {
      navigateToResults(points); // Navigate with current points if wrong
    }

    if (currentQuestion < totalQuestions - 1) {
      setTimeout(() => moveToNextQuestion(correct), 1000);
    }
  };

   
  const moveToNextQuestion = (correct: boolean) => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(10);
      animatedProgress.setValue(1);
    }
  };

  const navigateToResults = async (finalPoints: number) => {
    if (!isQuoteQuiz && level !== undefined) {
      const percentage = (finalPoints / (totalQuestions * 10)) * 100;
      const savedLevels = parseInt(
        (await AsyncStorage.getItem("unlockedLevels")) || "1",
        10
      );
      if (percentage >= 75 && level >= savedLevels) {
        await AsyncStorage.setItem("unlockedLevels", (level + 1).toString());
      }
    }

    navigation.navigate("Results", {
      score: finalPoints,
      total: totalQuestions,
      level,
      points: finalPoints,
      quizType: quizType,
      roomId: roomId,
      playerName: playerName,
      questions: questions
    });
  };

  const current = questions[currentQuestion];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.circularContainer}>
          <Text style={styles.circularValue}>{points}</Text>
          <Text style={styles.circularLabel}>Points</Text>
        </View>
        <View style={styles.counterContainer}>
          <Text style={styles.counter}>{`${currentQuestion + 1} / ${totalQuestions}`}</Text>
        </View>
        <View style={styles.circularContainer}>
          <Text style={styles.circularValue}>{timeLeft}</Text>
          <Text style={styles.circularLabel}>Timer</Text>
        </View>
      </View>

      {/* Question */}
      <Text style={styles.question}>
        {"quote" in current ? `"${current.quote}"` : current.question}
      </Text>

      
      {/* Options */}
      <View style={styles.optionsContainer}>
        {"quote" in current
          ? Object.keys(characterImages).map((character) => {
              const isSelected = selectedAnswer === character;
              const isCorrectAnswer = current.correctAnswer === character;

              return (
                <View key={character} style={styles.characterContainer}>
                <TouchableOpacity
                  style={[
                    styles.imageOption,
                    isSelected && !isCorrectAnswer && styles.wrongOutline,
                    isCorrectAnswer && (isSelected || selectedAnswer) && styles.correctOutline,
                  ]}
                  onPress={() => handleAnswer(character)}
                  disabled={!!selectedAnswer}
                >
                  <Image
                    source={characterImages[character as keyof typeof characterImages]}
                    style={styles.characterImage}
                  />
                </TouchableOpacity>
                <Text style={styles.characterName}>{character}</Text>
              </View>
              );
            })
          : current.options.map((option) => {
              const isSelected = selectedAnswer === option;
              const isCorrectAnswer = current.correctAnswer === option;

              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.option,
                    isSelected && !isCorrectAnswer && styles.wrongOutline,
                    isCorrectAnswer && (isSelected || selectedAnswer) && styles.correctOutline,
                  ]}
                  onPress={() => handleAnswer(option)}
                  disabled={!!selectedAnswer}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              );
            })}
      </View>
    </View>
  );
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

  

// Styles
const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: "#1a1a2e",
    },
    header: {
      position: "absolute",
      top: SCREEN_HEIGHT * 0.03, // Reduced distance from the top
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      paddingHorizontal: 20,
      zIndex: 10,
    },
    counterContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    circularContainer: {
      justifyContent: "center",
      alignItems: "center",
      width: SCREEN_WIDTH * 0.2,
      height: SCREEN_WIDTH * 0.2,
      borderRadius: SCREEN_WIDTH * 0.1,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderWidth: 2,
      borderColor: "#fff",
      shadowColor: "#000",
      shadowOpacity: 0.3,
      shadowRadius: 4,
      shadowOffset: { width: 2, height: 2 },
      elevation: 4,
    },
    circularValue: {
      fontSize: SCREEN_WIDTH * 0.05,
      fontWeight: "bold",
      color: "#fff",
    },
    circularLabel: {
      fontSize: SCREEN_WIDTH * 0.03,
      color: "#ccc",
      marginTop: 4,
    },
    counter: {
      fontSize: SCREEN_WIDTH * 0.05,
      fontWeight: "bold",
      color: "#fff",
    },
    question: {
      fontSize: SCREEN_WIDTH * 0.07,
      fontWeight: "bold",
      textAlign: "center",
      marginTop: SCREEN_HEIGHT * 0.15, // Adds more vertical space from the header
      marginBottom: SCREEN_HEIGHT * 0.05, // Additional spacing for options below
      color: "#f9f9f9",
    },
    optionsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      marginTop: SCREEN_HEIGHT * 0.02,
    },
    imageOption: {
      margin: SCREEN_WIDTH * 0.03,
      alignItems: "center",
      borderWidth: 5,
      borderColor: "transparent",
      borderRadius: SCREEN_WIDTH * 0.2,
    },
    characterImage: {
      width: SCREEN_WIDTH * 0.3,
      height: SCREEN_WIDTH * 0.3,
      borderRadius: SCREEN_WIDTH * 0.15,
    },
    option: {
      width: "90%",
      paddingVertical: SCREEN_HEIGHT * 0.015,
      marginVertical: SCREEN_HEIGHT * 0.02,
      borderWidth: 2,
      borderColor: "#fff",
      borderRadius: 20,
      backgroundColor: "#333",
      alignItems: "center",
    },
    correctOutline: {
      borderColor: "green",
    },
    wrongOutline: {
      borderColor: "red",
    },
    optionText: {
      fontSize: SCREEN_WIDTH * 0.04,
      color: "#fff",
      fontWeight: "bold",
    },
    characterContainer: {
      alignItems: "center",
    },
    characterName: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#fff",
      textAlign: "center",
    },
  });
  