-- ============================================================================
-- StreamSphere — OTT Platform Management System
-- Database Definition & Population Script
-- Database: streamsphere_db
-- Target RDBMS: MySQL 8.0+
-- Author: Senior Database Architect / Full-Stack Engineer
-- ============================================================================

DROP DATABASE IF EXISTS streamsphere_db;
CREATE DATABASE streamsphere_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE streamsphere_db;

-- ============================================================================
-- TABLE CREATION (7 RELATIONAL TABLES)
-- ============================================================================

-- 1. Users Table
-- Stores customer profiles and administrators with role-based access.
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'User') NOT NULL DEFAULT 'User',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_email CHECK (email LIKE '%_@__%.__%')
) ENGINE=InnoDB;

-- 2. Genres Table
-- Content categorization lookup table.
CREATE TABLE Genres (
    genre_id INT AUTO_INCREMENT PRIMARY KEY,
    genre_name VARCHAR(60) NOT NULL UNIQUE,
    description VARCHAR(255)
) ENGINE=InnoDB;

-- 3. Content Table
-- Movies and web series catalog.
CREATE TABLE Content (
    content_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content_type ENUM('Movie', 'Series') NOT NULL,
    genre_id INT NOT NULL,
    release_year INT NOT NULL,
    duration_minutes INT NULL, -- NULL allowed for multi-episode series
    description TEXT,
    availability_status ENUM('Available', 'Coming Soon', 'Archived') NOT NULL DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_content_genre FOREIGN KEY (genre_id) 
        REFERENCES Genres(genre_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT chk_release_year CHECK (release_year >= 1900 AND release_year <= 2100),
    CONSTRAINT chk_duration CHECK (duration_minutes IS NULL OR duration_minutes > 0)
) ENGINE=InnoDB;

-- 4. SubscriptionPlans Table
-- Tiered pricing plans with fixed durations in days.
CREATE TABLE SubscriptionPlans (
    plan_id INT AUTO_INCREMENT PRIMARY KEY,
    plan_name VARCHAR(100) NOT NULL UNIQUE,
    price DECIMAL(10,2) NOT NULL,
    duration_days INT NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_plan_price CHECK (price >= 0.00),
    CONSTRAINT chk_plan_duration CHECK (duration_days > 0)
) ENGINE=InnoDB;

-- 5. Subscriptions Table
-- User subscription transactions and active access periods.
CREATE TABLE Subscriptions (
    subscription_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('Active', 'Expired', 'Cancelled') NOT NULL DEFAULT 'Active',
    amount_paid DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sub_user FOREIGN KEY (user_id) 
        REFERENCES Users(user_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_sub_plan FOREIGN KEY (plan_id) 
        REFERENCES SubscriptionPlans(plan_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT chk_sub_amount CHECK (amount_paid >= 0.00),
    CONSTRAINT chk_sub_dates CHECK (end_date >= start_date)
) ENGINE=InnoDB;

-- 6. WatchHistory Table
-- Playback tracking and viewing telemetry for recommendation analytics.
CREATE TABLE WatchHistory (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    content_id INT NOT NULL,
    watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress_minutes INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_watch_user FOREIGN KEY (user_id) 
        REFERENCES Users(user_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_watch_content FOREIGN KEY (content_id) 
        REFERENCES Content(content_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT chk_watch_progress CHECK (progress_minutes >= 0)
) ENGINE=InnoDB;

-- 7. Ratings Table
-- User reviews and ratings (1.0 to 5.0 scale).
CREATE TABLE Ratings (
    rating_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    content_id INT NOT NULL,
    rating DECIMAL(2,1) NOT NULL,
    review TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rating_user FOREIGN KEY (user_id) 
        REFERENCES Users(user_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_rating_content FOREIGN KEY (content_id) 
        REFERENCES Content(content_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT uq_user_content_rating UNIQUE (user_id, content_id),
    CONSTRAINT chk_rating_range CHECK (rating >= 1.0 AND rating <= 5.0)
) ENGINE=InnoDB;

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================
CREATE INDEX idx_content_genre ON Content(genre_id);
CREATE INDEX idx_content_type_year ON Content(content_type, release_year);
CREATE INDEX idx_sub_user_status ON Subscriptions(user_id, status);
CREATE INDEX idx_watch_user ON WatchHistory(user_id);
CREATE INDEX idx_watch_content ON WatchHistory(content_id);
CREATE INDEX idx_rating_content ON Ratings(content_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger 1: Validate subscription dates & amount before INSERT
DELIMITER $$
CREATE TRIGGER trg_validate_subscription_insert
BEFORE INSERT ON Subscriptions
FOR EACH ROW
BEGIN
    IF NEW.end_date < NEW.start_date THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Subscription Error: end_date cannot be earlier than start_date.';
    END IF;
    IF NEW.amount_paid < 0.00 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Subscription Error: amount_paid cannot be negative.';
    END IF;
END$$

-- Trigger 2: Validate subscription dates & amount before UPDATE
CREATE TRIGGER trg_validate_subscription_update
BEFORE UPDATE ON Subscriptions
FOR EACH ROW
BEGIN
    IF NEW.end_date < NEW.start_date THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Subscription Error: end_date cannot be earlier than start_date.';
    END IF;
    IF NEW.amount_paid < 0.00 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Subscription Error: amount_paid cannot be negative.';
    END IF;
END$$

-- Trigger 3: Validate rating limits before INSERT/UPDATE
CREATE TRIGGER trg_validate_rating_insert
BEFORE INSERT ON Ratings
FOR EACH ROW
BEGIN
    IF NEW.rating < 1.0 OR NEW.rating > 5.0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Rating Error: Score must be between 1.0 and 5.0.';
    END IF;
END$$
DELIMITER ;

-- ============================================================================
-- SQL VIEWS
-- ============================================================================

-- View 1: Content Performance Summary
-- Aggregates ratings and watch metrics for all titles.
CREATE OR REPLACE VIEW vw_content_performance AS
SELECT 
    c.content_id,
    c.title,
    c.content_type,
    g.genre_name,
    c.release_year,
    c.availability_status,
    c.duration_minutes,
    COUNT(DISTINCT w.history_id) AS total_views,
    COUNT(DISTINCT r.rating_id) AS total_ratings,
    COALESCE(ROUND(AVG(r.rating), 1), 0.0) AS avg_rating
FROM Content c
LEFT JOIN Genres g ON c.genre_id = g.genre_id
LEFT JOIN WatchHistory w ON c.content_id = w.content_id
LEFT JOIN Ratings r ON c.content_id = r.content_id
GROUP BY c.content_id, c.title, c.content_type, g.genre_name, c.release_year, c.availability_status, c.duration_minutes;

-- View 2: Active Subscriptions Summary
-- Displays current customer access status, plan tier, and days remaining.
CREATE OR REPLACE VIEW vw_active_subscriptions AS
SELECT 
    s.subscription_id,
    u.user_id,
    u.name AS user_name,
    u.email AS user_email,
    p.plan_id,
    p.plan_name,
    p.price,
    s.start_date,
    s.end_date,
    s.status,
    s.amount_paid,
    DATEDIFF(s.end_date, CURRENT_DATE()) AS days_remaining
FROM Subscriptions s
JOIN Users u ON s.user_id = u.user_id
JOIN SubscriptionPlans p ON s.plan_id = p.plan_id
WHERE s.status = 'Active';

-- ============================================================================
-- STORED PROCEDURE & FUNCTION
-- ============================================================================

-- Stored Procedure: Atomic subscription registration with validation & expiration
DELIMITER $$
CREATE PROCEDURE sp_register_subscription (
    IN  p_user_id       INT,
    IN  p_plan_id       INT,
    IN  p_start_date    DATE,
    OUT p_subscription_id INT,
    OUT p_message       VARCHAR(255)
)
proc_label: BEGIN
    DECLARE v_duration_days INT;
    DECLARE v_price DECIMAL(10,2);
    DECLARE v_start_date DATE;
    DECLARE v_end_date DATE;
    DECLARE v_user_exists INT DEFAULT 0;
    DECLARE v_err_msg VARCHAR(255) DEFAULT '';

    -- Error handler with SQL diagnostics
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1 v_err_msg = MESSAGE_TEXT;
        ROLLBACK;
        SET p_subscription_id = 0;
        SET p_message = CONCAT('Transaction error: ', v_err_msg);
    END;

    -- Validate user existence
    SELECT COUNT(*) INTO v_user_exists FROM Users WHERE user_id = p_user_id;
    IF v_user_exists = 0 THEN
        SET p_subscription_id = 0;
        SET p_message = 'Error: Specified User ID does not exist.';
        LEAVE proc_label;
    END IF;

    -- Validate plan existence and fetch pricing & duration
    SELECT duration_days, price INTO v_duration_days, v_price 
    FROM SubscriptionPlans 
    WHERE plan_id = p_plan_id;

    IF v_duration_days IS NULL THEN
        SET p_subscription_id = 0;
        SET p_message = 'Error: Specified Plan ID does not exist.';
        LEAVE proc_label;
    END IF;

    -- Determine effective dates
    IF p_start_date IS NULL THEN
        SET v_start_date = CURRENT_DATE();
    ELSE
        SET v_start_date = p_start_date;
    END IF;

    SET v_end_date = DATE_ADD(v_start_date, INTERVAL v_duration_days DAY);

    -- Begin Transaction
    START TRANSACTION;

    -- Mark prior Active subscriptions for this user as Expired
    UPDATE Subscriptions 
    SET status = 'Expired' 
    WHERE user_id = p_user_id AND status = 'Active';

    -- Insert new Subscription
    INSERT INTO Subscriptions (user_id, plan_id, start_date, end_date, status, amount_paid)
    VALUES (p_user_id, p_plan_id, v_start_date, v_end_date, 'Active', v_price);

    SET p_subscription_id = LAST_INSERT_ID();
    SET p_message = CONCAT('Success: Subscription #', p_subscription_id, ' activated until ', v_end_date);

    COMMIT;
END$$

-- Stored Function: Compute total viewing time in hours for a user
CREATE FUNCTION fn_calculate_user_watch_hours (
    p_user_id INT
)
RETURNS DECIMAL(6,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_total_minutes INT DEFAULT 0;
    SELECT COALESCE(SUM(progress_minutes), 0) INTO v_total_minutes
    FROM WatchHistory
    WHERE user_id = p_user_id;
    RETURN ROUND(v_total_minutes / 60.0, 2);
END$$
DELIMITER ;

-- ============================================================================
-- REALISTIC SAMPLE DATA INSERTION (10+ RECORDS PER TABLE)
-- Note: User password hashes correspond to:
-- Admin users: 'admin123' ($2b$10$k2UGeAQ5na9NE95cKlgx7.aV9u7RI56tNLN4PsZhDaHyxZmYynplS)
-- Regular users: 'user123' ($2b$10$yFdLooIvFu/84rMOmpnLA.AGn3JZ4tbuCFdxcvKfrIhnAwfwEjs7y)
-- ============================================================================

-- 1. Insert 12 Users (2 Admins, 10 Users)
INSERT INTO Users (user_id, name, email, password_hash, role) VALUES
(1, 'System Administrator', 'admin@streamsphere.com', '$2b$10$k2UGeAQ5na9NE95cKlgx7.aV9u7RI56tNLN4PsZhDaHyxZmYynplS', 'Admin'),
(2, 'Operations Lead', 'ops@streamsphere.com', '$2b$10$k2UGeAQ5na9NE95cKlgx7.aV9u7RI56tNLN4PsZhDaHyxZmYynplS', 'Admin'),
(3, 'Aarav Sharma', 'aarav.sharma@example.com', '$2b$10$yFdLooIvFu/84rMOmpnLA.AGn3JZ4tbuCFdxcvKfrIhnAwfwEjs7y', 'User'),
(4, 'Priya Patel', 'priya.patel@example.com', '$2b$10$yFdLooIvFu/84rMOmpnLA.AGn3JZ4tbuCFdxcvKfrIhnAwfwEjs7y', 'User'),
(5, 'Rohan Verma', 'rohan.verma@example.com', '$2b$10$yFdLooIvFu/84rMOmpnLA.AGn3JZ4tbuCFdxcvKfrIhnAwfwEjs7y', 'User'),
(6, 'Sneha Nair', 'sneha.nair@example.com', '$2b$10$yFdLooIvFu/84rMOmpnLA.AGn3JZ4tbuCFdxcvKfrIhnAwfwEjs7y', 'User'),
(7, 'Vikram Malhotra', 'vikram.m@example.com', '$2b$10$yFdLooIvFu/84rMOmpnLA.AGn3JZ4tbuCFdxcvKfrIhnAwfwEjs7y', 'User'),
(8, 'Ananya Iyer', 'ananya.iyer@example.com', '$2b$10$yFdLooIvFu/84rMOmpnLA.AGn3JZ4tbuCFdxcvKfrIhnAwfwEjs7y', 'User'),
(9, 'Kabir Sen', 'kabir.sen@example.com', '$2b$10$yFdLooIvFu/84rMOmpnLA.AGn3JZ4tbuCFdxcvKfrIhnAwfwEjs7y', 'User'),
(10, 'Divya Krishnan', 'divya.k@example.com', '$2b$10$yFdLooIvFu/84rMOmpnLA.AGn3JZ4tbuCFdxcvKfrIhnAwfwEjs7y', 'User'),
(11, 'Arjun Reddy', 'arjun.reddy@example.com', '$2b$10$yFdLooIvFu/84rMOmpnLA.AGn3JZ4tbuCFdxcvKfrIhnAwfwEjs7y', 'User'),
(12, 'Meera Joshi', 'meera.joshi@example.com', '$2b$10$yFdLooIvFu/84rMOmpnLA.AGn3JZ4tbuCFdxcvKfrIhnAwfwEjs7y', 'User');

-- 2. Insert 10 Genres
INSERT INTO Genres (genre_id, genre_name, description) VALUES
(1, 'Action', 'High octane stunts, adrenaline, tactical missions, and explosive encounters.'),
(2, 'Sci-Fi', 'Futuristic technology, space exploration, time dilation, and parallel realities.'),
(3, 'Drama', 'Emotional narratives depicting realistic characters and conflicts.'),
(4, 'Comedy', 'Light-hearted narratives, satire, and situational humour.'),
(5, 'Thriller', 'Suspenseful investigations, psychological tension, and shocking twists.'),
(6, 'Horror', 'Supernatural phenomena, psychological dread, and macabre atmosphere.'),
(7, 'Romance', 'Heartfelt tales of intimacy, relationships, and emotional connections.'),
(8, 'Documentary', 'Real-world exposés, scientific breakthroughs, and historical chronicles.'),
(9, 'Animation', 'Artistic visual storytelling spanning fantasy, anime, and family adventures.'),
(10, 'Crime', 'Heists, forensic criminal investigations, legal battles, and mafia syndicates.');

-- 3. Insert 12 Content Titles (Movies and Series)
INSERT INTO Content (content_id, title, content_type, genre_id, release_year, duration_minutes, description, availability_status) VALUES
(1, 'Quantum Horizon', 'Movie', 2, 2024, 142, 'A team of astrophysicists enter an unstable wormhole orbiting Neptune.', 'Available'),
(2, 'Shadow Syndicate', 'Series', 10, 2023, NULL, 'An elite detective infiltrates a global financial cartel operating in Hong Kong.', 'Available'),
(3, 'Echoes of the Void', 'Movie', 2, 2022, 128, 'Deep space miners encounter a sentient frequency emitting from an uncharted asteroid.', 'Available'),
(4, 'The Last Stand at Red Rock', 'Movie', 1, 2023, 115, 'A retired border ranger defends an outpost against an armored syndicate.', 'Available'),
(5, 'Cyber Metropolis 2099', 'Series', 2, 2024, NULL, 'In a megacity governed by algorithms, a rebel coder discovers human emotion.', 'Available'),
(6, 'Laughter Therapy', 'Movie', 4, 2021, 98, 'Two estranged siblings accidentally open a chaotic comedy retreat in Goa.', 'Available'),
(7, 'Crown of Deception', 'Series', 3, 2022, NULL, 'Power struggles and palace espionage within a 17th century dynasty.', 'Available'),
(8, 'The Midnight Murders', 'Movie', 5, 2023, 134, 'A psychological profiler tracks a serial artist leaving macabre clues across London.', 'Available'),
(9, 'Whispering Pines', 'Movie', 6, 2020, 104, 'A family cabin trip unleashes ancient folklore entities trapped beneath the frozen lake.', 'Available'),
(10, 'Beneath the Azure', 'Movie', 8, 2024, 88, 'Exploration of uncharted deep sea hydrothermal vents and bioluminescent ecosystems.', 'Available'),
(11, 'Autumn in Florence', 'Movie', 7, 2023, 110, 'An art restorer and a master architect fall in love amidst the renaissance alleys.', 'Coming Soon'),
(12, 'Spirits of the Canopy', 'Movie', 9, 2024, 95, 'An animated fable of forest guardians protecting sacred grove springs.', 'Available');

-- 4. Insert 6 Subscription Plans
INSERT INTO SubscriptionPlans (plan_id, plan_name, price, duration_days, description) VALUES
(1, 'Mobile Basic', 149.00, 30, '480p SD streaming on 1 mobile or tablet device.'),
(2, 'Standard HD', 499.00, 30, '1080p Full HD on 2 simultaneous screens with stereo sound.'),
(3, 'Premium 4K Ultra', 649.00, 30, '4K UHD + HDR + Dolby Atmos on 4 screens with offline downloads.'),
(4, 'Quarterly Super Saver', 1299.00, 90, '90-day Full HD access on 3 screens with ad-free viewing.'),
(5, 'Annual VIP All-Access', 3999.00, 365, '365-day 4K Ultra HD access with family sharing and early premiere access.'),
(6, 'Student Special', 99.00, 30, 'Affordable monthly student plan with valid institutional ID verification.');

-- 5. Insert 12 Subscriptions
INSERT INTO Subscriptions (subscription_id, user_id, plan_id, start_date, end_date, status, amount_paid) VALUES
(1, 3, 3, '2026-09-01', '2026-10-01', 'Expired', 649.00),
(2, 3, 3, '2026-10-01', '2026-10-31', 'Active', 649.00),
(3, 4, 2, '2026-09-15', '2026-10-15', 'Expired', 499.00),
(4, 4, 2, '2026-10-15', '2026-11-14', 'Active', 499.00),
(5, 5, 5, '2026-01-10', '2027-01-10', 'Active', 3999.00),
(6, 6, 1, '2026-09-20', '2026-10-20', 'Active', 149.00),
(7, 7, 4, '2026-08-01', '2026-10-30', 'Active', 1299.00),
(8, 8, 3, '2026-10-05', '2026-11-04', 'Active', 649.00),
(9, 9, 2, '2026-09-10', '2026-10-10', 'Expired', 499.00),
(10, 10, 6, '2026-10-01', '2026-10-31', 'Active', 99.00),
(11, 11, 4, '2026-07-01', '2026-09-29', 'Expired', 1299.00),
(12, 12, 3, '2026-10-12', '2026-11-11', 'Active', 649.00);

-- 6. Insert 15 Watch History Records
INSERT INTO WatchHistory (history_id, user_id, content_id, watched_at, progress_minutes) VALUES
(1, 3, 1, '2026-10-10 20:15:00', 142),
(2, 3, 5, '2026-10-11 21:30:00', 65),
(3, 4, 2, '2026-10-12 18:45:00', 110),
(4, 4, 8, '2026-10-13 22:00:00', 134),
(5, 5, 1, '2026-10-08 19:10:00', 142),
(6, 5, 3, '2026-10-09 20:40:00', 128),
(7, 5, 4, '2026-10-14 23:15:00', 95),
(8, 6, 6, '2026-10-11 16:20:00', 98),
(9, 7, 7, '2026-10-12 21:00:00', 150),
(10, 8, 1, '2026-10-13 14:30:00', 142),
(11, 8, 10, '2026-10-14 11:15:00', 88),
(12, 9, 8, '2026-10-05 19:45:00', 120),
(13, 10, 12, '2026-10-12 10:00:00', 95),
(14, 11, 4, '2026-09-25 22:30:00', 115),
(15, 12, 1, '2026-10-15 20:00:00', 140);

-- 7. Insert 12 Ratings
INSERT INTO Ratings (rating_id, user_id, content_id, rating, review) VALUES
(1, 3, 1, 4.8, 'Mind-bending interstellar science fiction! Visual effects on Neptune were stunning.'),
(2, 3, 5, 4.5, 'Cyber Metropolis delivers intense world-building and philosophical questions.'),
(3, 4, 2, 4.2, 'Gritty, smart neo-noir procedural. The acting is phenomenal.'),
(4, 4, 8, 3.8, 'Engrossing thriller with solid pacing, though the ending was somewhat predictable.'),
(5, 5, 1, 5.0, 'One of the greatest sci-fi masterworks of our time. Absolute cinema.'),
(6, 5, 3, 4.0, 'Atmospheric deep space tension. Loved the sound design.'),
(7, 6, 6, 4.2, 'Genuinely hilarious vacation comedy with great comic timing.'),
(8, 7, 7, 4.7, 'Extravagant set designs and superb court intrigue.'),
(9, 8, 10, 4.9, 'Breathtaking 4K marine documentary. The deep trench footage is awe-inspiring.'),
(10, 9, 8, 3.5, 'Good investigative thriller, kept me on edge.'),
(11, 10, 12, 4.6, 'Wholesome, magical animation with lovely orchestral soundtrack.'),
(12, 12, 1, 4.7, 'Superb direction and thought-provoking quantum physics themes.');

-- ============================================================================
-- DEMONSTRATION & REPORT QUERIES
-- ============================================================================

-- Report 1: Content Distribution by Genre (JOIN, COUNT, GROUP BY, ORDER BY)
SELECT 
    g.genre_id,
    g.genre_name,
    COUNT(c.content_id) AS total_titles,
    SUM(CASE WHEN c.content_type = 'Movie' THEN 1 ELSE 0 END) AS movie_count,
    SUM(CASE WHEN c.content_type = 'Series' THEN 1 ELSE 0 END) AS series_count
FROM Genres g
LEFT JOIN Content c ON g.genre_id = c.genre_id
GROUP BY g.genre_id, g.genre_name
ORDER BY total_titles DESC, g.genre_name ASC;

-- Report 2: Active Subscribers Count by Subscription Plan (JOIN, COUNT, GROUP BY)
SELECT 
    p.plan_id,
    p.plan_name,
    p.price,
    COUNT(s.subscription_id) AS active_subscribers
FROM SubscriptionPlans p
LEFT JOIN Subscriptions s ON p.plan_id = s.plan_id AND s.status = 'Active'
GROUP BY p.plan_id, p.plan_name, p.price
ORDER BY active_subscribers DESC;

-- Report 3: Total Revenue Generated by Each Plan (JOIN, SUM, COUNT, GROUP BY)
SELECT 
    p.plan_id,
    p.plan_name,
    COUNT(s.subscription_id) AS total_subscriptions_sold,
    COALESCE(SUM(s.amount_paid), 0.00) AS total_revenue
FROM SubscriptionPlans p
LEFT JOIN Subscriptions s ON p.plan_id = s.plan_id
GROUP BY p.plan_id, p.plan_name
ORDER BY total_revenue DESC;

-- Report 4: Top Content by Average Rating & Total Reviews (JOIN, AVG, COUNT, HAVING, ORDER BY)
SELECT 
    c.content_id,
    c.title,
    c.content_type,
    g.genre_name,
    COUNT(r.rating_id) AS review_count,
    ROUND(AVG(r.rating), 2) AS average_rating
FROM Content c
JOIN Genres g ON c.genre_id = g.genre_id
JOIN Ratings r ON c.content_id = r.content_id
GROUP BY c.content_id, c.title, c.content_type, g.genre_name
HAVING COUNT(r.rating_id) >= 1
ORDER BY average_rating DESC, review_count DESC;

-- Report 5: Most Streamed Titles (JOIN, COUNT, SUM, ORDER BY)
SELECT 
    c.content_id,
    c.title,
    c.content_type,
    g.genre_name,
    COUNT(w.history_id) AS stream_count,
    COALESCE(SUM(w.progress_minutes), 0) AS total_minutes_watched
FROM Content c
JOIN Genres g ON c.genre_id = g.genre_id
LEFT JOIN WatchHistory w ON c.content_id = w.content_id
GROUP BY c.content_id, c.title, c.content_type, g.genre_name
ORDER BY stream_count DESC, total_minutes_watched DESC;
