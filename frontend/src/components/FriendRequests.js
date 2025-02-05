// src/components/FriendRequests.js
import React, { useState, useEffect } from 'react';
import api from '../api';

const FriendRequests = () => {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/friends/requests');
      setRequests(res.data.friendRequests);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const acceptRequest = async (fromId) => {
    try {
      await api.post(`/friends/accept/${fromId}`);
      alert('Friend request accepted!');
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Error accepting request');
    }
  };

  const declineRequest = async (fromId) => {
    try {
      await api.post(`/friends/decline/${fromId}`);
      alert('Friend request declined!');
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Error declining request');
    }
  };

  return (
    <div>
      <h3>Friend Requests</h3>
      {requests.length === 0 ? (
        <p>No pending friend requests.</p>
      ) : (
        <ul>
          {requests.map((req) => (
            <li key={req.from._id}>
              {req.from.username} ({req.from.email})
              <button onClick={() => acceptRequest(req.from._id)}>Accept</button>
              <button onClick={() => declineRequest(req.from._id)}>Decline</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FriendRequests;
