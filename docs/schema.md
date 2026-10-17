# StreamSphere OTT Platform — Relational Schema & Data Dictionary

## 1. Database Overview
- **Database Name:** `streamsphere_db`
- **RDBMS Engine:** MySQL 8.0+ (InnoDB Storage Engine)
- **Character Set / Collation:** `utf8mb4` / `utf8mb4_unicode_ci`

---

## 2. Relational Tables & Attributes Data Dictionary

### Table 1: `Users`
Stores authentication credentials, user profiles, and administrative privilege roles.

| Column Name | Data Type | Nullable | Key / Constraint | Description / Academic Notes |
| :--- | :--- | :--- | :--- | :--- |
| `user_id` | `INT` | NO | `PRIMARY KEY AUTO_INCREMENT` | Unique surrogate identifier for each account. |
| `name` | `VARCHAR(100)` | NO | NOT NULL | User's full legal name. |
| `email` | `VARCHAR(150)` | NO | `UNIQUE`, `CHECK(LIKE '%_@__%.__%')` | Login email identifier, strictly enforced unique with format validation. |
| `password_hash` | `VARCHAR(255)` | NO | NOT NULL | One-way encrypted bcrypt hash (never stored in plaintext). |
| `role` | `ENUM('Admin', 'User')` | NO | `DEFAULT 'User'` | Authorization role for RBAC (Role-Based Access Control). |
| `created_at` | `TIMESTAMP` | NO | `DEFAULT CURRENT_TIMESTAMP` | Account registration audit timestamp. |

---

### Table 2: `Genres`
Lookup reference table for movie and series categorization.

| Column Name | Data Type | Nullable | Key / Constraint | Description / Academic Notes |
| :--- | :--- | :--- | :--- | :--- |
| `genre_id` | `INT` | NO | `PRIMARY KEY AUTO_INCREMENT` | Unique identifier for category. |
| `genre_name` | `VARCHAR(60)` | NO | `UNIQUE` | Distinct genre name (e.g., Sci-Fi, Thriller). |
| `description` | `VARCHAR(255)` | YES | NULL | Thematic description of the cinematic genre. |

---

### Table 3: `Content`
Catalog of streaming media items (movies and multi-episode series).

| Column Name | Data Type | Nullable | Key / Constraint | Description / Academic Notes |
| :--- | :--- | :--- | :--- | :--- |
| `content_id` | `INT` | NO | `PRIMARY KEY AUTO_INCREMENT` | Primary surrogate key for the catalog item. |
| `title` | `VARCHAR(200)` | NO | NOT NULL | Title of the movie or web series. |
| `content_type` | `ENUM('Movie', 'Series')`| NO | NOT NULL | Distinguishes between standalone film and episodic show. |
| `genre_id` | `INT` | NO | `FOREIGN KEY -> Genres(genre_id)` | Foreign key link. `ON DELETE RESTRICT`, `ON UPDATE CASCADE`. |
| `release_year` | `INT` | NO | `CHECK(release_year BETWEEN 1900 AND 2100)` | Validated release year. |
| `duration_minutes` | `INT` | YES | `CHECK(duration_minutes IS NULL OR duration_minutes > 0)` | Length in minutes (nullable for multi-episode series). |
| `description` | `TEXT` | YES | NULL | Detailed synopsis and premise. |
| `availability_status` | `ENUM('Available', 'Coming Soon', 'Archived')` | NO | `DEFAULT 'Available'` | Publishing lifecycle state. |
| `created_at` | `TIMESTAMP` | NO | `DEFAULT CURRENT_TIMESTAMP` | Catalog entry timestamp. |

---

### Table 4: `SubscriptionPlans`
Tiered subscription definitions and billing rates.

| Column Name | Data Type | Nullable | Key / Constraint | Description / Academic Notes |
| :--- | :--- | :--- | :--- | :--- |
| `plan_id` | `INT` | NO | `PRIMARY KEY AUTO_INCREMENT` | Surrogate plan key. |
| `plan_name` | `VARCHAR(100)` | NO | `UNIQUE` | Distinct marketing plan name. |
| `price` | `DECIMAL(10,2)` | NO | `CHECK(price >= 0.00)` | Plan price in INR / currency units. |
| `duration_days` | `INT` | NO | `CHECK(duration_days > 0)` | Validity span in calendar days. |
| `description` | `VARCHAR(255)` | YES | NULL | Feature list (screens, resolution, audio). |
| `created_at` | `TIMESTAMP` | NO | `DEFAULT CURRENT_TIMESTAMP` | Plan creation audit timestamp. |

---

### Table 5: `Subscriptions`
User subscription purchases and active platform access entitlements.

| Column Name | Data Type | Nullable | Key / Constraint | Description / Academic Notes |
| :--- | :--- | :--- | :--- | :--- |
| `subscription_id` | `INT` | NO | `PRIMARY KEY AUTO_INCREMENT` | Unique billing invoice/subscription identifier. |
| `user_id` | `INT` | NO | `FOREIGN KEY -> Users(user_id)` | `ON DELETE CASCADE`, `ON UPDATE CASCADE`. |
| `plan_id` | `INT` | NO | `FOREIGN KEY -> SubscriptionPlans(plan_id)` | `ON DELETE RESTRICT`, `ON UPDATE CASCADE`. |
| `start_date` | `DATE` | NO | NOT NULL | Access start date. |
| `end_date` | `DATE` | NO | `CHECK(end_date >= start_date)` | Access expiration date. |
| `status` | `ENUM('Active', 'Expired', 'Cancelled')` | NO | `DEFAULT 'Active'` | Current entitlement status. |
| `amount_paid` | `DECIMAL(10,2)` | NO | `CHECK(amount_paid >= 0.00)` | Transaction total paid. |
| `created_at` | `TIMESTAMP` | NO | `DEFAULT CURRENT_TIMESTAMP` | Transaction creation timestamp. |

