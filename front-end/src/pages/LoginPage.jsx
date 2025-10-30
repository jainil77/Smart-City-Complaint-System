import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';    

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login',
        { email, password },
        { withCredentials: true }
      );

      const userData = response.data;
      login(userData); // Save user to global state

      // Redirect based on role
      if (userData.role === 'superadmin') {
        navigate('/superadmin');
      } else if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Invalid email or password.');
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <form onSubmit={handleLogin} className="bg-zinc-900 p-8 rounded-lg shadow-lg w-96 border border-zinc-700">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Login</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-zinc-400 mb-2" htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-zinc-400 mb-2" htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
        <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg">
          Log In
        </button>

        <p className="text-center text-zinc-400 text-sm mt-6">
        Don't have an account?{' '}
        <Link to="/signup" className="font-semibold text-purple-400 hover:underline">
          Sign Up
        </Link>
      </p>
      </form>
    </div>
  );
}

export default LoginPage;