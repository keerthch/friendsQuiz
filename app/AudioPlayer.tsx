import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from "react-native";
import { Audio } from "expo-av";
import Slider from "@react-native-community/slider";
import Icon from "react-native-vector-icons/Ionicons";

const { width } = Dimensions.get("window");

const AudioPlayer = ({ source }: { source: string }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const playAudio = async () => {
    const { sound: newSound } = await Audio.Sound.createAsync({ uri: source });
    setSound(newSound);

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
    setIsPlaying(true);
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

    // Cleanup to stop and unload audio when the component unmounts
    return () => {
      if (sound) {
        sound.stopAsync(); // Stop playback immediately
        sound.unloadAsync(); // Unload the audio to free resources
      }
    };
  }, []);

  const formatTime = (millis: number): string => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.sliderContainer}>
        <TouchableOpacity onPress={togglePlayback} style={styles.playPauseButton}>
          <Icon name={isPlaying ? "pause" : "play"} size={24} color="#ffffff" />
        </TouchableOpacity>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onSlidingComplete={(value) => seekAudio(value)} // Seek when slider stops moving
          minimumTrackTintColor="#4caf50"
          maximumTrackTintColor="#d3d3d3"
          thumbTintColor="#4caf50"
        />
      </View>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
};

export default AudioPlayer;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: width - 40,
  },
  playPauseButton: {
    marginRight: 10,
  },
  slider: {
    flex: 1, // Slider takes remaining space
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
