const db = require('../config/db');

// Report 1: Content by Genre
exports.getContentByGenre = async (req, res) => {
  try {
    const query = `
      SELECT 
        g.genre_id,
        g.genre_name,
        COUNT(c.content_id) AS total_titles,
        SUM(CASE WHEN c.content_type = 'Movie' THEN 1 ELSE 0 END) AS movie_count,
        SUM(CASE WHEN c.content_type = 'Series' THEN 1 ELSE 0 END) AS series_count
      FROM Genres g
      LEFT JOIN Content c ON g.genre_id = c.genre_id
      GROUP BY g.genre_id, g.genre_name
      ORDER BY total_titles DESC, g.genre_name ASC
    `;
    const [data] = await db.execute(query);
    res.json({
      success: true,
      query_description: 'Aggregates content distribution by genre using LEFT JOIN, COUNT, SUM(CASE), GROUP BY, and ORDER BY.',
      sql: query.trim(),
      data
    });
  } catch (error) {
    console.error('Report content-by-genre error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate report.', error: error.message });
  }
};

// Report 2: Subscribers by Plan
exports.getSubscribersByPlan = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.plan_id,
        p.plan_name,
        p.price,
        p.duration_days,
        COUNT(s.subscription_id) AS total_subscriptions_sold,
        SUM(CASE WHEN s.status = 'Active' THEN 1 ELSE 0 END) AS active_subscribers,
        SUM(CASE WHEN s.status = 'Expired' THEN 1 ELSE 0 END) AS expired_subscribers,
        SUM(CASE WHEN s.status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled_subscribers
      FROM SubscriptionPlans p
      LEFT JOIN Subscriptions s ON p.plan_id = s.plan_id
      GROUP BY p.plan_id, p.plan_name, p.price, p.duration_days
      ORDER BY active_subscribers DESC, total_subscriptions_sold DESC
    `;
    const [data] = await db.execute(query);
    res.json({
      success: true,
      query_description: 'Analyzes plan popularity and subscriber lifecycle status using LEFT JOIN, COUNT, conditional SUM, and GROUP BY.',
      sql: query.trim(),
      data
    });
  } catch (error) {
    console.error('Report subscribers-by-plan error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate report.', error: error.message });
  }
};

// Report 3: Revenue by Plan
exports.getRevenueByPlan = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.plan_id,
        p.plan_name,
        p.price,
        COUNT(s.subscription_id) AS sales_volume,
        COALESCE(SUM(s.amount_paid), 0.00) AS total_revenue,
        COALESCE(ROUND(AVG(s.amount_paid), 2), 0.00) AS avg_transaction_value
      FROM SubscriptionPlans p
      LEFT JOIN Subscriptions s ON p.plan_id = s.plan_id
      GROUP BY p.plan_id, p.plan_name, p.price
      ORDER BY total_revenue DESC
    `;
    const [data] = await db.execute(query);
    res.json({
      success: true,
      query_description: 'Calculates financial yield and sales volume per tier using JOIN, SUM, AVG, COALESCE, GROUP BY, and ORDER BY.',
      sql: query.trim(),
      data
    });
  } catch (error) {
    console.error('Report revenue-by-plan error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate report.', error: error.message });
  }
};

// Report 4: Top Content by Stream Count & Watch Time
exports.getTopContent = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.content_id,
        c.title,
        c.content_type,
        g.genre_name,
        c.release_year,
        COUNT(w.history_id) AS stream_count,
        COALESCE(SUM(w.progress_minutes), 0) AS total_minutes_watched,
        ROUND(COALESCE(SUM(w.progress_minutes), 0) / 60.0, 1) AS total_hours_watched
      FROM Content c
      JOIN Genres g ON c.genre_id = g.genre_id
      LEFT JOIN WatchHistory w ON c.content_id = w.content_id
      GROUP BY c.content_id, c.title, c.content_type, g.genre_name, c.release_year
      ORDER BY stream_count DESC, total_minutes_watched DESC
      LIMIT 10
    `;
    const [data] = await db.execute(query);
    res.json({
      success: true,
      query_description: 'Identifies most engaged content catalog titles using JOIN, COUNT, SUM, GROUP BY, and ORDER BY with LIMIT.',
      sql: query.trim(),
      data
    });
  } catch (error) {
    console.error('Report top-content error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate report.', error: error.message });
  }
};

// Report 5: Average Ratings by Title (with HAVING clause)
exports.getAverageRatings = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.content_id,
        c.title,
        c.content_type,
        g.genre_name,
        COUNT(r.rating_id) AS total_reviews,
        ROUND(AVG(r.rating), 2) AS average_rating,
        MIN(r.rating) AS min_rating,
        MAX(r.rating) AS max_rating
      FROM Content c
      JOIN Genres g ON c.genre_id = g.genre_id
      JOIN Ratings r ON c.content_id = r.content_id
      GROUP BY c.content_id, c.title, c.content_type, g.genre_name
      HAVING COUNT(r.rating_id) >= 1
      ORDER BY average_rating DESC, total_reviews DESC
    `;
    const [data] = await db.execute(query);
    res.json({
      success: true,
      query_description: 'Evaluates critical reception across titles using JOIN, AVG, MIN, MAX, COUNT, GROUP BY, HAVING, and ORDER BY.',
      sql: query.trim(),
      data
    });
  } catch (error) {
    console.error('Report average-ratings error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate report.', error: error.message });
  }
};

// SQL VIEW 1: vw_content_performance
exports.getViewPerformance = async (req, res) => {
  try {
    const query = 'SELECT * FROM vw_content_performance ORDER BY total_views DESC, avg_rating DESC';
    const [data] = await db.execute(query);
    res.json({
      success: true,
      view_name: 'vw_content_performance',
      query_description: 'Directly queries MySQL VIEW summarizing combined catalog telemetry, ratings, and view counts.',
      sql: query,
      data
    });
  } catch (error) {
    console.error('View performance error:', error);
    res.status(500).json({ success: false, message: 'Failed to query view.', error: error.message });
  }
};

// SQL VIEW 2: vw_active_subscriptions
exports.getActiveSubscriptionsView = async (req, res) => {
  try {
    const query = 'SELECT * FROM vw_active_subscriptions ORDER BY days_remaining ASC';
    const [data] = await db.execute(query);
    res.json({
      success: true,
      view_name: 'vw_active_subscriptions',
      query_description: 'Queries MySQL VIEW showing active subscribers with calculated countdown of days remaining.',
      sql: query,
      data
    });
  } catch (error) {
    console.error('Active subscriptions view error:', error);
    res.status(500).json({ success: false, message: 'Failed to query view.', error: error.message });
  }
};

// Interactive demonstration of TRIGGER: Attempt invalid insertion to prove trigger firing
exports.demoTrigger = async (req, res) => {
  try {
    // Deliberately violates end_date >= start_date constraint
    await db.execute(`
      INSERT INTO Subscriptions (user_id, plan_id, start_date, end_date, amount_paid)
      VALUES (3, 1, '2026-12-31', '2026-01-01', 149.00)
    `);
    res.json({ success: false, message: 'Trigger unexpectedly did not fire.' });
  } catch (error) {
    res.json({
      success: true,
      trigger_demonstration: 'trg_validate_subscription_insert',
      fired_as_expected: true,
      error_code: error.code,
      sql_state: error.sqlState,
      message_caught_from_mysql: error.sqlMessage || error.message,
      explanation: 'The MySQL trigger trg_validate_subscription_insert caught the invalid condition (end_date < start_date) and aborted the transaction with SIGNAL SQLSTATE 45000.'
    });
  }
};
