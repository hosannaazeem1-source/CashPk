import React, { useState, useEffect } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { db } from '../../../services/firebase';
import type { UserData } from '../../../types';
import Spinner from '../../../Spinner';
import Alert from '../Alert';

interface AdWatcherProps {
  user: FirebaseUser;
  userData: UserData | null;
}

const DAILY_AD_LIMIT = 20;
const AD_REWARD = 5;

const AdWatcher: React.FC<AdWatcherProps> = ({ user, userData }) => {
  const [isWatching, setIsWatching] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const adsWatchedToday = userData?.lastAdWatchDate === todayStr ? (userData?.adsWatchedToday ?? 0) : 0;
  const canWatchAd = adsWatchedToday < DAILY_AD_LIMIT;

  useEffect(() => {
    // Reset ad count if it's a new day
    if (userData && userData.lastAdWatchDate !== todayStr) {
      const userRef = db.ref(`users/${user.uid}`);
      userRef.update({
        adsWatchedToday: 0,
        lastAdWatchDate: todayStr,
      });
    }
  }, [user.uid, userData, todayStr]);

  const handleWatchAd = async () => {
    if (!canWatchAd || isWatching) return;

    setIsWatching(true);
    setMessage(null);

    // Simulate watching an ad for 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      const userRef = db.ref(`users/${user.uid}`);
      const adHistoryRef = db.ref(`adHistory/${user.uid}`);

      const newAdsWatched = adsWatchedToday + 1;
      const newBalance = (userData?.balance ?? 0) + AD_REWARD;

      // Update user data
      await userRef.update({
        balance: newBalance,
        adsWatchedToday: newAdsWatched,
        lastAdWatchDate: todayStr,
      });

      // Add to ad history
      await adHistoryRef.push({
        reward: AD_REWARD,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
      });

      setMessage({ text: `You earned PKR ${AD_REWARD}!`, type: 'success' });

    } catch (error) {
      setMessage({ text: 'Failed to update earnings. Please try again.', type: 'error' });
      console.error(error);
    } finally {
      setIsWatching(false);
    }
  };

  return (
    <div className="text-center p-6">
      <h3 className="text-2xl font-bold mb-4">Earn Rewards</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Watch ads to earn PKR {AD_REWARD} for each ad viewed.</p>
      
      <div className="mb-6">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
          <div
            className="bg-emerald-500 h-4 rounded-full"
            style={{ width: `${(adsWatchedToday / DAILY_AD_LIMIT) * 100}%` }}
          ></div>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Ads Watched Today: {adsWatchedToday} / {DAILY_AD_LIMIT}
        </p>
      </div>

      {message && <div className="mb-4"><Alert message={message.text} type={message.type} /></div>}

      {isWatching ? (
        <div className="flex flex-col items-center">
            <Spinner/>
            <p className="mt-2 text-lg text-emerald-500 animate-pulse">Watching Ad...</p>
        </div>
      ) : (
        <button
          onClick={handleWatchAd}
          disabled={!canWatchAd || isWatching}
          className="w-full md:w-1/2 bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-600 transition-transform transform hover:scale-105 duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
        >
          {canWatchAd ? 'Watch Ad' : 'Daily Limit Reached'}
        </button>
      )}
    </div>
  );
};

export default AdWatcher;
