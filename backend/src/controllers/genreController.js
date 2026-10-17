const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [genres] = await db.execute(`
      SELECT 
        g.genre_id, 
        g.genre_name, 
        g.description,
        COUNT(c.content_id) AS total_content
      FROM Genres g
      LEFT JOIN Content c ON g.genre_id = c.genre_id
      GROUP BY g.genre_id, g.genre_name, g.description
      ORDER BY g.genre_name ASC
    `);
    res.json({ success: true, data: genres });
  } catch (error) {
    console.error('Genre getAll error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve genres.', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { genre_name, description } = req.body;

    if (!genre_name || genre_name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Genre name is required.' });
    }

    const [existing] = await db.execute('SELECT genre_id FROM Genres WHERE genre_name = ?', [genre_name.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'A genre with this name already exists.' });
    }

    const [result] = await db.execute(
      'INSERT INTO Genres (genre_name, description) VALUES (?, ?)',
      [genre_name.trim(), description ? description.trim() : null]
    );

    res.status(201).json({
      success: true,
      message: 'Genre created successfully.',
      data: {
        genre_id: result.insertId,
        genre_name: genre_name.trim(),
        description: description ? description.trim() : null
      }
    });
  } catch (error) {
    console.error('Genre create error:', error);
    res.status(500).json({ success: false, message: 'Failed to create genre.', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { genre_name, description } = req.body;

    if (!genre_name || genre_name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Genre name is required.' });
    }

    // Check duplicate
    const [existing] = await db.execute(
      'SELECT genre_id FROM Genres WHERE genre_name = ? AND genre_id != ?',
      [genre_name.trim(), id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Another genre already uses this name.' });
    }

    const [result] = await db.execute(
      'UPDATE Genres SET genre_name = ?, description = ? WHERE genre_id = ?',
      [genre_name.trim(), description ? description.trim() : null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Genre not found.' });
    }

    res.json({
      success: true,
      message: 'Genre updated successfully.',
      data: { genre_id: parseInt(id, 10), genre_name: genre_name.trim(), description }
    });
  } catch (error) {
    console.error('Genre update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update genre.', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if any content is linked (respecting ON DELETE RESTRICT)
    const [linkedContent] = await db.execute('SELECT COUNT(*) AS count FROM Content WHERE genre_id = ?', [id]);
    if (linkedContent[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete genre: ${linkedContent[0].count} content title(s) are assigned to it. Reassign them first.`
      });
    }

    const [result] = await db.execute('DELETE FROM Genres WHERE genre_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Genre not found.' });
    }

    res.json({ success: true, message: 'Genre deleted successfully.' });
  } catch (error) {
    console.error('Genre delete error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete genre.', error: error.message });
  }
};
