import React, { useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import type { UserData } from '../../../types';

import AdWatcher from './AdWatcher';
import AdHistory from '../history/AdHistory';
import WithdrawalHistory from '../history/WithdrawalHistory';
import WithdrawModal from './WithdrawModal';

interface DashboardProps {
  user: FirebaseUser;
  userData: UserData | null;
}

type View = 'dashboard' | 'adHistory' | 'withdrawalHistory';

const Dashboard: React.FC<DashboardProps> = ({ user, userData }) => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const balance = userData?.balance ?? 0;
  const canWithdraw = balance >= 100;

  const renderView = () => {
    switch (currentView) {
      case 'adHistory':
        return <AdHistory userId={user.uid} />;
      case 'withdrawalHistory':
        return <WithdrawalHistory userId={user.uid} />;
      case 'dashboard':
      default:
        return <AdWatcher user={user} userData={userData} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md col-span-1 md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Current Balance</h2>
          <p className="text-4xl font-bold text-emerald-500">PKR {balance.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col justify-center items-center">
          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            disabled={!canWithdraw}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            Withdraw Funds
          </button>
          {!canWithdraw && <p className="text-xs text-center mt-2 text-gray-500">Min. withdraw is PKR 100</p>}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
          <nav className="flex space-x-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`py-2 px-4 font-medium ${currentView === 'dashboard' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-gray-500 dark:text-gray-400'}`}
            >
              Watch Ads
            </button>
            <button
              onClick={() => setCurrentView('adHistory')}
              className={`py-2 px-4 font-medium ${currentView === 'adHistory' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-gray-500 dark:text-gray-400'}`}
            >
              Ad History
            </button>
            <button
              onClick={() => setCurrentView('withdrawalHistory')}
              className={`py-2 px-4 font-medium ${currentView === 'withdrawalHistory' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-gray-500 dark:text-gray-400'}`}
            >
              Withdrawal History
            </button>
          </nav>
        </div>
        <div className="mt-6">
          {renderView()}
        </div>
      </div>
      
      {isWithdrawModalOpen && (
        <WithdrawModal
          userId={user.uid}
          userEmail={user.email!}
          currentBalance={balance}
          onClose={() => setIsWithdrawModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
