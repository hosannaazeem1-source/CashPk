import React, { useState } from 'react';
import { auth, db } from '../../../services/firebase';
import Alert from '../Alert';

interface SignUpProps {
  switchToLogin: () => void;
}

const ADMIN_EMAIL = 'admin@pkr.com'; // Special email for the admin account

const SignUp: React.FC<SignUpProps> = ({ switchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError('');
    setLoading(true);
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      if (!user) {
        throw new Error("User creation failed.");
      }

      // Assign role based on email
      const userRole = email.toLowerCase() === ADMIN_EMAIL ? 'admin' : 'user';

      // Create a user record in the Realtime Database
      await db.ref(`users/${user.uid}`).set({
        email: user.email,
        balance: 0,
        adsWatchedToday: 0,
        lastAdWatchDate: new Date().toISOString().split('T')[0],
        role: userRole,
      });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">Sign Up</h2>
      {error && <Alert message={error} type="error" />}
      <form onSubmit={handleSignUp}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="confirm-password">Confirm Password</label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600 transition duration-300 disabled:bg-emerald-300"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
      <p className="text-center mt-4 text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <button onClick={switchToLogin} className="text-emerald-500 hover:underline">
          Login
        </button>
      </p>
    </div>
  );
};

export default SignUp;