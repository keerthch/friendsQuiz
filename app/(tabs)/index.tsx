import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../Home";
import Quiz from "../Quiz";
import Results from "../Results";

type RootStackParamList = {
  Home: { unlockedLevel?: number };
  Quiz: { level: number; isQuoteQuiz?: boolean };
  Results: { score: number; total: number; level?: number; points: number };
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
          title: "Home", // Static title for Home
        }} 
      />
      <Stack.Screen
        name="Quiz"
        component={Quiz}
        options={({ route }) => ({
          title: route.params.isQuoteQuiz
            ? "Guess the Quote"
            : `Level ${route.params.level}`, // Dynamic title based on level
        })}
      />
      <Stack.Screen
        name="Results"
        component={Results}
        options={{
          title: "Results", // Static title for Results
        }}
      />
    </Stack.Navigator>
  );
}
