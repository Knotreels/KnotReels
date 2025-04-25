import React from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
import { auth } from '../firebase/config';
import { signInAnonymously } from 'firebase/auth';

export default function SignInScreen() {
  const handleGuest = async () => {
    try {
      await signInAnonymously(auth);
      // AuthContext will pick up the new user automatically
    } catch (err) {
      console.error('🙈 signIn error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to KnotReels!</Text>
      <Button title="Continue as Guest" onPress={handleGuest} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, alignItems:'center', justifyContent:'center', padding:20 },
  text: { fontSize:18, marginBottom:12, textAlign:'center' },
});
