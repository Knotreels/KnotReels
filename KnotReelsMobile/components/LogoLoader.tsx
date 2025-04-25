// components/LogoLoader.tsx
import React from 'react';
import { View, ActivityIndicator, StyleSheet, Image } from 'react-native';

export default function LogoLoader() {
  return (
    <View style={styles.container}>
      {/*
        // If you have a logo image in your assets, you can uncomment this:
        // <Image source={require('../assets/logo.png')} style={styles.logo} />
      */}
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    justifyContent: 'center',
    alignItems:     'center',
    backgroundColor: '#fff',
  },
  // logo: {
  //   width: 120,
  //   height: 120,
  //   marginBottom: 20,
  // },
});
