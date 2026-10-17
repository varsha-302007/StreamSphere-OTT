const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const { search, genre_id, content_type, release_year, availability_status, sort_by } = req.query;

    let query = `
      SELECT 
        c.content_id,
        c.title,
        c.content_type,
        c.genre_id,
        g.genre_name,
        c.release_year,
        c.duration_minutes,
        c.description,
        c.availability_status,
        c.created_at,
        COUNT(DISTINCT w.history_id) AS total_views,
        COUNT(DISTINCT r.rating_id) AS total_ratings,
        COALESCE(ROUND(AVG(r.rating), 1), 0.0) AS avg_rating
      FROM Content c
      JOIN Genres g ON c.genre_id = g.genre_id
      LEFT JOIN WatchHistory w ON c.content_id = w.content_id
      LEFT JOIN Ratings r ON c.content_id = r.content_id
      WHERE 1=1
    `;
    const params = [];

    if (search && search.trim().length > 0) {
      query += ' AND c.title LIKE ?';
      params.push(`%${search.trim()}%`);
    }

    if (genre_id) {
      query += ' AND c.genre_id = ?';
      params.push(genre_id);
    }

    if (content_type && (content_type === 'Movie' || content_type === 'Series')) {
      query += ' AND c.content_type = ?';
      params.push(content_type);
    }

    if (release_year) {
      query += ' AND c.release_year = ?';
      params.push(release_year);
    }

    if (availability_status) {
      query += ' AND c.availability_status = ?';
      params.push(availability_status);
    }

    query += ' GROUP BY c.content_id, c.title, c.content_type, c.genre_id, g.genre_name, c.release_year, c.duration_minutes, c.description, c.availability_status, c.created_at';

    if (sort_by === 'rating') {
      query += ' ORDER BY avg_rating DESC, total_ratings DESC';
    } else if (sort_by === 'views') {
      query += ' ORDER BY total_views DESC';
    } else if (sort_by === 'year') {
      query += ' ORDER BY c.release_year DESC';
    } else {
      query += ' ORDER BY c.content_id DESC';
    }

    const [contentList] = await db.execute(query, params);
    res.json({ success: true, count: contentList.length, data: contentList });
  } catch (error) {
    console.error('Content getAll error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve content.', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(`
      SELECT 
        c.*,
        g.genre_name,
        COUNT(DISTINCT w.history_id) AS total_views,
        COUNT(DISTINCT r.rating_id) AS total_ratings,
        COALESCE(ROUND(AVG(r.rating), 1), 0.0) AS avg_rating
      FROM Content c
      JOIN Genres g ON c.genre_id = g.genre_id
      LEFT JOIN WatchHistory w ON c.content_id = w.content_id
      LEFT JOIN Ratings r ON c.content_id = r.content_id
      WHERE c.content_id = ?
      GROUP BY c.content_id, g.genre_name
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Content not found.' });
    }

    // Fetch ratings/reviews for this content
    const [reviews] = await db.execute(`
      SELECT 
        r.rating_id,
        r.user_id,
        u.name AS user_name,
        r.rating,
        r.review,
        r.created_at
      FROM Ratings r
      JOIN Users u ON r.user_id = u.user_id
      WHERE r.content_id = ?
      ORDER BY r.created_at DESC
    `, [id]);

    res.json({
      success: true,
      data: {
        ...rows[0],
        reviews
      }
    });
  } catch (error) {
    console.error('Content getById error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve content details.', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, content_type, genre_id, release_year, duration_minutes, description, availability_status } = req.body;

    if (!title || !content_type || !genre_id || !release_year) {
      return res.status(400).json({
        success: false,
        message: 'Title, content type, genre, and release year are required.'
      });
    }

    // Verify genre exists
    const [genreCheck] = await db.execute('SELECT genre_id FROM Genres WHERE genre_id = ?', [genre_id]);
    if (genreCheck.length === 0) {
      return res.status(400).json({ success: false, message: 'Specified genre does not exist.' });
    }

    const year = parseInt(release_year, 10);
    if (isNaN(year) || year < 1900 || year > 2100) {
      return res.status(400).json({ success: false, message: 'Release year must be between 1900 and 2100.' });
    }

    const duration = duration_minutes ? parseInt(duration_minutes, 10) : null;
    if (duration !== null && duration <= 0) {
      return res.status(400).json({ success: false, message: 'Duration must be a positive number of minutes.' });
    }

    const status = availability_status || 'Available';

    const [result] = await db.execute(`
      INSERT INTO Content (title, content_type, genre_id, release_year, duration_minutes, description, availability_status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title.trim(), content_type, genre_id, year, duration, description ? description.trim() : null, status]);

    res.status(201).json({
      success: true,
      message: 'Content created successfully.',
      data: {
        content_id: result.insertId,
        title: title.trim(),
        content_type,
        genre_id,
        release_year: year,
        duration_minutes: duration,
        availability_status: status
      }
    });
  } catch (error) {
    console.error('Content create error:', error);
    res.status(500).json({ success: false, message: 'Failed to create content.', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content_type, genre_id, release_year, duration_minutes, description, availability_status } = req.body;

    if (!title || !content_type || !genre_id || !release_year) {
      return res.status(400).json({ success: false, message: 'Required fields missing.' });
    }

    const year = parseInt(release_year, 10);
    const duration = duration_minutes ? parseInt(duration_minutes, 10) : null;

    const [result] = await db.execute(`
      UPDATE Content 
      SET title = ?, content_type = ?, genre_id = ?, release_year = ?, duration_minutes = ?, description = ?, availability_status = ?
      WHERE content_id = ?
    `, [title.trim(), content_type, genre_id, year, duration, description ? description.trim() : null, availability_status || 'Available', id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Content not found.' });
    }

    res.json({
      success: true,
      message: 'Content updated successfully.',
      data: { content_id: parseInt(id, 10), title: title.trim(), content_type, genre_id, release_year: year }
    });
  } catch (error) {
    console.error('Content update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update content.', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM Content WHERE content_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Content not found.' });
    }

    res.json({ success: true, message: 'Content and associated viewing records deleted successfully.' });
  } catch (error) {
    console.error('Content delete error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete content.', error: error.message });
  }
};
