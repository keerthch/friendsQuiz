import React from "react";
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Home from "../Home";
import Quiz from "../Quiz";
import Results from "../Results";
import Multiplayer from "../Multiplayer";
import Challenge from "../Challenge"
import Leaderboard from "../LeaderBoard";

import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for the back arrow



import { View } from "react-native";




type QuizType = 'single' | 'multiplayer' | 'quote';

type QuoteQuestion = {
  quote: string;
  correctAnswer: string;
};

type LevelQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
};

type RootStackParamList = {
  Home: undefined;
  Leaderboard: undefined
  Quiz : { 
    level?: number; 
    isQuoteQuiz?: boolean; 
    questions?: (QuoteQuestion | LevelQuestion)[]; 
    quizType: QuizType; // Add this property
};
  Multiplayer: undefined;
  Challenge: undefined;
  Results: { score: number; total: number; level?: number; points: number,  quizType: QuizType,  questions?: (QuoteQuestion | LevelQuestion)[]; };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function Layout() {



  
  return (

    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: "#fff", // Black background
        },
        headerTitleStyle: {
          color: "#000", // White text for the title
        },
        headerTintColor: "#fff", // White back button color
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={Home} 
        options={{
          headerShown: false, // Hide the header if you want a clean UI
        }}
      />
      <Stack.Screen
        name="Quiz"
        component={Quiz}
        options={{
          headerShown: false, // Hide the header if you want a clean UI
        }}
      />
      <Stack.Screen
        name="Results"
        component={Results}
        options={{
          headerShown: false, // Hide the header if you want a clean UI
        }}
      />
   <Stack.Screen
  name="Multiplayer"
  component={Multiplayer}
  options={({ navigation }) => ({
    headerLeft: () => (
      <TouchableOpacity
        style={{ marginLeft: 10 }}
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }], // Reset stack and navigate to Home
          })
        }
      >
        <Ionicons name="arrow-back-outline" size={24} color="#000" />
      </TouchableOpacity>
    ),
    title: "Multiplayer",
    headerStyle: {
      backgroundColor: '#f5f5f5',
    },
    headerTitleStyle: {
      fontWeight: 'bold',
      color: '#333',
    },
    headerTitleAlign: "center",
  })}
/>


<Stack.Screen
        name="Challenge"
        component={Challenge}
        options={({ navigation }) => ({
          headerLeft: () => (
            
            <TouchableOpacity
              style={{ marginLeft: 10 }}
              onPress={() =>
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Home' }], // Reset stack and navigate to Challenge
                })
              }
            >
              <Ionicons name="arrow-back-outline" size={24} color="#000" />
            </TouchableOpacity>
          ),
          title: "Challenge",
          headerStyle: {
            backgroundColor: '#f5f5f5',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#333',
          },
          headerTitleAlign: "center",
        })}
      />


<Stack.Screen
  name="Leaderboard"
  component={Leaderboard}
  options={({ navigation }) => ({
    headerLeft: () => (
      
      <TouchableOpacity
        style={{ marginLeft: 10 }}
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: 'Challenge' }], // Reset stack and navigate to Challenge
          })
        }
      >
        <Ionicons name="arrow-back-outline" size={24} color="#000" />
      </TouchableOpacity>
    ),
    title: "Leaderboard",
    headerStyle: {
      backgroundColor: '#f5f5f5',
    },
    headerTitleStyle: {
      fontWeight: 'bold',
      color: '#333',
    },
    headerTitleAlign: "center",
  })}
/>

    </Stack.Navigator>

  );
}