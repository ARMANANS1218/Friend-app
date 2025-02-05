// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [message, setMessage] = useState('');

  // Fetch recommendations on load
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await api.get('/users/recommendations');
        setRecommendations(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRecommendations();
  }, []);

  // Search users as query changes
  useEffect(() => {
    const fetchUsers = async () => {
      if (!searchQuery) {
        setUsers([]);
        return;
      }
      try {
        const res = await api.get(`/users?q=${searchQuery}`);
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Handle sending friend request
  const sendFriendRequest = async (userId) => {
    try {
      const res = await api.post(`/users/${userId}/request`);
      setMessage(res.data.msg);
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Error sending request');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Home</h2>

      {message && <p style={{ color: 'green' }}>{message}</p>}

      <div>
        <input
          type="text"
          placeholder="Search for users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '5px', width: '250px' }}
        />
      </div>

      {/* Display search results */}
      {users.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Search Results:</h3>
          <ul>
            {users.map((user) => (
              <li key={user._id} style={{ marginBottom: '10px' }}>
                {user.username}{' '}
                <button onClick={() => sendFriendRequest(user._id)}>Send Friend Request</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Friend Recommendations */}
      {recommendations.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Friend Recommendations:</h3>
          <ul>
            {recommendations.map((rec) => (
              <li key={rec._id}>
                {rec.username} - Mutual Friends: {rec.mutualFriendsCount}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Note: For full friend request management (accept/reject/unfriend), you would create additional endpoints and UI controls.
          You might fetch friendRequests from your API and render them here similarly. */}
    </div>
  );
};

export default Home;
