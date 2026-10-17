const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const { user_id, content_id } = req.query;

    let query = `
      SELECT 
        w.history_id,
        w.user_id,
        u.name AS user_name,
        u.email AS user_email,
        w.content_id,
        c.title AS content_title,
        c.content_type,
        g.genre_name,
        w.progress_minutes,
        w.watched_at
      FROM WatchHistory w
      JOIN Users u ON w.user_id = u.user_id
      JOIN Content c ON w.content_id = c.content_id
      JOIN Genres g ON c.genre_id = g.genre_id
      WHERE 1=1
    `;
    const params = [];

    if (user_id) {
      query += ' AND w.user_id = ?';
      params.push(user_id);
    }

    if (content_id) {
      query += ' AND w.content_id = ?';
      params.push(content_id);
    }

    query += ' ORDER BY w.watched_at DESC';

    const [history] = await db.execute(query, params);
    res.json({ success: true, count: history.length, data: history });
  } catch (error) {
    console.error('Watch history getAll error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve watch history.', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { user_id, content_id, progress_minutes } = req.body;

    if (!user_id || !content_id) {
      return res.status(400).json({ success: false, message: 'User ID and Content ID are required.' });
    }

    const progress = progress_minutes !== undefined ? parseInt(progress_minutes, 10) : 0;
    if (isNaN(progress) || progress < 0) {
      return res.status(400).json({ success: false, message: 'Progress minutes must be a non-negative integer.' });
    }

    // Verify user and content exist
    const [user] = await db.execute('SELECT user_id FROM Users WHERE user_id = ?', [user_id]);
    if (user.length === 0) {
      return res.status(400).json({ success: false, message: 'Specified user does not exist.' });
    }

    const [content] = await db.execute('SELECT content_id FROM Content WHERE content_id = ?', [content_id]);
    if (content.length === 0) {
      return res.status(400).json({ success: false, message: 'Specified content does not exist.' });
    }

    const [result] = await db.execute(`
      INSERT INTO WatchHistory (user_id, content_id, progress_minutes)
      VALUES (?, ?, ?)
    `, [user_id, content_id, progress]);

    res.status(201).json({
      success: true,
      message: 'Watch session recorded successfully.',
      data: {
        history_id: result.insertId,
        user_id,
        content_id,
        progress_minutes: progress
      }
    });
  } catch (error) {
    console.error('Watch history create error:', error);
    res.status(500).json({
      success: false,
      message: error.sqlMessage || 'Failed to record watch history.',
      error: error.message
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM WatchHistory WHERE history_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Watch record not found.' });
    }
    res.json({ success: true, message: 'Watch record deleted successfully.' });
  } catch (error) {
    console.error('Watch history delete error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete watch record.', error: error.message });
  }
};
