// App.tsx
import './src/firebase/config';
import React from 'react';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import SignInScreen from './src/screens/SignInScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PublicProfileScreen from './src/screens/PublicprofileScreen'; // <-- capital “P”
import BrowseScreen from './src/screens/BrowseScreen';

// 1) Declare every route & its params here:
export type RootStackParamList = {
  SignIn:         undefined;
  Profile:        undefined;
  Browse:         undefined;
  PublicProfile:  { username: string };
};

// 2) Tell the navigator about your param list:
const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: 'My Profile' }}
            />

            <Stack.Screen
              name="Browse"
              component={BrowseScreen}
              options={{ title: 'Browse Creators' }}
            />

            <Stack.Screen
              name="PublicProfile"
              component={PublicProfileScreen}
              options={({ route }) => ({ title: route.params.username })}
            />
          </>
        ) : (
          <Stack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
