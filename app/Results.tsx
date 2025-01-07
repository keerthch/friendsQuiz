import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import {
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  AdEventType,
} from "react-native-google-mobile-ads";
import NAMES from "../constants/names";
import AsyncStorage from "@react-native-async-storage/async-storage";

const androidAdmobBanner = "ca-app-pub-8141886191578873/5854843391";
const androidInterstitialAd = "ca-app-pub-8141886191578873/4541761721";

type QuizType = "single" | "multiplayer" | "quote";

type RootStackParamList = {
  Home: undefined;
  Quiz: {
    level?: number;
    isQuoteQuiz?: boolean;
    questions?: (QuoteQuestion | LevelQuestion)[];
  };
  Results: {
    score: number;
    total: number;
    level?: number;
    points: number;
    quizType: QuizType;
    roomId?: string;
    playerName?: string;
    questions?: (QuoteQuestion | LevelQuestion)[];
  };
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

type Props = NativeStackScreenProps<RootStackParamList, "Results">;

// Initialize Interstitial Ad
const interstitialAd = InterstitialAd.createForAdRequest(androidInterstitialAd);

export default function Results({ route, navigation }: Props) {
  const {
    score,
    total,
    level,
    points,
    quizType,
    roomId,
    playerName,
    questions,
  } = route.params;

  const [winner, setWinner] = useState<string | null>(null);
  const [players, setPlayers] = useState<{ name: string; score: number }[]>([]);
  const [loading, setLoading] = useState(false);

  const percentage = Math.round((score / (total * 10)) * 100);

    // Generate random player names and scores
    const generateRandomPlayers = () => {
      const randomName = NAMES[Math.floor(Math.random() * NAMES.length)];
      const names = [randomName]; // Only other random players here
      const randomPlayers = [
        { name: playerName || "You", score: score }, // Use the input player name and score
        ...names.map((name) => ({
          name,
          score: Math.floor(Math.random() * (85 - 40 + 1)) + 40, // Random score between 60-85
        })),
      ];
      return randomPlayers.sort((a, b) => b.score - a.score); // Sort by score descending
    };
    
    useEffect(() => {
      if (level ===15 || level === 16 || level === 17 || level === 18) {
        setLoading(true);
        const randomDelay = Math.floor(Math.random() * 10000); // Random delay between 0-10 seconds
    
        setTimeout(() => {
          const randomPlayers = generateRandomPlayers();
          setPlayers(randomPlayers);
          setWinner(randomPlayers[0].name); // Set the winner as the player with the highest score
          setLoading(false);
        }, randomDelay);
      }
    }, [level, playerName, score]);

    
    const handleLevelCompletion = async () => {
      if (level === 100) {
        try {
          console.log('lebel ==== 10000')
          const storedName = await AsyncStorage.getItem("name");
          const storedEmail = await AsyncStorage.getItem("email");
  
          if (!storedName || !storedEmail) {
            throw new Error("Name or email not found in AsyncStorage.");
          }
  
          const payload = {
            action: "weeklyScore",
            name: storedName,
            email: storedEmail,
            score,
          };
  
          console.log("Submitting payload:", payload);
  
          const response = await fetch("https://ywy4ojcgcl.execute-api.ap-south-1.amazonaws.com/prod/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
  
          if (!response.ok) {
            throw new Error(`Failed to submit score: ${response.status}`);
          }
  
          const result = await response.json();
          console.log("Score submission successful:", result);
  
          Alert.alert("Success", "Your score has been submitted!");
        } catch (error) {
          console.error("Error submitting score:", error);
          Alert.alert("Error", "Failed to submit your score. Please try again.");
        }
      }
    };
    handleLevelCompletion();
  

  // Load and show Interstitial Ad
  useEffect(() => {
    const showAdWithProbability = () => {
      // 50% probability to show the ad
      if (Math.random() < 0.5) {
        interstitialAd.load();
        interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
          interstitialAd.show();
        });
        interstitialAd.addAdEventListener(AdEventType.ERROR, (error) =>
          console.error("Interstitial ad failed to load:", error)
        );
      }
    };

    // Show the ad when the Results screen is displayed
    showAdWithProbability();
  }, []);

  // Determine the result color
  const getResultColor = (percentage: any) => {
    if (percentage >= 70) return styles.resultGreen;
    if (percentage > 50) return styles.resultYellow;
    return styles.resultRed;
  };

  // Poll for winner only for multiplayer quizzes
  useEffect(() => {
    if (quizType !== "multiplayer" || !roomId) return;
    let interval: NodeJS.Timeout | null = null;

    const checkWinner = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://ywy4ojcgcl.execute-api.ap-south-1.amazonaws.com/prod/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "submitScore",
              roomId,
              playerName: playerName, // Replace with dynamic playerName if required
              score: score, // Replace with dynamic score if applicable
            }),
          }
        );

        const data = await response.json();

        if (data.success) {
          setPlayers(data.players || []);
          if (data.winner) {
            setWinner(data.winner);
            if (interval) clearInterval(interval); // Stop polling once a winner is found
          }
        }
      } catch (error) {
        console.error("Error checking winner:", error);
      } finally {
        setLoading(false);
      }
    };

    // Call immediately and then every 15 seconds
    checkWinner();
    interval = setInterval(checkWinner, 10000);

    // Cleanup interval on unmount
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [quizType, roomId]);

  return (
    <View style={styles.container}>
      {/* Level 15 Multiplayer Result */}
      {(level ===15 || level === 16 || level === 17 || level === 18 || quizType === "multiplayer") && (
        <View style={styles.winnerContainer}>
          {loading ? (
            <Text style={styles.loadingText}>Fetching results...</Text>
          ) : (
            <>
              <View style={styles.multiplayerContainer}>
                {players.map((player, index) => (
                  <View key={index} style={styles.multiplayerPlayerCard}>
                    <View
                      style={[
                        styles.multiplayerPercentageContainer,
                        getResultColor(player.score),
                      ]}
                    >
                      <Text style={styles.multiplayerPercentageText}>
                        {`${player.score}%`}
                      </Text>
                    </View>
                    <Text style={styles.multiplayerDetails}>{player.name}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.winnerText}>{`${winner} won the quiz!`}</Text>
            </>
          )}
        </View>
      )}

      {/* Single Player Mode */}
      {level !== 15 && level !== 16 && level !== 17 && level !== 18 && quizType !== "multiplayer" && (
        <View style={styles.singlePlayerContainer}>
          <View
            style={[styles.singlePlayerPercentageContainer, getResultColor(percentage)]}
          >
            <Text style={styles.singlePlayerPercentageText}>
              {`${percentage}%`}
            </Text>
          </View>
          <Text
            style={styles.singlePlayerDetails}
          >{`You scored ${score} out of ${total * 10}`}</Text>
        </View>
      )}

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.circularButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Ionicons name="home" size={28} color="#fff" />
          <Text style={styles.buttonLabel}>Home</Text>
        </TouchableOpacity>

      </View>


      <Text style={styles.unlockMessage1}>
      The faster you answer, the more points you earn. 10 points at 10 seconds, decreasing over time.
      </Text>
  
      {/* Unlock Next Level Message */}
      {quizType !== "multiplayer"  && quizType !== "quote" && percentage < 70 && level != undefined && level < 15 && (
        <Text style={styles.unlockMessage}>
          Score greater than or equal to 70% to unlock the next level! 
        </Text>
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
  );
}

const styles = StyleSheet.create({
  singlePlayerContainer: {
    flex: 0.5,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  singlePlayerPercentageContainer: {
    width: 120,
    height: 120,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#444',
  },
  singlePlayerPercentageText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  singlePlayerDetails: {
    fontSize: 18,
    textAlign: 'center',
    color: '#ccc',
  },

  // Multiplayer Styles
  multiplayerContainer: {
    marginTop: 20,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap', // Wrap cards if needed
  },
  multiplayerPlayerCard: {
    flexBasis: '45%', // Fit two cards per row
    alignItems: 'center',
    marginBottom: 10, // Space between rows
    padding: 10,
    borderRadius: 10,
  },
  multiplayerPercentageContainer: {
    width: 70,
    height: 70,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  multiplayerPercentageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  multiplayerDetails: {
    fontSize: 14,
    textAlign: 'center',
    color: '#ccc',
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#1a1a2e",
  },
  percentageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
  },
  resultGreen: {
    backgroundColor: "rgba(0, 255, 0, 0.2)",
    borderColor: "green",
    borderWidth: 4,
  },
  resultYellow: {
    backgroundColor: "rgba(255, 255, 0, 0.2)",
    borderColor: "yellow",
    borderWidth: 4,
  },
  resultRed: {
    backgroundColor: "rgba(255, 0, 0, 0.2)",
    borderColor: "red",
    borderWidth: 4,
  },
  percentageText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  details: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 20,
  },
  buttonRowContainer: {
    marginTop: -20, // Move the buttons slightly upward
  },
  winnerContainer: {
    marginTop: 20, // Ensure spacing between the winner container and other elements
    padding: 10,
    borderRadius: 10,
    width: "100%", // Ensure it doesn't shrink
    alignItems: "center", // Center the text horizontally
  },
  
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%", // Adjust to take full width
    marginTop: 30, // Add space between buttons and winner container
  },
  
  circularButton: {
    width: 60,
    height: 60,
    borderRadius: 40,
    backgroundColor: "#4caf50",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  disabledButton: {
    backgroundColor: "#777",
  },
  buttonLabel: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
    marginTop: 4,
  },
  unlockMessage: {
    marginTop: 22,
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  adContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    alignItems: "center",
  },
 
  winnerText: {
    fontSize: 22,
    color: "#ffff",
    fontWeight: "bold",
  },
  loadingText: {
    fontSize: 16,
    color: "lightgray",
  },
  waitingText: {
    fontSize: 16,
    color: "lightgray",
  },
  
  playersTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  playerText: {
    fontSize: 16,
    color: "#ccc",
  },
  playersContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#222',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  playerCard: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 10,
    width: '48%',
  },
  playerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',

  },
  playerScore: {
    color: '#fff',
    fontSize: 14,
  },
  unlockMessage1: {
    marginTop: 22,
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
  },
});