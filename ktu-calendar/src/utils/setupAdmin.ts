import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const createAdminUser = async (email: string, password: string) => {
  try {
    // Create the user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Add the user to Firestore with admin privileges
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      isAdmin: true,
      createdAt: new Date().toISOString()
    });

    console.log('Admin user created successfully!');
    return user;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}; 