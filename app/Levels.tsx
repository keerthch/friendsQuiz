import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Levels({ navigation }: any) {
  const [unlockedLevels, setUnlockedLevels] = useState<number>(1);

  // Load unlocked levels from AsyncStorage
  useEffect(() => {
    const loadLevels = async () => {
      const savedLevels = await AsyncStorage.getItem("unlockedLevels");
      setUnlockedLevels(savedLevels ? parseInt(savedLevels, 10) : 1);
    };
    loadLevels();
  }, []);

  const handleLevelPress = (level: number) => {
    if (level > unlockedLevels) {
      Alert.alert("Locked Level", "You must unlock this level by clearing the previous one.");
    } else {
      navigation.navigate("Quiz", { level });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Level</Text>
      <View style={styles.levelsContainer}>
        {[...Array(10)].map((_, index) => {
          const level = index + 1;
          const isLocked = level > unlockedLevels;
          return (
            <TouchableOpacity
              key={level}
              style={[
                styles.levelButton,
                isLocked ? styles.lockedButton : styles.unlockedButton,
              ]}
              onPress={() => handleLevelPress(level)}
            >
              <Text style={styles.levelText}>{`Level ${level}`}</Text>
            </TouchableOpacity>
          );
        })}
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
    backgroundColor: "#f3f3f3",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#34495e",
  },
  levelsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  levelButton: {
    width: 80,
    height: 80,
    margin: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  unlockedButton: {
    backgroundColor: "#4caf50",
  },
  lockedButton: {
    backgroundColor: "#cccccc",
  },
  levelText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
