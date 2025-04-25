// src/screens/ProfileScreen.tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// 1) Import your global route‐list type:
import { RootStackParamList } from '../../App';

// 2) Create a typed navigation prop for this screen:
type ProfileNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'Profile'
>;

export default function ProfileScreen() {
  const { user } = useAuth();
  // 3) Give useNavigation the right type:
  const navigation = useNavigation<ProfileNavProp>();

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <Text style={styles.heading}>
            {user.username ?? 'No username'}
          </Text>
          <Text style={styles.info}>Email: {user.email}</Text>
          <Text style={styles.info}>Role: {user.role}</Text>

          <View style={styles.buttonWrapper}>
            <Button
              title="View My Public Profile"
              // Now TypeScript knows this is valid:
              onPress={() =>
                navigation.navigate('PublicProfile', {
                  username: user.username!,
                })
              }
            />
          </View>

          <View style={styles.buttonWrapper}>
            <Button
              title="Browse Creators"
              onPress={() => navigation.navigate('Browse')}
            />
          </View>
        </>
      ) : (
        <Text style={styles.notSignedIn}>You’re not signed in.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    alignItems:     'center',
    justifyContent: 'center',
    padding:        16,
  },
  heading: {
    fontSize:   18,
    fontWeight: 'bold',
  },
  info: {
    marginTop: 8,
    fontSize:  16,
  },
  buttonWrapper: {
    width:     '100%',
    marginTop: 16,
  },
  notSignedIn: {
    fontSize: 16,
  },
});
