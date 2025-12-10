import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import type { WithdrawalRequest, WithdrawalStatus } from '../../../types';
import Spinner from '../../../Spinner';

interface WithdrawalHistoryProps {
  userId: string;
}

const WithdrawalHistory: React.FC<WithdrawalHistoryProps> = ({ userId }) => {
  const [history, setHistory] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userHistoryQuery = db.ref('withdrawals').orderByChild('uid').equalTo(userId);

    const onHistoryChange = (snapshot: any) => {
        const data: WithdrawalRequest[] = [];
        snapshot.forEach((childSnapshot: any) => {
            data.push({ id: childSnapshot.key!, ...childSnapshot.val() });
        });
        setHistory(data.sort((a, b) => b.timestamp - a.timestamp)); // Sort by most recent
        setLoading(false);
    };

    userHistoryQuery.on('value', onHistoryChange);

    return () => userHistoryQuery.off('value', onHistoryChange);
  }, [userId]);

  const getStatusStyle = (status: WithdrawalStatus) => {
    switch (status) {
      case 'approved':
        return { text: 'Complete', color: 'text-green-500' };
      case 'rejected':
        return { text: 'Rejected', color: 'text-red-500' };
      case 'pending':
      default:
        return { text: 'Pending', color: 'text-yellow-500' };
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Spinner /></div>;
  }

  if (history.length === 0) {
    return <p className="text-center text-gray-500 p-8">No withdrawal history found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Method</th>
            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {history.map((item) => {
            const { text, color } = getStatusStyle(item.status);
            return (
                <tr key={item.id}>
                <td className="py-4 px-6 whitespace-nowrap">{new Date(item.timestamp).toLocaleString()}</td>
                <td className="py-4 px-6 whitespace-nowrap font-semibold">PKR {item.amount.toFixed(2)}</td>
                <td className="py-4 px-6 whitespace-nowrap">{item.method}</td>
                <td className={`py-4 px-6 whitespace-nowrap font-bold ${color}`}>{text}</td>
                </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default WithdrawalHistory;
