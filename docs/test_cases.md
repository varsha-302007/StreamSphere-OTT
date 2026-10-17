# StreamSphere OTT Platform — Test Cases & Quality Assurance Specification

## 1. Overview
This document specifies comprehensive test cases designed to validate database constraints, API endpoints, business logic, stored procedures, triggers, views, and UI workflows for the **StreamSphere OTT Platform Management System**.

---

## 2. Test Execution Matrix

| Test ID | Module / Feature | Test Description | Input / Action | Expected Result | Actual Result / Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-AUTH-01** | Authentication | Valid administrator login | Email: `admin@streamsphere.com`<br>Pass: `admin123` | HTTP 200, JWT token returned, user role `Admin` identified | PASS |
| **TC-AUTH-02** | Authentication | Invalid password rejection | Email: `admin@streamsphere.com`<br>Pass: `wrongpass` | HTTP 401 Unauthorized, message: "Invalid email or password" | PASS |
| **TC-AUTH-03** | Authentication | Duplicate email registration | Register existing email `admin@streamsphere.com` | HTTP 409 Conflict, message: "A user with this email address already exists" | PASS |
| **TC-USER-01** | User Management | Fetch all users with search | `GET /api/users?search=Aarav` | HTTP 200, returns array containing user "Aarav Sharma" | PASS |
| **TC-USER-02** | User Management | Update user profile | Change user role from User to Admin | HTTP 200, database reflects updated role | PASS |
| **TC-USER-03** | User Management | Prevent admin self-deletion | Admin attempts deleting their own logged-in ID | HTTP 400 Bad Request, message: "Security restriction: You cannot delete your own account" | PASS |
| **TC-GENRE-01** | Genre Management | Prevent duplicate genre name | Create genre named "Sci-Fi" (already exists) | HTTP 409 Conflict, message: "A genre with this name already exists" | PASS |
| **TC-GENRE-02** | Genre Management | Referential integrity RESTRICT | Delete Genre ID 2 ("Sci-Fi" has 3 titles) | HTTP 400, "Cannot delete genre: 3 content title(s) are assigned to it" | PASS |
| **TC-CONT-01** | Content Management| Filter by genre and content type | `GET /api/content?genre_id=2&content_type=Movie` | HTTP 200, returns only Sci-Fi movies | PASS |
| **TC-CONT-02** | Content Management| Check constraint on release year | Insert movie with year = `1850` | HTTP 400 / MySQL Check Constraint Violation | PASS |
| **TC-CONT-03** | Content Management| Cascade delete content telemetry| Delete content with ID 1 | Content deleted, associated watch history and ratings purged via `ON DELETE CASCADE` | PASS |
| **TC-PLAN-01** | Subscription Plans | Non-negative price validation | Insert plan with price = `-100.00` | HTTP 400 / Check constraint `chk_plan_price` fails | PASS |
| **TC-PLAN-02** | Subscription Plans | Protect active plan deletion | Delete Plan ID 3 (has active subscribers) | HTTP 400, "Cannot delete plan: subscription record(s) reference this plan" | PASS |
| **TC-SP-01** | Stored Procedure | Execute `sp_register_subscription` | Call procedure with valid User ID 3 and Plan ID 1 | Returns new subscription ID, sets status to 'Active', marks prior active sub as 'Expired' | PASS |
| **TC-SP-02** | Stored Procedure | Non-existent user validation | Call procedure with User ID `9999` | Transaction aborts, returns "Error: Specified User ID does not exist" | PASS |
| **TC-TRG-01** | MySQL Trigger | Validate subscription dates | Insert subscription with `end_date < start_date` | Trigger `trg_validate_subscription_insert` raises `SQLSTATE 45000` | PASS |
| **TC-TRG-02** | MySQL Trigger | Validate rating score boundary | Insert rating score = `6.5` | Trigger `trg_validate_rating_insert` raises `SQLSTATE 45000` | PASS |
| **TC-VIEW-01** | SQL View | Query `vw_content_performance` | `GET /api/reports/view-performance` | HTTP 200, returns aggregated total views, ratings count, and average score | PASS |
| **TC-VIEW-02** | SQL View | Query `vw_active_subscriptions` | `GET /api/reports/active-subscriptions-view` | HTTP 200, displays days remaining calculated via `DATEDIFF` | PASS |
| **TC-REP-01** | Reports | Aggregated content distribution | `GET /api/reports/content-by-genre` | HTTP 200, verifies `LEFT JOIN`, `GROUP BY`, `COUNT` | PASS |
| **TC-REP-02** | Reports | Revenue breakdown by plan | `GET /api/reports/revenue-by-plan` | HTTP 200, computes accurate sum of `amount_paid` | PASS |
| **TC-REP-03** | Reports | Top rated content with HAVING | `GET /api/reports/average-ratings` | HTTP 200, filters items with `HAVING COUNT(r.rating_id) >= 1` | PASS |

---

## 3. DBMS Viva Demonstration Checklist
1. **Live Schema Inspection:**
   ```sql
   USE streamsphere_db;
   SHOW TABLES;
   DESCRIBE Content;
   ```
2. **Trigger Verification:**
   Attempting to bypass frontend validation and directly insert an inconsistent subscription date produces:
   ```
   ERROR 1644 (45000): Subscription Error: end_date cannot be earlier than start_date.
   ```
3. **Stored Procedure Verification:**
   ```sql
   CALL sp_register_subscription(3, 2, CURRENT_DATE(), @sub_id, @msg);
   SELECT @sub_id, @msg;
   ```
4. **View Query Verification:**
   ```sql
   SELECT * FROM vw_content_performance LIMIT 5;
   ```
