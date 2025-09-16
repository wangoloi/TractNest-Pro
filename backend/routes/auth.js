const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ error: 'Account is not active.' });
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        access_level: user.access_level
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// Register route (only for owner to create admins)
router.post('/register', auth, async (req, res) => {
  try {
    const { username, password, name, email, phone, role, businessData, generatedUsername, generatedPassword } = req.body;

    // Only owner can register new users
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Only owner can register new users.' });
    }

    if (!username || !password || !name || !email) {
      return res.status(400).json({ error: 'Required fields are missing.' });
    }

    // Check if username or email already exists
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [{ username }, { email }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists.' });
    }

    // Create user with generated credentials
    const user = await User.create({
      username,
      password,
      name,
      email,
      phone,
      role: role || 'admin',
      status: 'active',
      access_level: 'full',
      generated_username: generatedUsername,
      generated_password: generatedPassword,
      credentials_generated_at: new Date()
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        generated_username: user.generated_username,
        generated_password: user.generated_password,
        credentials_generated_at: user.credentials_generated_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// Verify token route
router.get('/verify', auth, async (req, res) => {
  try {
    res.json({
      message: 'Token is valid',
      user: {
        id: req.user.id,
        username: req.user.username,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        status: req.user.status,
        access_level: req.user.access_level
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Token verification failed.' });
  }
});

// Logout route (client-side token removal)
router.post('/logout', auth, async (req, res) => {
  try {
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed.' });
  }
});

module.exports = router;
