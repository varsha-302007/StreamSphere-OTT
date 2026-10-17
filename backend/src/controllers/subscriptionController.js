const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const { status, user_id, plan_id } = req.query;

    let query = `
      SELECT 
        s.subscription_id,
        s.user_id,
        u.name AS user_name,
        u.email AS user_email,
        s.plan_id,
        p.plan_name,
        p.duration_days,
        s.start_date,
        s.end_date,
        s.status,
        s.amount_paid,
        s.created_at,
        DATEDIFF(s.end_date, CURRENT_DATE()) AS days_remaining
      FROM Subscriptions s
      JOIN Users u ON s.user_id = u.user_id
      JOIN SubscriptionPlans p ON s.plan_id = p.plan_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND s.status = ?';
      params.push(status);
    }

    if (user_id) {
      query += ' AND s.user_id = ?';
      params.push(user_id);
    }

    if (plan_id) {
      query += ' AND s.plan_id = ?';
      params.push(plan_id);
    }

    query += ' ORDER BY s.subscription_id DESC';

    const [subscriptions] = await db.execute(query, params);
    res.json({ success: true, count: subscriptions.length, data: subscriptions });
  } catch (error) {
    console.error('Subscription getAll error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve subscriptions.', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { user_id, plan_id, start_date } = req.body;

    if (!user_id || !plan_id) {
      return res.status(400).json({ success: false, message: 'User ID and Plan ID are required.' });
    }

    // Call MySQL Stored Procedure: sp_register_subscription
    // Uses transaction and handles existing active subscriptions atomicity
    const formattedDate = start_date || null;
    
    // Execute CALL query
    await db.query('CALL sp_register_subscription(?, ?, ?, @sub_id, @msg)', [
      user_id,
      plan_id,
      formattedDate
    ]);

    const [outParams] = await db.query('SELECT @sub_id AS subscription_id, @msg AS message');
    const resultId = outParams[0].subscription_id;
    const resultMsg = outParams[0].message;

    if (!resultId || resultId === 0) {
      return res.status(400).json({ success: false, message: resultMsg || 'Failed to register subscription.' });
    }

    // Fetch the newly registered record
    const [created] = await db.execute(`
      SELECT 
        s.*,
        u.name AS user_name,
        u.email AS user_email,
        p.plan_name
      FROM Subscriptions s
      JOIN Users u ON s.user_id = u.user_id
      JOIN SubscriptionPlans p ON s.plan_id = p.plan_id
      WHERE s.subscription_id = ?
    `, [resultId]);

    res.status(201).json({
      success: true,
      message: resultMsg,
      data: created[0]
    });
  } catch (error) {
    console.error('Subscription create error:', error);
    // Handle database trigger or constraint errors
    res.status(500).json({
      success: false,
      message: error.sqlMessage || 'Failed to register subscription.',
      error: error.message
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, end_date, amount_paid } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required.' });
    }

    const updates = ['status = ?'];
    const params = [status];

    if (end_date) {
      updates.push('end_date = ?');
      params.push(end_date);
    }

    if (amount_paid !== undefined) {
      updates.push('amount_paid = ?');
      params.push(parseFloat(amount_paid));
    }

    params.push(id);

    const [result] = await db.execute(
      `UPDATE Subscriptions SET ${updates.join(', ')} WHERE subscription_id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    res.json({ success: true, message: 'Subscription updated successfully.' });
  } catch (error) {
    console.error('Subscription update error:', error);
    res.status(500).json({
      success: false,
      message: error.sqlMessage || 'Failed to update subscription.',
      error: error.message
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM Subscriptions WHERE subscription_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    res.json({ success: true, message: 'Subscription deleted successfully.' });
  } catch (error) {
    console.error('Subscription delete error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete subscription.', error: error.message });
  }
};
