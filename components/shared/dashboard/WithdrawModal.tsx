import React, { useState } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { db } from '../../../services/firebase';
import Alert from '../Alert';

interface WithdrawModalProps {
  userId: string;
  userEmail: string;
  currentBalance: number;
  onClose: () => void;
}

const MIN_WITHDRAWAL = 100;

const WithdrawModal: React.FC<WithdrawModalProps> = ({ userId, userEmail, currentBalance, onClose }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'Easypaisa' | 'Jazzcash'>('Easypaisa');
  const [accountInfo, setAccountInfo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (numericAmount < MIN_WITHDRAWAL) {
      setError(`Minimum withdrawal amount is PKR ${MIN_WITHDRAWAL}.`);
      return;
    }
    if (numericAmount > currentBalance) {
      setError('Withdrawal amount cannot exceed your current balance.');
      return;
    }
    if (!accountInfo.trim()) {
      setError('Please enter your account information (e.g., phone number).');
      return;
    }

    setLoading(true);
    try {
      // Create withdrawal request in a unified 'withdrawals' location
      const requestsRef = db.ref('withdrawals');
      await requestsRef.push({
        uid: userId,
        email: userEmail,
        amount: numericAmount,
        method: method,
        accountInfo: accountInfo,
        status: 'pending',
        timestamp: firebase.database.ServerValue.TIMESTAMP,
      });

      // Deduct from user's balance
      const userRef = db.ref(`users/${userId}`);
      await userRef.update({
        balance: currentBalance - numericAmount,
      });

      setSuccess('Withdrawal request submitted successfully! It will be processed soon.');
      setAmount('');
      setAccountInfo('');
      setTimeout(onClose, 3000);
    } catch (err) {
      setError('Failed to submit request. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Request Withdrawal</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
            <i className="fas fa-times text-2xl"></i>
          </button>
        </div>
        
        {error && <Alert message={error} type="error" />}
        {success && <Alert message={success} type="success" />}

        {!success && (
          <form onSubmit={handleSubmit}>
            <p className="mb-4 text-gray-600 dark:text-gray-400">Current Balance: <span className="font-bold text-emerald-500">PKR {currentBalance.toFixed(2)}</span></p>
            <div className="mb-4">
              <label className="block mb-2 font-medium" htmlFor="amount">Amount (PKR)</label>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                placeholder={`Min. ${MIN_WITHDRAWAL}`}
                min={MIN_WITHDRAWAL}
                max={currentBalance}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-medium" htmlFor="method">Method</label>
              <select
                id="method"
                value={method}
                onChange={(e) => setMethod(e.target.value as 'Easypaisa' | 'Jazzcash')}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="Easypaisa">Easypaisa</option>
                <option value="Jazzcash">Jazzcash</option>
              </select>
            </div>
            <div className="mb-6">
              <label className="block mb-2 font-medium" htmlFor="accountInfo">Account Info (Phone Number)</label>
              <input
                id="accountInfo"
                type="text"
                value={accountInfo}
                onChange={(e) => setAccountInfo(e.target.value)}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                placeholder="e.g., 03001234567"
              />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-blue-300">
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default WithdrawModal;
