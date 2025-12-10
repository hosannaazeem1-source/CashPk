import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import type { WithdrawalRequest, UserData, WithdrawalStatus } from '../../../types';
import Spinner from '../../../Spinner';

const AdminPanel: React.FC = () => {
  const [allWithdrawals, setAllWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  useEffect(() => {
    const requestsRef = db.ref('withdrawals');
    const onWithdrawalsChange = (snapshot: any) => {
      const data: WithdrawalRequest[] = [];
      snapshot.forEach((childSnapshot: any) => {
        data.push({ id: childSnapshot.key!, ...childSnapshot.val() });
      });
      setAllWithdrawals(data);
      setLoading(false);
    };
    
    requestsRef.on('value', onWithdrawalsChange);

    return () => requestsRef.off('value', onWithdrawalsChange);
  }, []);

  const handleRequest = async (request: WithdrawalRequest, newStatus: 'approved' | 'rejected') => {
    if (processingId) return;
    setProcessingId(request.id);

    const requestRef = db.ref(`withdrawals/${request.id}`);
    const userRef = db.ref(`users/${request.uid}`);
    
    try {
      await requestRef.update({ status: newStatus });
      
      if (newStatus === 'rejected') {
        await userRef.transaction((currentUserData: UserData | null) => {
          if (currentUserData) {
            currentUserData.balance = (currentUserData.balance || 0) + request.amount;
          }
          return currentUserData;
        });
      }
      
    } catch (error) {
      console.error(`Failed to ${newStatus} request:`, error);
      alert(`An error occurred. Please check the console.`);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusStyle = (status: WithdrawalStatus) => {
    switch (status) {
      case 'approved':
        return 'text-green-500 bg-green-100 dark:bg-green-800 dark:text-green-200';
      case 'rejected':
        return 'text-red-500 bg-red-100 dark:bg-red-800 dark:text-red-200';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Spinner /></div>;
  }

  const pendingRequests = allWithdrawals
    .filter((req) => req.status === 'pending')
    .sort((a, b) => a.timestamp - b.timestamp); // Oldest first

  const processedRequests = allWithdrawals
    .filter((req) => req.status === 'approved' || req.status === 'rejected')
    .sort((a, b) => b.timestamp - a.timestamp); // Newest first

  const renderPendingTable = () => (
    <>
      {pendingRequests.length === 0 ? (
        <p className="text-center text-gray-500 p-8">No pending withdrawal requests.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium">Date</th>
                <th className="py-3 px-4 text-left text-sm font-medium">User Email</th>
                <th className="py-3 px-4 text-left text-sm font-medium">Amount (PKR)</th>
                <th className="py-3 px-4 text-left text-sm font-medium">Method</th>
                <th className="py-3 px-4 text-left text-sm font-medium">Account Info</th>
                <th className="py-3 px-4 text-center text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {pendingRequests.map((req) => (
                <tr key={req.id}>
                  <td className="py-3 px-4">{new Date(req.timestamp).toLocaleString()}</td>
                  <td className="py-3 px-4">{req.email}</td>
                  <td className="py-3 px-4 font-bold">{req.amount.toFixed(2)}</td>
                  <td className="py-3 px-4">{req.method}</td>
                  <td className="py-3 px-4">{req.accountInfo}</td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => handleRequest(req, 'approved')} disabled={processingId === req.id} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 mr-2 disabled:bg-gray-400 text-sm">
                      {processingId === req.id ? '...' : 'Approve'}
                    </button>
                    <button onClick={() => handleRequest(req, 'rejected')} disabled={processingId === req.id} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:bg-gray-400 text-sm">
                      {processingId === req.id ? '...' : 'Reject'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  const renderHistoryTable = () => (
     <>
      {processedRequests.length === 0 ? (
        <p className="text-center text-gray-500 p-8">No processed withdrawal history.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium">Date</th>
                <th className="py-3 px-4 text-left text-sm font-medium">User Email</th>
                <th className="py-3 px-4 text-left text-sm font-medium">Amount (PKR)</th>
                <th className="py-3 px-4 text-left text-sm font-medium">Method</th>
                <th className="py-3 px-4 text-left text-sm font-medium">Account Info</th>
                <th className="py-3 px-4 text-center text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {processedRequests.map((req) => (
                <tr key={req.id}>
                  <td className="py-3 px-4">{new Date(req.timestamp).toLocaleString()}</td>
                  <td className="py-3 px-4">{req.email}</td>
                  <td className="py-3 px-4 font-bold">{req.amount.toFixed(2)}</td>
                  <td className="py-3 px-4">{req.method}</td>
                  <td className="py-3 px-4">{req.accountInfo}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${getStatusStyle(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Panel - Withdrawals</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-2 p-2">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`py-2 px-4 font-medium rounded-md ${activeTab === 'pending' ? 'bg-emerald-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                    Pending Requests ({pendingRequests.length})
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`py-2 px-4 font-medium rounded-md ${activeTab === 'history' ? 'bg-emerald-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                    Processed History
                </button>
            </nav>
        </div>
        <div className="p-4">
            {activeTab === 'pending' ? renderPendingTable() : renderHistoryTable()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
