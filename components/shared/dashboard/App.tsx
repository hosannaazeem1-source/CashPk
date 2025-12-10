import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import { auth, db } from '../../../services/firebase';
import type { UserData } from '../../../types';

import Login from './Login';
import SignUp from './SignUp';
import AdminPanel from './AdminPanel';
import Dashboard from './Dashboard';
import Header from '../Header';
import Spinner from '../../../Spinner';

type FirebaseUser = firebase.User;

const App: React.FC = () => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginView, setIsLoginView] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoading(true);
      if (user) {
        setFirebaseUser(user);
      } else {
        setFirebaseUser(null);
        setUserData(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!firebaseUser) {
      return;
    }

    const userRef = db.ref(`users/${firebaseUser.uid}`);
    const onUserDataChange = (snapshot: firebase.database.DataSnapshot) => {
      if (snapshot.exists()) {
        setUserData(snapshot.val() as UserData);
      }
      setIsLoading(false);
    };

    userRef.on('value', onUserDataChange);

    return () => userRef.off('value', onUserDataChange);
  }, [firebaseUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Spinner />
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <i className="fas fa-dollar-sign text-5xl text-emerald-500"></i>
            <h1 className="text-4xl font-bold mt-2">PK Earn App</h1>
          </div>
          {isLoginView ? (
            <Login switchToSignUp={() => setIsLoginView(false)} />
          ) : (
            <SignUp switchToLogin={() => setIsLoginView(true)} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Header userEmail={firebaseUser.email} userRole={userData?.role} />
      <main className="p-4 md:p-8">
        {userData?.role === 'admin' ? (
          <AdminPanel />
        ) : (
          <Dashboard user={firebaseUser} userData={userData} />
        )}
      </main>
    </div>
  );
};

export default App;
