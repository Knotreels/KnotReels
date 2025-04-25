// src/screens/BrowseScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FontAwesome as Icon } from '@expo/vector-icons';

// ← Import your RootStackParamList from App.tsx
import { RootStackParamList } from '../../App';

// Tell TypeScript what your Browse screen’s navigation prop looks like:
type BrowseNavProp = NativeStackNavigationProp<RootStackParamList, 'Browse'>;

export default function BrowseScreen() {
  // Now navigation is correctly typed: no more 'as any'
  const navigation = useNavigation<BrowseNavProp>();
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      const q = query(collection(db, 'users'), orderBy('boosts', 'desc'));
      const snap = await getDocs(q);
      setCreators(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={creators}
      keyExtractor={c => c.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate('PublicProfile', { username: item.username })
          }
        >
          <Text style={styles.username}>{item.username}</Text>
          <View style={styles.stats}>
            <Icon name="rocket" size={14} />
            <Text style={styles.statText}>{item.boosts || 0}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex:1, justifyContent:'center', alignItems:'center' },
  list: { padding:16 },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 10,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
  },
  username: { fontSize: 16, fontWeight: 'bold' },
  stats: { flexDirection: 'row', alignItems: 'center' },
  statText: { marginLeft: 4 },
});
