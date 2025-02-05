// routes/friends.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

/**
 * @route   POST /api/friends/request/:id
 * @desc    Send a friend request to the user with the given ID
 * @access  Private
 */
router.post('/request/:id', auth, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: "You cannot send a friend request to yourself." });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    // Check if they are already friends
    if (targetUser.friends.includes(currentUserId)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    // Check if a friend request has already been sent
    const existingRequest = targetUser.friendRequests.find(req => req.from.toString() === currentUserId);
    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Add friend request to target user's friendRequests array
    targetUser.friendRequests.push({ from: currentUserId, status: 'pending' });
    await targetUser.save();

    res.json({ message: 'Friend request sent' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @route   POST /api/friends/accept/:id
 * @desc    Accept a friend request from the user with the given ID
 * @access  Private
 */
router.post('/accept/:id', auth, async (req, res) => {
  try {
    const requesterId = req.params.id;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    const requesterUser = await User.findById(requesterId);

    if (!currentUser || !requesterUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the pending friend request
    const friendRequest = currentUser.friendRequests.find(req => req.from.toString() === requesterId && req.status === 'pending');
    if (!friendRequest) {
      return res.status(400).json({ message: 'No pending friend request from this user' });
    }

    // Update the friend request status to accepted
    friendRequest.status = 'accepted';

    // Add each other as friends
    currentUser.friends.push(requesterId);
    requesterUser.friends.push(currentUserId);

    await currentUser.save();
    await requesterUser.save();

    res.json({ message: 'Friend request accepted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @route   POST /api/friends/decline/:id
 * @desc    Decline a friend request from the user with the given ID
 * @access  Private
 */
router.post('/decline/:id', auth, async (req, res) => {
  try {
    const requesterId = req.params.id;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    // Find the pending friend request from this user
    const friendRequest = currentUser.friendRequests.find(req => req.from.toString() === requesterId && req.status === 'pending');
    if (!friendRequest) {
      return res.status(400).json({ message: 'No pending friend request from this user' });
    }

    // Update the friend request status to rejected (declined)
    friendRequest.status = 'rejected';
    await currentUser.save();

    res.json({ message: 'Friend request declined' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @route   GET /api/friends/requests
 * @desc    Get incoming friend requests (notifications) for the current user
 * @access  Private
 */
router.get('/requests', auth, async (req, res) => {
  try {
    // Retrieve current user along with friend request details
    const currentUser = await User.findById(req.user.id)
      .populate('friendRequests.from', 'username email'); // populate sender details

    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    // Filter to show only pending requests as notifications
    const pendingRequests = currentUser.friendRequests.filter(req => req.status === 'pending');

    res.json({ friendRequests: pendingRequests });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @route   DELETE /api/friends/unfriend/:id
 * @desc    Remove a friend with the given ID
 * @access  Private
 */
router.delete('/unfriend/:id', auth, async (req, res) => {
  try {
    const friendId = req.params.id;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    const friendUser = await User.findById(friendId);

    if (!currentUser || !friendUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove the friend from both users' friend lists
    currentUser.friends = currentUser.friends.filter(id => id.toString() !== friendId);
    friendUser.friends = friendUser.friends.filter(id => id.toString() !== currentUserId);

    await currentUser.save();
    await friendUser.save();

    res.json({ message: 'Unfriended successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
