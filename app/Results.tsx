import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';


const androidAdmobBanner = "ca-app-pub-8141886191578873/6310845835";

type RootStackParamList = {
  Home: undefined;
  Quiz: { level?: number; isQuoteQuiz?: boolean };
  Results: { score: number; total: number; level?: number; points: number };
};

type Props = NativeStackScreenProps<RootStackParamList, "Results">;

export default function Results({ route, navigation }: Props) {
  const { score, total, level, points } = route.params;

  const percentage = Math.round((score / (total * 30)) * 100);

  // Determine the result color
  const getResultColor = () => {
    if (percentage >= 90) return styles.resultGreen;
    if (percentage > 60) return styles.resultYellow;
    return styles.resultRed;
  };

  return (
    <View style={styles.container}>
      {/* Percentage Display */}
      <View style={[styles.percentageContainer, getResultColor()]}>
        <Text style={styles.percentageText}>{`${percentage}%`}</Text>
      </View>
      <Text style={styles.details}>{`You scored ${score} out of ${total * 30}`}</Text>

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
          style={[styles.circularButton, level === undefined && styles.disabledButton]}
          onPress={() => navigation.navigate("Quiz", { level })}
          disabled={level === undefined}
        >
          <Ionicons name="refresh" size={28} color="#fff" />
          <Text style={styles.buttonLabel}>Retry</Text>
        </TouchableOpacity>
      </View>

      {/* Unlock Next Level Message */}
      {percentage < 90 && (
        <Text style={styles.unlockMessage}>
          Score greater than or equal to 90% to unlock the next level!
        </Text>
      )}
       


     <View style={styles.adContainer}>
        <BannerAd
          unitId="ca-app-pub-8141886191578873/6310845835" // Your actual Ad Unit ID
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          onAdFailedToLoad={(error) => console.error("Ad failed to load: ", error)}
        />
      </View>


    </View>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 20,
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
    marginBottom: 30,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
    marginTop: 20,
  },
  circularButton: {
    width: 80,
    height: 80,
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
    bottom: 0, // Place at the bottom
    width: "100%",
    alignItems: "center",
  },
});
