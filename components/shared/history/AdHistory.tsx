import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import type { AdHistoryItem } from '../../../types';
import Spinner from '../../../Spinner';

interface AdHistoryProps {
  userId: string;
}

const AdHistory: React.FC<AdHistoryProps> = ({ userId }) => {
  const [history, setHistory] = useState<AdHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const historyQuery = db.ref(`adHistory/${userId}`).orderByChild('timestamp');

    const onHistoryChange = (snapshot: any) => {
      const data: AdHistoryItem[] = [];
      snapshot.forEach((childSnapshot: any) => {
        data.push({ id: childSnapshot.key!, ...childSnapshot.val() });
      });
      setHistory(data.reverse()); // Show most recent first
      setLoading(false);
    };
    
    historyQuery.on('value', onHistoryChange);

    return () => historyQuery.off('value', onHistoryChange);
  }, [userId]);

  if (loading) {
    return <div className="flex justify-center p-8"><Spinner /></div>;
  }

  if (history.length === 0) {
    return <p className="text-center text-gray-500 p-8">No ad history found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reward</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {history.map((item) => (
            <tr key={item.id}>
              <td className="py-4 px-6 whitespace-nowrap">{new Date(item.timestamp).toLocaleString()}</td>
              <td className="py-4 px-6 whitespace-nowrap text-emerald-500 font-semibold">PKR {item.reward.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdHistory;
