import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRoute } from "@react-navigation/native";

type RootStackParamList = {
  Home: undefined;
  Quiz: {
    level?: number;
    isQuoteQuiz?: boolean;
    roomId?: string;
    playerName?: string;
  };
  Leaderboard: { type: string };
};

const Leaderboard = () => {
  const route = useRoute();
  const { type } = route.params || {}; // Extract the 'type' parameter

  const [weeklyPlayers, setWeeklyPlayers] = useState([]);
  const [quizPlayers, setQuizPlayers] = useState([]);
  const [loadingWeekly, setLoadingWeekly] = useState(true);
  const [loadingQuiz, setLoadingQuiz] = useState(true);

  useEffect(() => {
    if (type === "weekly") {
      fetchWeeklyLeaderboard();
    } else if (type === "points") {
      fetchQuizLeaderboard();
    }
  }, [type]);

  const fetchWeeklyLeaderboard = async () => {
    try {
      const response = await fetch(
        "https://cxn8d58dd1.execute-api.ap-south-1.amazonaws.com/prod?level=200"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch weekly leaderboard");
      }

      const data = await response.json();
      setWeeklyPlayers(data.topPlayers || []);
    } catch (error) {
      console.error("Error fetching weekly leaderboard:", error);
    } finally {
      setLoadingWeekly(false);
    }
  };

  const fetchQuizLeaderboard = async () => {
    try {
      const response = await fetch(
        "https://cxn8d58dd1.execute-api.ap-south-1.amazonaws.com/prod?level=400"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch quiz leaderboard");
      }

      const data = await response.json();
      setQuizPlayers(data.topPlayers || []);
    } catch (error) {
      console.error("Error fetching quiz leaderboard:", error);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const renderPlayer = ({ item, index }) => (
    <View style={styles.playerContainer}>
      <Text style={styles.rank}>{index + 1}</Text>
      <View style={styles.playerDetails}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.score}>{item.scores} pts</Text>
      </View>
    </View>
  );

  const renderPlayer1 = ({ item, index }) => (
    <View style={styles.playerContainer}>
      <Text style={styles.rank}>{index + 1}</Text>
      <View style={styles.playerDetails}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.score}>{item.highest_score} pts</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {type === "weekly" && (
        <View>
          <Text style={styles.title}>Weekly Leaderboard - Accumulated</Text>
          {loadingWeekly ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <FlatList
              data={weeklyPlayers}
              renderItem={renderPlayer}
              keyExtractor={(item, index) => index.toString()}
            />
          )}
        </View>
      )}

      {type === "points" && (
        <View>
          <Text style={[styles.title, { marginTop: 20 }]}>
            Points Leaderboard - Single Quiz
          </Text>
          {loadingQuiz ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <FlatList
              data={quizPlayers}
              renderItem={renderPlayer1}
              keyExtractor={(item, index) => index.toString()}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  playerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 3,
  },
  rank: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#555555",
    marginRight: 10,
  },
  playerDetails: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  name: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333333",
  },
  score: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },
});

export default Leaderboard;
