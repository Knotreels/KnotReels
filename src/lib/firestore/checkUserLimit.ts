import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '@/firebase/config';

export const checkUserLimit = async () => {
  const snapshot = await getCountFromServer(collection(db, 'users'));
  return snapshot.data().count;
};
