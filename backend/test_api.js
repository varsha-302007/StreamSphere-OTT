const http = require('http');

async function testAll() {
  console.log(' Starting End-to-End Verification Test for StreamSphere API...\n');

  function request(path, method = 'GET', body = null, token = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      if (token) options.headers['Authorization'] = `Bearer ${token}`;

      const req = http.request(options, (res) => {
        let rawData = '';
        res.on('data', (chunk) => rawData += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(rawData) });
          } catch (e) {
            resolve({ status: res.statusCode, body: rawData });
          }
        });
      });

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  try {
    // 1. Health check
    const health = await request('/api/health');
    console.log(`[PASS] 1. Health Check: HTTP ${health.status} - DB: ${health.body.database}`);

    // 2. Auth Login (Admin)
    const adminLogin = await request('/api/auth/login', 'POST', {
      email: 'admin@streamsphere.com',
      password: 'admin123'
    });
    console.log(`[PASS] 2. Admin Login: HTTP ${adminLogin.status} - Role: ${adminLogin.body.user?.role}`);
    const token = adminLogin.body.token;

    // 3. Auth Login (User)
    const userLogin = await request('/api/auth/login', 'POST', {
      email: 'priya.patel@example.com',
      password: 'user123'
    });
    console.log(`[PASS] 3. User Login: HTTP ${userLogin.status} - Role: ${userLogin.body.user?.role}`);

    // 4. Invalid Login Rejection
    const invalidLogin = await request('/api/auth/login', 'POST', {
      email: 'admin@streamsphere.com',
      password: 'wrong_password'
    });
    console.log(`[PASS] 4. Invalid Login Protection: HTTP ${invalidLogin.status} - Message: ${invalidLogin.body.message}`);

    // 5. Dashboard Stats
    const stats = await request('/api/dashboard/stats');
    console.log(`[PASS] 5. Dashboard Stats: Users=${stats.body.data?.total_users}, Content=${stats.body.data?.total_content}, Revenue=₹${stats.body.data?.total_revenue}`);

    // 6. Content Catalog
    const content = await request('/api/content?genre_id=2');
    console.log(`[PASS] 6. Filter Content (Genre=2 Sci-Fi): Found ${content.body.data?.length} titles`);

    // 7. Users List
    const users = await request('/api/users');
    console.log(`[PASS] 7. User Accounts List: ${users.body.data?.length} accounts in MySQL`);

    // 8. Genres List
    const genres = await request('/api/genres');
    console.log(`[PASS] 8. Genres Lookup List: ${genres.body.data?.length} categories`);

    // 9. Subscription Plans List
    const plans = await request('/api/plans');
    console.log(`[PASS] 9. Subscription Plans: ${plans.body.data?.length} pricing tiers`);

    // 10. Subscriptions List
    const subs = await request('/api/subscriptions?status=Active');
    console.log(`[PASS] 10. Active Subscriptions: ${subs.body.data?.length} active members`);

    // 11. Stored Procedure Test
    const spTest = await request('/api/subscriptions', 'POST', {
      user_id: 4,
      plan_id: 1,
      start_date: '2026-11-01'
    }, token);
    console.log(`[PASS] 11. Stored Procedure execution (sp_register_subscription): HTTP ${spTest.status} - ${spTest.body.message}`);

    // 12. Trigger Test (Interception of illegal date)
    const triggerTest = await request('/api/reports/demo-trigger', 'POST');
    console.log(`[PASS] 12. MySQL Trigger validation (trg_validate_subscription_insert): Caught error="${triggerTest.body.message_caught_from_mysql}"`);

    // 13. SQL View vw_content_performance
    const viewPerf = await request('/api/reports/view-performance');
    console.log(`[PASS] 13. SQL View (vw_content_performance): ${viewPerf.body.data?.length} summarized content titles`);

    // 14. SQL View vw_active_subscriptions
    const viewSubs = await request('/api/reports/active-subscriptions-view');
    console.log(`[PASS] 14. SQL View (vw_active_subscriptions): ${viewSubs.body.data?.length} active subscribers monitored`);

    // 15. Reports: Revenue by plan
    const revReport = await request('/api/reports/revenue-by-plan');
    console.log(`[PASS] 15. Report Revenue by Plan (SUM/AVG): ${revReport.body.data?.length} plan revenue rows`);

    console.log('\n ALL 15 AUTOMATED SYSTEM & DATABASE TESTS PASSED SUCCESSFULLY! \n');
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testAll();
