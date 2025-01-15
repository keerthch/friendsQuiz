import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import {
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  AdEventType,
} from "react-native-google-mobile-ads";

const androidAdmobBanner = "ca-app-pub-8141886191578873/6310845835";
const androidInterstitialAd = "ca-app-pub-8141886191578873/5723304857";


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
  const interstitialAd = InterstitialAd.createForAdRequest(androidInterstitialAd);
  

    // Load and show Interstitial Ad
    useEffect(() => {
      const showAdWithProbability = () => {
        // 40% probability to show the ad
        if (Math.random() < 0.4) {
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
        "https://z94udtqgs9.execute-api.ap-south-1.amazonaws.com/prod?level=300"
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
        "https://z94udtqgs9.execute-api.ap-south-1.amazonaws.com/prod?level=400"
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
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
    backgroundColor: "#F0FFFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 3,
  },
  rank: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#000",
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
    color: "#000",
  },
  score: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  adContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    alignItems: "center",
  },
});

export default Leaderboard;