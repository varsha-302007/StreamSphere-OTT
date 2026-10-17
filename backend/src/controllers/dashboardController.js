const db = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    // 1. Total users count
    const [userCountResult] = await db.execute('SELECT COUNT(*) AS total_users FROM Users');
    const totalUsers = userCountResult[0].total_users;

    // 2. Total content count by type
    const [contentCountResult] = await db.execute(`
      SELECT 
        COUNT(*) AS total_content,
        SUM(CASE WHEN content_type = 'Movie' THEN 1 ELSE 0 END) AS total_movies,
        SUM(CASE WHEN content_type = 'Series' THEN 1 ELSE 0 END) AS total_series
      FROM Content
    `);

    // 3. Active subscriptions count
    const [activeSubResult] = await db.execute(
      "SELECT COUNT(*) AS active_subscriptions FROM Subscriptions WHERE status = 'Active'"
    );

    // 4. Revenue summary (total revenue, active subscription revenue)
    const [revenueResult] = await db.execute(`
      SELECT 
        COALESCE(SUM(amount_paid), 0.00) AS total_revenue,
        COALESCE(SUM(CASE WHEN status = 'Active' THEN amount_paid ELSE 0 END), 0.00) AS active_revenue
      FROM Subscriptions
    `);

    // 5. Content distribution by genre
    const [genreDistribution] = await db.execute(`
      SELECT 
        g.genre_name,
        COUNT(c.content_id) AS count
      FROM Genres g
      LEFT JOIN Content c ON g.genre_id = c.genre_id
      GROUP BY g.genre_id, g.genre_name
      ORDER BY count DESC
    `);

    // 6. Popular content (top streamed titles with view counts & ratings)
    const [popularContent] = await db.execute(`
      SELECT 
        c.content_id,
        c.title,
        c.content_type,
        g.genre_name,
        COUNT(DISTINCT w.history_id) AS views,
        COALESCE(ROUND(AVG(r.rating), 1), 0.0) AS avg_rating
      FROM Content c
      JOIN Genres g ON c.genre_id = g.genre_id
      LEFT JOIN WatchHistory w ON c.content_id = w.content_id
      LEFT JOIN Ratings r ON c.content_id = r.content_id
      GROUP BY c.content_id, c.title, c.content_type, g.genre_name
      ORDER BY views DESC, avg_rating DESC
      LIMIT 5
    `);

    // 7. Recent activity (latest watch sessions)
    const [recentActivity] = await db.execute(`
      SELECT 
        w.history_id,
        u.name AS user_name,
        c.title AS content_title,
        w.progress_minutes,
        w.watched_at
      FROM WatchHistory w
      JOIN Users u ON w.user_id = u.user_id
      JOIN Content c ON w.content_id = c.content_id
      ORDER BY w.watched_at DESC
      LIMIT 6
    `);

    res.json({
      success: true,
      data: {
        total_users: totalUsers,
        total_content: contentCountResult[0].total_content || 0,
        total_movies: contentCountResult[0].total_movies || 0,
        total_series: contentCountResult[0].total_series || 0,
        active_subscriptions: activeSubResult[0].active_subscriptions || 0,
        total_revenue: parseFloat(revenueResult[0].total_revenue) || 0,
        active_revenue: parseFloat(revenueResult[0].active_revenue) || 0,
        genre_distribution: genreDistribution,
        popular_content: popularContent,
        recent_activity: recentActivity
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to compute dashboard metrics.', error: error.message });
  }
};
