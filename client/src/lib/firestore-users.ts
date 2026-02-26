import { db } from "./firebase";
import { collection, addDoc, query, where, getDocs, getDoc, doc } from "firebase/firestore";

export interface FirestoreUser {
  id?: string;
  name: string;
  email: string;
  role: string;
  identifier: string;
  createdAt?: Date;
}

const USERS_COLLECTION = "users";

/**
 * Create a new user in Firestore
 */
export async function createUser(user: FirestoreUser): Promise<FirestoreUser> {
  const docRef = await addDoc(collection(db, USERS_COLLECTION), {
    ...user,
    createdAt: new Date(),
  });

  return { ...user, id: docRef.id };
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<FirestoreUser | null> {
  const q = query(collection(db, USERS_COLLECTION), where("email", "==", email));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { ...doc.data() as FirestoreUser, id: doc.id };
}

/**
 * Get user by id
 */
export async function getUserById(id: string): Promise<FirestoreUser | null> {
  const docRef = doc(db, USERS_COLLECTION, id);
  const docSnapshot = await getDoc(docRef);

  if (!docSnapshot.exists()) return null;
  return { ...docSnapshot.data() as FirestoreUser, id: docSnapshot.id };
}
