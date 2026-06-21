const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateProfile, getAllUsers, updateUserRole } = require('../controllers/authController');
const { protect, admin } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateProfile);

// Admin User Management Routes
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
// Google OAuth Callback
router.get('/google/callback', passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}/login` }),
  (req, res) => {
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=server_configuration`);
    }
    // Generate JWT for the user matching authController payload
    const token = jwt.sign({ id: req.user._id, role: req.user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?token=${token}`);
  }
);

module.exports = router;
