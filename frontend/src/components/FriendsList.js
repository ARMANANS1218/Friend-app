// src/components/FriendsList.js
import React, { useState, useEffect } from 'react';
import api from '../api';

const FriendsList = () => {
  const [friends, setFriends] = useState([]);

  const fetchFriends = async () => {
    try {
      // Assuming an endpoint that returns the current user's friends
      const res = await api.get('/users'); // Or create a dedicated endpoint
      // For demo, filter users with friend relationship if available.
      // You may want to adjust this based on your actual data model.
      setFriends(res.data.filter(user => user.friends && user.friends.includes(user._id)));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const unfriend = async (friendId) => {
    try {
      await api.delete(`/friends/unfriend/${friendId}`);
      alert('Unfriended successfully!');
      fetchFriends();
    } catch (err) {
      alert(err.response?.data?.message || 'Error unfriending');
    }
  };

  return (
    <div>
      <h3>Your Friends</h3>
      {friends.length === 0 ? (
        <p>No friends added yet.</p>
      ) : (
        <ul>
          {friends.map(friend => (
            <li key={friend._id}>
              {friend.username}
              <button onClick={() => unfriend(friend._id)}>Unfriend</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FriendsList;
