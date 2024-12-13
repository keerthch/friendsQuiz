import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions, Text } from "react-native";
import { Audio } from "expo-av";
import Icon from "react-native-vector-icons/Ionicons";
import Slider from "@react-native-community/slider"; // Updated import

const { width } = Dimensions.get("window");

const AudioPlayer = ({ source }: { source: string }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const playAudio = async () => {
    const { sound: newSound } = await Audio.Sound.createAsync({ uri: source });
    setSound(newSound);
    setIsPlaying(true);

    newSound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded) {
        setPosition(status.positionMillis);
        setDuration(status.durationMillis || 0);

        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      }
    });

    await newSound.playAsync();
  };

  const togglePlayback = async () => {
    if (sound) {
      const status = await sound.getStatusAsync();

      if (status.isLoaded) {
        if (status.isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      }
    }
  };

  const seekAudio = async (value: number) => {
    if (sound) {
      await sound.setPositionAsync(value);
    }
  };

  useEffect(() => {
    playAudio();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={togglePlayback} style={styles.button}>
        <Icon
          name={isPlaying ? "pause-circle" : "play-circle"}
          size={80}
          color="rgba(76, 175, 80, 0.8)"
          style={styles.icon}
        />
      </TouchableOpacity>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={duration}
        value={position}
        onValueChange={(value : any) => seekAudio(value)}
        minimumTrackTintColor="#4caf50"
        maximumTrackTintColor="#d3d3d3"
        thumbTintColor="#4caf50"
      />
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
};

const formatTime = (millis: number): string => {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

export default AudioPlayer;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  icon: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  slider: {
    width: width - 40,
    height: 40,
    marginVertical: 10,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: width - 40,
    marginTop: 10,
  },
  timeText: {
    fontSize: 14,
    color: "#4caf50",
  },
});
