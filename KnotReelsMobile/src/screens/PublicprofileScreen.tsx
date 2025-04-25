// src/screens/PublicProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import { Video } from 'expo-av';
import { useRoute, RouteProp } from '@react-navigation/native';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { FontAwesome as Icon } from '@expo/vector-icons';

type RootStackParamList = {
  PublicProfile: { username: string };
};

export default function PublicProfileScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'PublicProfile'>>();
  const { username } = route.params;
  const { user: currentUser } = useAuth();

  const [creator, setCreator] = useState<any>(null);
  const [clips, setClips] = useState<any[]>([]);
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeClip, setActiveClip] = useState<any>(null);
  const [newComment, setNewComment] = useState('');
  const [hasBoosted, setHasBoosted] = useState(false);

  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    async function fetchData() {
      try {
        // 1) Load the creator by username
        const userSnap = await getDocs(
          query(collection(db, 'users'), where('username', '==', username))
        );
        if (userSnap.empty) {
          setCreator(null);
          return;
        }
        const docSnap = userSnap.docs[0];
        const data = { id: docSnap.id, ...docSnap.data() };
        setCreator(data);

        // 1a) check if already boosted
        if (currentUser) {
          const boostSnap = await getDoc(
            doc(db, 'users', data.id, 'boosts', currentUser.uid)
          );
          setHasBoosted(boostSnap.exists());
        }

        // 2) Fetch clips
        const clipSnap = await getDocs(
          query(
            collection(db, 'clips'),
            where('uid', '==', data.id),
            orderBy('createdAt', 'desc')
          )
        );
        const clipList = clipSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setClips(clipList);

        // 3) Subscribe to comments
        clipList.forEach(clip => {
          const unsub = onSnapshot(
            query(
              collection(db, 'comments'),
              where('clipId', '==', clip.id),
              orderBy('createdAt', 'desc')
            ),
            snap => {
              setComments(c => ({
                ...c,
                [clip.id]: snap.docs.map(d => ({ id: d.id, ...d.data() })),
              }));
            }
          );
          unsubscribers.push(unsub);
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    return () => unsubscribers.forEach(u => u());
  }, [username, currentUser]);

  const handleBoost = async () => {
    if (!creator || !currentUser || hasBoosted) return;
    // record and increment
    await setDoc(
      doc(db, 'users', creator.id, 'boosts', currentUser.uid),
      { createdAt: serverTimestamp() }
    );
    await updateDoc(doc(db, 'users', creator.id), {
      boosts: increment(1),
    });
    setHasBoosted(true);
  };

  const postComment = async () => {
    if (!activeClip || !newComment.trim() || !currentUser) return;
    // lookup real user doc for avatar/username
    const snap = await getDoc(doc(db, 'users', currentUser.uid));
    const { username: realU, avatar: realA } = snap.data() as any;

    // use addDoc to auto‐generate an ID
    await addDoc(collection(db, 'comments'), {
      clipId:    activeClip.id,
      text:      newComment.trim(),
      user:      realU,
      avatar:    realA,
      createdAt: Timestamp.now(),
    });

    setNewComment('');
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  if (!creator) {
    return (
      <View style={styles.center}>
        <Text>Creator “{username}” not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{creator.username}</Text>
        <TouchableOpacity
          style={[styles.boostBtn, hasBoosted && styles.boosted]}
          disabled={hasBoosted}
          onPress={handleBoost}
        >
          <Text style={styles.boostText}>🚀 Boost ({creator.boosts || 0})</Text>
        </TouchableOpacity>
      </View>
      {creator.bio && <Text style={styles.bio}>{creator.bio}</Text>}

      {/* Clips grid */}
      <FlatList
        data={clips}
        keyExtractor={c => c.id}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setActiveClip(item)}
            style={styles.clip}
          >
            {item.mediaUrl ? (
              <Video
                source={{ uri: item.mediaUrl }}
                style={styles.video}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.video, styles.noVideo]}>
                <Text>No video</Text>
              </View>
            )}
            <Text style={styles.clipTitle}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Comments modal */}
      <Modal
        visible={!!activeClip}
        animationType="slide"
        onRequestClose={() => setActiveClip(null)}
      >
        <View style={styles.modal}>
          <TouchableOpacity
            onPress={() => setActiveClip(null)}
            style={styles.close}
          >
            <Icon name="times" size={24} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Comments</Text>
          <FlatList
            data={comments[activeClip?.id] || []}
            keyExtractor={c => c.id}
            renderItem={({ item }) => (
              <View style={styles.comment}>
                <Text style={styles.commentUser}>{item.user}</Text>
                <Text>{item.text}</Text>
              </View>
            )}
          />
          <View style={styles.commentInputRow}>
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Write a comment…"
              style={styles.input}
            />
            <Button title="Send" onPress={postComment} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  boostBtn: { padding: 8, backgroundColor: '#007AFF', borderRadius: 4 },
  boosted: { opacity: 0.5 },
  boostText: { color: '#fff' },
  bio: { marginVertical: 8, fontStyle: 'italic' },
  clip: { flex: 1, margin: 4 },
  video: { width: '100%', height: 120, borderRadius: 4, backgroundColor: '#000' },
  noVideo: { justifyContent: 'center', alignItems: 'center' },
  clipTitle: { marginTop: 4, textAlign: 'center' },
  modal: { flex: 1, padding: 16, backgroundColor: '#fff' },
  close: { position: 'absolute', top: 16, right: 16 },
  modalTitle: { fontSize: 20, marginVertical: 16, textAlign: 'center' },
  comment: { marginBottom: 12 },
  commentUser: { fontWeight: 'bold' },
  commentInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 8,
    borderRadius: 4,
    marginRight: 8,
  },
});
