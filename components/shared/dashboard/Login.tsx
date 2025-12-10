import React, { useState } from 'react';
import { auth } from '../../../services/firebase';
import Alert from '../Alert';

interface LoginProps {
  switchToSignUp: () => void;
}

const Login: React.FC<LoginProps> = ({ switchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">Login</h2>
      {error && <Alert message={error} type="error" />}
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600 transition duration-300 disabled:bg-emerald-300"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="text-center mt-4 text-gray-600 dark:text-gray-400">
        Don't have an account?{' '}
        <button onClick={switchToSignUp} className="text-emerald-500 hover:underline">
          Sign Up
        </button>
      </p>
    </div>
  );
};

export default Login;
