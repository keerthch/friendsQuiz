import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";

const androidAdmobBanner = "ca-app-pub-3940256099942544/9214589741";

type QuizType = "single" | "multiplayer" | "quote";

type RootStackParamList = {
  Home: undefined;
  Quiz: { level?: number; isQuoteQuiz?: boolean; questions?: (QuoteQuestion | LevelQuestion)[]; };
  Results: {
    score: number;
    total: number;
    level?: number;
    points: number;
    quizType: QuizType;
    roomId?: string;
    playerName? : string;
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

export default function Results({ route, navigation }: Props) {
  const { score, total, level, points, quizType, roomId, playerName, questions} = route.params;

  const [winner, setWinner] = useState<string | null>(null);
  const [players, setPlayers] = useState<{ name: string; score: number }[]>([]);
  const [loading, setLoading] = useState(false);

  const percentage = Math.round((score / (total * 10)) * 100);

  // Determine the result color
  const getResultColor = () => {
    if (percentage >= 90) return styles.resultGreen;
    if (percentage > 60) return styles.resultYellow;
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

    // Call immediately and then every 20 seconds
    checkWinner();
    interval = setInterval(checkWinner, 15000);

    // Cleanup interval on unmount
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [quizType, roomId]);

  

  return (
    <View style={styles.container}>
       {/* Winner Announcement */}
     {quizType === "multiplayer" && (
        <View style={styles.winnerContainer}>
          {winner ? (
            <Text style={styles.winnerText}>{`${winner} won the quiz!`}</Text>
          ) : loading ? (
            <Text style={styles.loadingText}>Checking for a winner...</Text>
          ) : (
            <Text style={styles.waitingText}>Waiting for the game to finish...</Text>
          )}
        </View>
      )}
      {/* Single Player Mode */}
{quizType !== "multiplayer" && (
  <View style={styles.singlePlayerContainer}>
    {/* Percentage Display */}
    <View style={[styles.singlePlayerPercentageContainer, getResultColor()]}>
      <Text style={styles.singlePlayerPercentageText}>{`${percentage}%`}</Text>
    </View>
    <Text style={styles.singlePlayerDetails}>{`You scored ${score} out of ${
      total * 10
    }`}</Text>
  </View>
)}
    

{/* Multiplayer Mode */}
{quizType === "multiplayer" && players.length > 0 && (
  <View style={styles.multiplayerContainer}>
    {players
      .sort((a, b) => b.score - a.score)
      .map((player, index) => (
        <View key={index} style={styles.multiplayerPlayerCard}>
          <View
            style={[
              styles.multiplayerPercentageContainer, // Multiplayer-specific styling
              getResultColor(),
            ]}
          >
            <Text style={styles.multiplayerPercentageText}>
              {`${player.score}`}
            </Text>
          </View>
          <Text style={styles.multiplayerDetails}>
            {`${player.name}`}
          </Text>
        </View>
      ))}
  </View>
)}



  
      

       {/* Buttons in a row */}
       <View style={styles.buttonRow}>
        {/* Back to Home */}
        <TouchableOpacity
          style={styles.circularButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Ionicons name="home" size={28} color="#fff" />
          <Text style={styles.buttonLabel}>Home</Text>
        </TouchableOpacity>
  
        {/* Retry Level */}
        <TouchableOpacity
          style={[
            styles.circularButton,
            level === undefined && styles.disabledButton,
          ]}
          onPress={() => navigation.navigate("Quiz", { level, questions })}
          disabled={level === undefined}
        >
          <Ionicons name="refresh" size={28} color="#fff" />
          <Text style={styles.buttonLabel}>Retry</Text>
        </TouchableOpacity>
      </View>
  
      {/* Unlock Next Level Message */}
      {quizType !== "multiplayer" && percentage < 90 && (
        <Text style={styles.unlockMessage}>
          Score greater than or equal to 90% to unlock the next level!
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
});
