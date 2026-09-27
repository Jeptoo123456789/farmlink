import { Router } from 'express';
import { getDatabase, saveDatabase, User } from '../db.js';
import { hashPassword, comparePassword, generateToken, requireAuth, AuthenticatedRequest } from '../auth.js';

const router = Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, location, address } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required.' });
    }

    if (role !== 'buyer' && role !== 'seller') {
      return res.status(400).json({ error: 'Role must be either "buyer" or "seller".' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const db = getDatabase();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const password_hash = await hashPassword(password);
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash,
      role,
      phone: phone || '',
      location: location || '',
      address: address || '',
      bio: '',
      avatar_url: '',
      created_at: new Date().toISOString(),
    };

    db.users.push(newUser);
    saveDatabase();

    const token = generateToken(newUser);
    const { password_hash: _, ...safeUser } = newUser;

    return res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: safeUser,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to register account.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const db = getDatabase();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const { password_hash: _, ...safeUser } = user;

    return res.json({
      message: 'Login successful.',
      token,
      user: safeUser,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to process login.' });
  }
});

// Get current user profile
router.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  const { password_hash: _, ...safeUser } = req.user;
  return res.json({ user: safeUser });
});

// Update profile
router.put('/profile', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { name, phone, location, address, bio, avatar_url } = req.body;
    const db = getDatabase();
    const userIndex = db.users.findIndex(u => u.id === req.user!.id);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (name) db.users[userIndex].name = name.trim();
    if (phone !== undefined) db.users[userIndex].phone = phone.trim();
    if (location !== undefined) db.users[userIndex].location = location.trim();
    if (address !== undefined) db.users[userIndex].address = address.trim();
    if (bio !== undefined) db.users[userIndex].bio = bio.trim();
    if (avatar_url !== undefined) db.users[userIndex].avatar_url = avatar_url;

    // If seller updated their name or location, also update on their active products
    if (db.users[userIndex].role === 'seller') {
      db.products.forEach(p => {
        if (p.seller_id === req.user!.id) {
          if (name) p.seller_name = name.trim();
          if (location) p.seller_location = location.trim();
        }
      });
    }

    saveDatabase();
    const { password_hash: _, ...safeUser } = db.users[userIndex];
    return res.json({ message: 'Profile updated successfully.', user: safeUser });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// Update password
router.put('/password', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const db = getDatabase();
    const user = db.users.find(u => u.id === req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const valid = await comparePassword(current_password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ error: 'Incorrect current password.' });
    }

    user.password_hash = await hashPassword(new_password);
    saveDatabase();

    return res.json({ message: 'Password updated successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update password.' });
  }
});

// Forgot password request
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }
  const db = getDatabase();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) {
    // For security, don't disclose whether email exists
    return res.json({
      message: 'If an account exists with this email, password reset instructions have been dispatched.',
      mockResetToken: 'FL-RESET-DEMO',
    });
  }
  return res.json({
    message: 'Password reset link sent to your email. You can reset using the reset token provided.',
    mockResetToken: 'FL-RESET-DEMO',
  });
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, new_password } = req.body;
    if (!email || !token || !new_password) {
      return res.status(400).json({ error: 'Email, reset token, and new password are required.' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const db = getDatabase();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(400).json({ error: 'Invalid reset request or expired token.' });
    }

    user.password_hash = await hashPassword(new_password);
    saveDatabase();

    return res.json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
});

export default router;
