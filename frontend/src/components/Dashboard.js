// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import api from '../api';
import UserSearch from './UserSearch';
import FriendsList from './FriendsList';
import FriendRequests from './FriendRequests';

const Dashboard = () => {
  const [allUsers, setAllUsers] = useState([]);

  // Optionally, load all users or handle search in UserSearch component.
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setAllUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <UserSearch />
      <FriendsList />
      <FriendRequests />
      <div>
        <h3>All Users (for demo):</h3>
        <ul>
          {allUsers.map(user => (
            <li key={user._id}>{user.username} ({user.email})</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
