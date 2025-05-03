import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { AdminContext } from '../Context/AdminContext.jsx';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AdminContext);
    const navigate = useNavigate();
  
    const handleLogin = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.post('/api/auth/admin/login', { 
          email, 
          password 
        });
        
        // Store token using context method
        login(response.data.token);
        
        // Redirect to dashboard
        navigate('/mainpage');
      } catch (err) {
        setError(err.response?.data?.message || 'Login failed');
      }
    };
  
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        
        <header
          className="bg-blue-500 text-white text-center py-4 w-full fixed top-0 left-0 z-10 flex gap-10 justify-center items-center">
          <Link to="/maintenance">Mantainence Page</Link>
          <Link to="/homepage">Property Page</Link>

            
          </header>
        
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h2 className="text-2xl mb-6 text-center">Admin Login</h2>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 mb-4 border rounded"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 mb-4 border rounded"
              required
            />
            <button 
              type="submit" 
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Login
            </button>
          </form>
        </div>
      </div>
      );
}

export default Login