---

### Table 6: `WatchHistory`
Telemetry playback events tracking user interaction with catalog titles.

| Column Name | Data Type | Nullable | Key / Constraint | Description / Academic Notes |
| :--- | :--- | :--- | :--- | :--- |
| `history_id` | `INT` | NO | `PRIMARY KEY AUTO_INCREMENT` | Telemetry event sequence key. |
| `user_id` | `INT` | NO | `FOREIGN KEY -> Users(user_id)` | `ON DELETE CASCADE`, `ON UPDATE CASCADE`. |
| `content_id` | `INT` | NO | `FOREIGN KEY -> Content(content_id)` | `ON DELETE CASCADE`, `ON UPDATE CASCADE`. |
| `watched_at` | `TIMESTAMP` | NO | `DEFAULT CURRENT_TIMESTAMP` | Playback timestamp. |
| `progress_minutes` | `INT` | NO | `CHECK(progress_minutes >= 0)` | Recorded playback offset in minutes. |

---

### Table 7: `Ratings`
Customer qualitative and quantitative feedback.

| Column Name | Data Type | Nullable | Key / Constraint | Description / Academic Notes |
| :--- | :--- | :--- | :--- | :--- |
| `rating_id` | `INT` | NO | `PRIMARY KEY AUTO_INCREMENT` | Rating record key. |
| `user_id` | `INT` | NO | `FOREIGN KEY -> Users(user_id)` | `ON DELETE CASCADE`. |
| `content_id` | `INT` | NO | `FOREIGN KEY -> Content(content_id)` | `ON DELETE CASCADE`. |
| `rating` | `DECIMAL(2,1)` | NO | `CHECK(rating BETWEEN 1.0 AND 5.0)` | Star rating score. |
| `review` | `TEXT` | YES | NULL | Optional qualitative critique text. |
| `created_at` | `TIMESTAMP` | NO | `DEFAULT CURRENT_TIMESTAMP` | Review submission timestamp. |
| Composite UK | `(user_id, content_id)` | NO | `UNIQUE` | Guarantees one review per user per title. |

---

## 3. Referential Integrity & Foreign Key Deletion Rules

| Parent Table | Child Table | Foreign Key Action | Rationale for College Evaluation |
| :--- | :--- | :--- | :--- |
| `Genres` | `Content` | `ON DELETE RESTRICT` | Prevents cascading deletion of catalog media if a genre is removed. Admins must reassign content first. |
| `SubscriptionPlans` | `Subscriptions` | `ON DELETE RESTRICT` | Prevents accidental loss of financial transactions and subscriber history if a commercial plan tier is discontinued. |
| `Users` | `Subscriptions` | `ON DELETE CASCADE` | When a user profile is deleted under GDPR/Privacy compliance, personal subscription records are safely purged. |
| `Users` | `WatchHistory` | `ON DELETE CASCADE` | Viewing history is directly owned by the user and must be erased upon account deletion. |
| `Users` | `Ratings` | `ON DELETE CASCADE` | Personal reviews authored by the user are removed when the account is deleted. |
| `Content` | `WatchHistory` | `ON DELETE CASCADE` | If a movie or series is permanently expunged, playback telemetry referencing that ID is deleted. |
| `Content` | `Ratings` | `ON DELETE CASCADE` | If a title is removed from the catalog, associated ratings are deleted to maintain referential hygiene. |

---

## 4. Database Objects Specification

### 1. View: `vw_content_performance`
- **Definition:** Aggregates total views from `WatchHistory` and calculates `COUNT` and `AVG` from `Ratings` joined with `Content` and `Genres`.
- **Purpose:** Eliminates complex 4-table joins in dashboard queries and optimizes analytical read throughput.

### 2. View: `vw_active_subscriptions`
- **Definition:** Joins `Subscriptions`, `Users`, and `SubscriptionPlans` with `DATEDIFF(end_date, CURRENT_DATE())`.
- **Purpose:** Provides a real-time monitor of remaining access days for customer retention.

### 3. Stored Procedure: `sp_register_subscription`
- **Parameters:** `IN p_user_id INT`, `IN p_plan_id INT`, `IN p_start_date DATE`, `OUT p_subscription_id INT`, `OUT p_message VARCHAR(255)`.
- **Transactional Integrity:** Uses `START TRANSACTION`, `COMMIT`, and `DECLARE EXIT HANDLER FOR SQLEXCEPTION` with `ROLLBACK` and `GET DIAGNOSTICS`.
- **Business Logic:**
  1. Validates user existence.
  2. Validates plan existence and fetches duration in days and price.
  3. Automatically marks previous Active subscriptions for the user as Expired.
  4. Inserts new subscription with calculated `end_date = DATE_ADD(start_date, INTERVAL duration DAY)`.

### 4. Trigger: `trg_validate_subscription_insert` / `trg_validate_subscription_update`
- **Type:** `BEFORE INSERT` / `BEFORE UPDATE` on `Subscriptions`.
- **Logic:** Enforces `NEW.end_date >= NEW.start_date` and `NEW.amount_paid >= 0.00`.
- **Error Signaling:** Throws `SIGNAL SQLSTATE '45000'` with customized message when violated.

### 5. Stored Function: `fn_calculate_user_watch_hours`
- **Parameters:** `IN p_user_id INT` returns `DECIMAL(6,2)`.
- **Logic:** Queries `SUM(progress_minutes)` from `WatchHistory` and converts to rounded hours.
