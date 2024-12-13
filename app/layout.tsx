import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./Home";
import Quiz from "./Quiz";
import Results from "./Results";
import Multiplayer from "./Multiplayer";


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
  Quiz : { 
    level?: number; 
    isQuoteQuiz?: boolean; 
    questions?: (QuoteQuestion | LevelQuestion)[]; 
    quizType: QuizType; // Add this property
};
  Multiplayer: undefined
  Results: { score: number; total: number; level?: number; points: number, quizType: QuizType };
};

const Stack = createNativeStackNavigator<RootStackParamList>();


export default function Layout() {

  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Quiz" component={Quiz} />
      <Stack.Screen name="Results" component={Results} />
      <Stack.Screen name="Multiplayer" component={Multiplayer} />
    </Stack.Navigator>
  );
}


