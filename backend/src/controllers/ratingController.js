const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const { content_id, user_id } = req.query;

    let query = `
      SELECT 
        r.rating_id,
        r.user_id,
        u.name AS user_name,
        u.email AS user_email,
        r.content_id,
        c.title AS content_title,
        c.content_type,
        g.genre_name,
        r.rating,
        r.review,
        r.created_at
      FROM Ratings r
      JOIN Users u ON r.user_id = u.user_id
      JOIN Content c ON r.content_id = c.content_id
      JOIN Genres g ON c.genre_id = g.genre_id
      WHERE 1=1
    `;
    const params = [];

    if (content_id) {
      query += ' AND r.content_id = ?';
      params.push(content_id);
    }

    if (user_id) {
      query += ' AND r.user_id = ?';
      params.push(user_id);
    }

    query += ' ORDER BY r.created_at DESC';

    const [ratings] = await db.execute(query, params);
    res.json({ success: true, count: ratings.length, data: ratings });
  } catch (error) {
    console.error('Rating getAll error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve ratings.', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { user_id, content_id, rating, review } = req.body;

    if (!user_id || !content_id || rating === undefined) {
      return res.status(400).json({ success: false, message: 'User ID, Content ID, and Rating are required.' });
    }

    const numRating = parseFloat(rating);
    if (isNaN(numRating) || numRating < 1.0 || numRating > 5.0) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1.0 and 5.0.' });
    }

    // Insert or update rating (handles UNIQUE(user_id, content_id))
    const [result] = await db.execute(`
      INSERT INTO Ratings (user_id, content_id, rating, review)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        rating = VALUES(rating),
        review = VALUES(review),
        created_at = CURRENT_TIMESTAMP
    `, [user_id, content_id, numRating, review ? review.trim() : null]);

    res.status(201).json({
      success: true,
      message: 'Rating and review submitted successfully.',
      data: {
        user_id,
        content_id,
        rating: numRating,
        review
      }
    });
  } catch (error) {
    console.error('Rating create error:', error);
    res.status(500).json({
      success: false,
      message: error.sqlMessage || 'Failed to submit rating.',
      error: error.message
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;

    if (rating === undefined) {
      return res.status(400).json({ success: false, message: 'Rating value is required.' });
    }

    const numRating = parseFloat(rating);
    if (isNaN(numRating) || numRating < 1.0 || numRating > 5.0) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1.0 and 5.0.' });
    }

    const [result] = await db.execute(`
      UPDATE Ratings 
      SET rating = ?, review = ?
      WHERE rating_id = ?
    `, [numRating, review ? review.trim() : null, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Rating not found.' });
    }

    res.json({ success: true, message: 'Rating updated successfully.' });
  } catch (error) {
    console.error('Rating update error:', error);
    res.status(500).json({
      success: false,
      message: error.sqlMessage || 'Failed to update rating.',
      error: error.message
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM Ratings WHERE rating_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Rating not found.' });
    }
    res.json({ success: true, message: 'Rating deleted successfully.' });
  } catch (error) {
    console.error('Rating delete error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete rating.', error: error.message });
  }
};
