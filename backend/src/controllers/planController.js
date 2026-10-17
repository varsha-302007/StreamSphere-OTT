const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [plans] = await db.execute(`
      SELECT 
        p.plan_id,
        p.plan_name,
        p.price,
        p.duration_days,
        p.description,
        p.created_at,
        COUNT(s.subscription_id) AS total_subscribers,
        SUM(CASE WHEN s.status = 'Active' THEN 1 ELSE 0 END) AS active_subscribers
      FROM SubscriptionPlans p
      LEFT JOIN Subscriptions s ON p.plan_id = s.plan_id
      GROUP BY p.plan_id, p.plan_name, p.price, p.duration_days, p.description, p.created_at
      ORDER BY p.price ASC
    `);
    res.json({ success: true, data: plans });
  } catch (error) {
    console.error('Plan getAll error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve plans.', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { plan_name, price, duration_days, description } = req.body;

    if (!plan_name || price === undefined || !duration_days) {
      return res.status(400).json({ success: false, message: 'Plan name, price, and duration in days are required.' });
    }

    const numPrice = parseFloat(price);
    const numDays = parseInt(duration_days, 10);

    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ success: false, message: 'Price must be a non-negative number.' });
    }

    if (isNaN(numDays) || numDays <= 0) {
      return res.status(400).json({ success: false, message: 'Duration must be greater than zero days.' });
    }

    // Check duplicate
    const [existing] = await db.execute('SELECT plan_id FROM SubscriptionPlans WHERE plan_name = ?', [plan_name.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'A subscription plan with this name already exists.' });
    }

    const [result] = await db.execute(`
      INSERT INTO SubscriptionPlans (plan_name, price, duration_days, description)
      VALUES (?, ?, ?, ?)
    `, [plan_name.trim(), numPrice, numDays, description ? description.trim() : null]);

    res.status(201).json({
      success: true,
      message: 'Subscription plan created successfully.',
      data: {
        plan_id: result.insertId,
        plan_name: plan_name.trim(),
        price: numPrice,
        duration_days: numDays,
        description
      }
    });
  } catch (error) {
    console.error('Plan create error:', error);
    res.status(500).json({ success: false, message: 'Failed to create plan.', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { plan_name, price, duration_days, description } = req.body;

    if (!plan_name || price === undefined || !duration_days) {
      return res.status(400).json({ success: false, message: 'Required fields missing.' });
    }

    const numPrice = parseFloat(price);
    const numDays = parseInt(duration_days, 10);

    // Check duplicate
    const [existing] = await db.execute(
      'SELECT plan_id FROM SubscriptionPlans WHERE plan_name = ? AND plan_id != ?',
      [plan_name.trim(), id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Another plan already uses this name.' });
    }

    const [result] = await db.execute(`
      UPDATE SubscriptionPlans 
      SET plan_name = ?, price = ?, duration_days = ?, description = ?
      WHERE plan_id = ?
    `, [plan_name.trim(), numPrice, numDays, description ? description.trim() : null, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Plan not found.' });
    }

    res.json({
      success: true,
      message: 'Plan updated successfully.',
      data: { plan_id: parseInt(id, 10), plan_name: plan_name.trim(), price: numPrice, duration_days: numDays }
    });
  } catch (error) {
    console.error('Plan update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update plan.', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if subscriptions exist (ON DELETE RESTRICT)
    const [linked] = await db.execute('SELECT COUNT(*) AS count FROM Subscriptions WHERE plan_id = ?', [id]);
    if (linked[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete plan: ${linked[0].count} subscription record(s) reference this plan. Active or historical records must be retained.`
      });
    }

    const [result] = await db.execute('DELETE FROM SubscriptionPlans WHERE plan_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Plan not found.' });
    }

    res.json({ success: true, message: 'Plan deleted successfully.' });
  } catch (error) {
    console.error('Plan delete error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete plan.', error: error.message });
  }
};
