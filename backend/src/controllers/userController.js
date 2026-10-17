const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getAll = async (req, res) => {
  try {
    const { search, role } = req.query;
    let query = `
      SELECT 
        u.user_id, 
        u.name, 
        u.email, 
        u.role, 
        u.created_at,
        (SELECT COUNT(*) FROM Subscriptions s WHERE s.user_id = u.user_id AND s.status = 'Active') AS has_active_subscription,
        (SELECT COUNT(*) FROM WatchHistory w WHERE w.user_id = u.user_id) AS total_watched,
        (SELECT COUNT(*) FROM Ratings r WHERE r.user_id = u.user_id) AS total_reviews
      FROM Users u
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (u.name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (role && (role === 'Admin' || role === 'User')) {
      query += ' AND u.role = ?';
      params.push(role);
    }

    query += ' ORDER BY u.user_id DESC';

    const [users] = await db.execute(query, params);
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('User getAll error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve users.', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [users] = await db.execute(
      `SELECT user_id, name, email, role, created_at FROM Users WHERE user_id = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Fetch user's subscriptions
    const [subscriptions] = await db.execute(
      `SELECT s.*, p.plan_name 
       FROM Subscriptions s 
       JOIN SubscriptionPlans p ON s.plan_id = p.plan_id 
       WHERE s.user_id = ? 
       ORDER BY s.created_at DESC`,
      [id]
    );

    // Fetch user's ratings
    const [ratings] = await db.execute(
      `SELECT r.*, c.title 
       FROM Ratings r 
       JOIN Content c ON r.content_id = c.content_id 
       WHERE r.user_id = ? 
       ORDER BY r.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...users[0],
        subscriptions,
        ratings
      }
    });
  } catch (error) {
    console.error('User getById error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve user details.', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    // Check duplicate email
    const [existing] = await db.execute('SELECT user_id FROM Users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email address already in use.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const userRole = role === 'Admin' ? 'Admin' : 'User';

    const [result] = await db.execute(
      'INSERT INTO Users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), password_hash, userRole]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: {
        user_id: result.insertId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: userRole
      }
    });
  } catch (error) {
    console.error('User create error:', error);
    res.status(500).json({ success: false, message: 'Failed to create user.', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    // Check email uniqueness excluding current user
    const [existing] = await db.execute(
      'SELECT user_id FROM Users WHERE email = ? AND user_id != ?',
      [email.trim().toLowerCase(), id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email is already used by another account.' });
    }

    const userRole = role === 'Admin' ? 'Admin' : 'User';

    if (password && password.trim().length > 0) {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password.trim(), salt);
      await db.execute(
        'UPDATE Users SET name = ?, email = ?, role = ?, password_hash = ? WHERE user_id = ?',
        [name.trim(), email.trim().toLowerCase(), userRole, password_hash, id]
      );
    } else {
      await db.execute(
        'UPDATE Users SET name = ?, email = ?, role = ? WHERE user_id = ?',
        [name.trim(), email.trim().toLowerCase(), userRole, id]
      );
    }

    res.json({
      success: true,
      message: 'User updated successfully.',
      data: { user_id: parseInt(id, 10), name: name.trim(), email: email.trim().toLowerCase(), role: userRole }
    });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user.', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // Safety: prevent self-deletion if logged in
    if (req.user && parseInt(req.user.user_id, 10) === parseInt(id, 10)) {
      return res.status(400).json({ success: false, message: 'Security restriction: You cannot delete your own account.' });
    }

    const [result] = await db.execute('DELETE FROM Users WHERE user_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    console.error('User delete error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user.', error: error.message });
  }
};
