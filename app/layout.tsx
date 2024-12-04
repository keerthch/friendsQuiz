import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./Home";
import Quiz from "./Quiz";
import Results from "./Results";
import mobileAds from 'react-native-google-mobile-ads';
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";

type RootStackParamList = {
  Home: { unlockedLevel?: number };
  Quiz: { level: number };
  Results: { score: number; total: number; level?: number; points: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();


export default function Layout() {

    useEffect(() => {
        (async () => {
          // Google AdMob will show any messages here that you just set up on the AdMob Privacy & Messaging page
          const { status: trackingStatus } = await requestTrackingPermissionsAsync();
          if (trackingStatus !== 'granted') {
            // Do something here such as turn off Sentry tracking, store in context/redux to allow for personalized ads, etc.
          }
    
          // Initialize the ads
          await mobileAds().initialize();
        })();
    }, [])
  
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Quiz" component={Quiz} />
      <Stack.Screen name="Results" component={Results} />
    </Stack.Navigator>
  );
}


