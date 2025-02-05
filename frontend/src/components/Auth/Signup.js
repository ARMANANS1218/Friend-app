// src/components/Auth/Signup.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [interests, setInterests] = useState('');
  const { signup } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // interests can be sent as comma separated values, convert to array
    const interestsArray = interests.split(',').map(s => s.trim()).filter(s => s);
    try {
      await signup(username, email, password, interestsArray);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label><br />
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
        </div>
        <div>
          <label>Email:</label><br />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label><br />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div>
          <label>Interests (comma separated):</label><br />
          <input type="text" value={interests} onChange={e => setInterests(e.target.value)} />
        </div>
        <button type="submit">Signup</button>
      </form>
    </div>
  );
};

export default Signup;
