import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../Home";
import Quiz from "../Quiz";
import Results from "../Results";
import Multiplayer from "../Multiplayer";
import Challenge from "../Challenge";
import Leaderboard from "../LeaderBoard";

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
  Home: { unlockedLevel?: number };
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

const Stack = createNativeStackNavigator<RootStackParamList>();

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
        options={{
          headerShown: false, // Hide the header if you want a clean UI
        }}
      />

<Stack.Screen
        name="Challenge"
        component={Challenge}
        options={{
          headerShown: false, // Hide the header if you want a clean UI
        }}
      />


<Stack.Screen
        name="Leaderboard"
        component={Leaderboard}
        options={{
          headerShown: false, // Hide the header if you want a clean UI
        }}
      />
      
    </Stack.Navigator>
  );
}
