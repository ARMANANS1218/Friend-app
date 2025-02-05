// routes/users.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/users
// @desc    Get all users or search users by query
// @access  Private
router.get('/', auth, async (req, res) => {
  const { search } = req.query;
  try {
    let query = {};
    if (search) {
      // Search in username or email (case-insensitive)
      query = {
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }
    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/users/recommendations
// @desc    Get friend recommendations based on mutual friends
// @access  Private
router.get('/recommendations', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).populate('friends');
    if (!currentUser) return res.status(400).json({ message: 'User not found' });
    
    // IDs of current user's friends
    const currentFriendIds = currentUser.friends.map(friend => friend._id.toString());

    // Find users who are not current user's friends and not the user themself
    const users = await User.find({ 
      _id: { $ne: currentUser._id, $nin: currentFriendIds }
    }).select('-password');
    
    // Calculate mutual friends count for each candidate user
    const recommendations = await Promise.all(users.map(async user => {
      // Count mutual friends between candidate and current user
      const mutualFriendsCount = await User.countDocuments({ 
        _id: { $in: user.friends, $in: currentFriendIds } 
      });
      return {
        user,
        mutualFriends: mutualFriendsCount
      };
    }));

    // Optionally filter and sort by number of mutual friends
    const sortedRecommendations = recommendations
      .filter(rec => rec.mutualFriends > 0)
      .sort((a, b) => b.mutualFriends - a.mutualFriends);

    res.json(sortedRecommendations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
