// src/components/UserSearch.js
import React, { useState } from 'react';
import api from '../api';

const UserSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await api.get(`/users?search=${query}`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      await api.post(`/friends/request/${userId}`);
      alert('Friend request sent!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending friend request');
    }
  };

  return (
    <div>
      <h3>Search Users</h3>
      <form onSubmit={handleSearch}>
        <input 
          type="text" 
          value={query} 
          onChange={e => setQuery(e.target.value)} 
          placeholder="Search by username or email" 
          required 
        />
        <button type="submit">Search</button>
      </form>
      {results.length > 0 && (
        <ul>
          {results.map(user => (
            <li key={user._id}>
              {user.username} ({user.email})
              <button onClick={() => sendFriendRequest(user._id)}>Add Friend</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserSearch;
