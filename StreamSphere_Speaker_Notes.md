# StreamSphere — DBMS Laboratory Mini-Project Presentation Script
**Oral Presentation & Viva Defense Guide**  
*Tailored for Second-Year B.Tech Computer Science & Engineering Students*  
*Total Presentation Time: ~8 to 10 Minutes (approx. 45–60 seconds per slide)*

---

## Presentation Checklist Before You Begin:
1. Ensure the MySQL server (`streamsphere_db`) is running.
2. Ensure the backend server (`http://localhost:5000`) and frontend (`http://localhost:5173`) are open in your browser tabs.
3. Open `StreamSphere_DBMS_Presentation.pptx` in PowerPoint Slide Show Mode.
4. Keep the **Reports & SQL Lab** tab open in your browser to demonstrate the stored procedure and trigger live.

---

## Slide 1: Title Slide
- **Slide Title:** StreamSphere — OTT Platform Management System
- **What to Say:**
  > "Good morning respected evaluators, professors, and faculty members. Today we are presenting our Database Management Systems Laboratory mini-project titled **'StreamSphere: OTT Platform Management System'**. 
  > 
  > Our project is an end-to-end relational database solution designed to manage media catalogs, user subscriptions, viewing telemetry, and audience ratings. We have built this system using MySQL 8.0 as our relational database engine, connected to a Node.js and Express RESTful API, with a modern React dashboard on the frontend.
  > 
  > Over the next few minutes, we will walk you through our relational database design, normalization proofs, SQL implementation, advanced database objects like stored procedures and triggers, and our empirical testing results."
- **Examiner Alert / Expected Question:**
  - *Examiner:* "Did you build this with a real database or is it mock data?"
  - *Your Answer:* "It is 100% database-first, sir/ma'am. Every KPI, content record, rating, and report is queried live from MySQL 8.0 InnoDB tables using parameterized SQL queries."

---

## Slide 2: Introduction & Domain Background
- **Slide Title:** Understanding OTT Operations & Database Imperatives
- **What to Say:**
  > "To understand why we chose this domain, let us look at the operational model of Over-The-Top or OTT streaming services such as Netflix and Amazon Prime Video. Unlike traditional cable broadcasting, OTT platforms deliver media on-demand over the internet.
  > 
  > At enterprise scale, these platforms handle thousands of movies and series, complex tiered pricing contracts, multi-device playback progress, and user reviews. 
  > 
  > A database-first architecture is critical because subscription payments and validity windows represent financial agreements that require strict ACID consistency. Flat files or unnormalized schemas inevitably cause update anomalies, duplicate billing, and orphaned watch history. StreamSphere addresses these challenges with a robust relational architecture."
- **Examiner Alert / Expected Question:**
  - *Examiner:* "Does your project stream actual video files?"
  - *Your Answer:* "No, sir/ma'am. In line with the DBMS lab objectives, our scope is strictly focused on database management: catalog organization, subscription accounting, and playback telemetry analytics, rather than video encoding and CDN distribution."

---

## Slide 3: Problem Statement & Objectives
- **Slide Title:** Operational Challenges & Technical Project Objectives
- **What to Say:**
  > "When analyzing existing OTT data models, we identified four core challenges:
  > First, **data redundancy in catalogs**, where genre descriptions and pricing tiers are repetitively duplicated across rows.
  > Second, **subscription inconsistencies**, where users could accidentally hold overlapping active plans or invalid expiration dates.
  > Third, **orphaned records**, where deleting a user leaves dangling watch logs or reviews.
  > And fourth, the common academic pitfall where projects rely on client-side state without executing real relational queries.
  > 
  > Our objectives were clear: design a 7-table schema normalized to 3NF and BCNF; implement a MySQL Stored Procedure for atomic subscription activations; enforce date intervals via server-side Triggers; and provide pre-aggregated Views for real-time reporting."

---

## Slide 4: Technology Stack & System Architecture
- **Slide Title:** Three-Tier Client-Server Architecture
- **What to Say:**
  > "StreamSphere is architected as a classical 3-tier client-server system:
  > At the **Presentation Tier**, we have a React 18 single-page application built with Vite, styled with a modern dark OTT theme.
  > At the **Application Tier**, we have an Express 5 and Node.js REST API. It handles bcrypt password hashing, JWT role-based access control, and executes parameterized SQL prepared statements via the `mysql2/promise` driver.
  > At the **Database Tier**, we use MySQL 8.0 running the InnoDB storage engine.
  > 
  > When a user clicks an action in the UI, an asynchronous HTTP request is sent to Express, which validates the payload, executes a parameterized query against MySQL, and returns structured JSON back to the UI. Notice that parameterized queries guarantee that user input can never trigger SQL injection."

---

## Slide 5: Entity-Relationship (ER) Diagram
- **Slide Title:** Conceptual Entity-Relationship (ER) Model
- **What to Say:**
  > "On this slide, you see our complete Entity-Relationship diagram comprising seven core entities: `Users`, `Genres`, `Content`, `SubscriptionPlans`, `Subscriptions`, `WatchHistory`, and `Ratings`.
  > 
  > Notice how the cardinalities reflect real-world streaming business rules:
  > - One `User` can purchase multiple `Subscriptions` over time (a 1:N relationship).
  > - One `SubscriptionPlan` tier governs many subscriber contracts (1:N).
  > - One `Genre` categorizes multiple `Content` titles (1:N).
  > - The many-to-many relationship between `Users` and `Content` is decomposed into two distinct associative entities: `WatchHistory` for playback telemetry, and `Ratings` for reviews.
  > - In `Ratings`, we enforce a composite unique constraint on `(user_id, content_id)` so a user cannot submit multiple conflicting ratings for the same title."

---

## Slide 6: Relational Schema & Database Design
- **Slide Title:** Relational Schema & Referential Deletion Rules
- **What to Say:**
  > "Here we show the actual relational schema definitions and our referential integrity policies.
  > Every table uses an auto-increment integer surrogate primary key for optimal B-Tree index traversal. We also implemented MySQL 8.0 CHECK constraints, including `release_year BETWEEN 1900 AND 2100`, `price >= 0.00`, and `rating BETWEEN 1.0 AND 5.0`.
  > 
  > An important evaluation point is our deletion strategy:
  > We applied `ON DELETE RESTRICT` on `Genres` and `SubscriptionPlans`. If an administrator tries to delete a genre that contains active movies, MySQL strictly rejects the deletion, protecting catalog integrity.
  > In contrast, we applied `ON DELETE CASCADE` on `Users` and `Content`. If a user account is purged, their personal watch history and ratings are automatically cleaned up to maintain referential hygiene."

---

## Slide 7: Database Normalization Analysis
- **Slide Title:** Normalization Analysis & Anomaly Resolution
- **What to Say:**
  > "A primary evaluation criterion for this project is formal database normalization. We conducted a rigorous functional dependency analysis from an unnormalized universal relation down to 3NF and BCNF:
  > In **1NF**, we eliminated multi-valued repeating groups for viewing history and subscriptions, ensuring all attribute domains are atomic.
  > In **2NF**, because all our tables utilize single-column surrogate primary keys, partial functional dependencies are mathematically impossible. In `Ratings`, the rating depends on both user and content combined.
  > In **3NF**, we eliminated transitive dependencies like `content_id -> genre_id -> genre_name` by extracting `Genres`, and `subscription_id -> plan_id -> price` by isolating `SubscriptionPlans`.
  > Finally, because every determinant across all functional dependencies is a candidate key, our schema satisfies **Boyce-Codd Normal Form (BCNF)**."

---

## Slide 8: SQL Implementation & Analytical Queries
- **Slide Title:** Complex SQL Queries, JOINs & Aggregate Reports
- **What to Say:**
  > "This slide illustrates the actual SQL queries running inside our backend controllers.
  > The first query demonstrates a `LEFT JOIN` between `Genres` and `Content`, combined with `COUNT()` and conditional `SUM(CASE WHEN...)` statements. This computes the total catalog titles, movies, and series across every genre in a single optimized scan.
  > The second query demonstrates an inner join across `Content`, `Genres`, and `Ratings`. It computes `AVG(r.rating)`, `MIN()`, and `MAX()`, and utilizes the `HAVING` clause to filter the leaderboard to titles with at least one review."

---

## Slide 9: Advanced Database Objects
- **Slide Title:** Stored Procedure, Trigger, SQL View & Function
- **What to Say:**
  > "To maximize database programmability, we implemented four advanced database objects directly inside MySQL 8.0:
  > 1. **Stored Procedure (`sp_register_subscription`):** Validates user and plan existence, computes expiration using `DATE_ADD`, marks prior active subscriptions as `'Expired'`, and inserts the new subscription inside a database transaction with `ROLLBACK` error handling.
  > 2. **MySQL Trigger (`trg_validate_subscription_insert`):** Runs `BEFORE INSERT` on `Subscriptions`. If someone attempts to submit an `end_date` earlier than `start_date`, the trigger raises `SIGNAL SQLSTATE '45000'`.
  > 3. **SQL View (`vw_content_performance`):** Pre-aggregates a 4-table join calculating views, review volume, and average rating for high-speed dashboard reads.
  > 4. **Stored Function (`fn_calculate_user_watch_hours`):** Converts total user streaming minutes into rounded hours."
- **Live Demo Prompt:**
  - *"If you would like, we can trigger the invalid date test live in our app right now to observe the MySQL trigger error signal."*

---

## Slide 10: Application Modules & UI Showcase
- **Slide Title:** StreamSphere Application Modules & UI Showcase
- **What to Say:**
  > "Our frontend provides six dedicated operational modules:
  > The **Operational Dashboard** displays live revenue figures and popular titles queried in real time.
  > The **Content Management** module allows administrators to search, filter by genre or year, and add or update assets via modal dialogs.
  > The **User Management** screen enforces role-based access and prevents administrators from deleting their own account.
  > The **Subscription** module provides a one-click runner for our stored procedure with remaining days countdown.
  > The **Ratings & Watch History** screens manage telemetry and star reviews.
  > And finally, our **DBMS Lab Showcase** tab allows professors to inspect the exact SQL queries powering every report and test triggers live."

---

## Slide 11: Testing & Quality Assurance
- **Slide Title:** Empirical Testing & Verification Results
- **What to Say:**
  > "To verify our system, we developed an automated test script (`node test_api.js`) that runs 15 end-to-end tests against our live MySQL database.
  > Every test passed with a 100% success rate:
  > - Login security verified: valid credentials return signed JWTs, while invalid passwords receive HTTP 401.
  > - Procedure execution verified: `sp_register_subscription` successfully activated a new subscription and updated prior plans.
  > - Trigger constraint verified: illegal date intervals were caught by MySQL with error code 1644.
  > - View performance verified: `vw_content_performance` returned summarized catalog data without error."

---

## Slide 12: Conclusion & Future Scope
- **Slide Title:** Project Summary, Academic Contributions & Future Scope
- **What to Say:**
  > "In conclusion, StreamSphere proves that modern web applications can and should be built database-first. We successfully normalized our schema to 3NF/BCNF, guaranteed transactional integrity via stored procedures, and enforced business rules with server-side triggers.
  > 
  > In the future, we plan to expand StreamSphere with HLS adaptive video chunking via CDN, machine-learning collaborative recommendation filtering, and multi-profile accounts with parental PIN controls.
  > 
  > Thank you for your time and attention. We are now ready to demonstrate the live application and answer your questions."

---

## Top 5 Viva Questions & Suggested Answers

1. **Why did you use MySQL InnoDB instead of MyISAM?**
   - *Answer:* "InnoDB supports ACID transactions, row-level locking, foreign key constraints with cascade/restrict rules, and crash recovery. MyISAM lacks foreign key enforcement and transactional rollback."

2. **What is the difference between a CHECK constraint and a TRIGGER?**
   - *Answer:* "A CHECK constraint validates static, single-table conditions (like `rating BETWEEN 1 AND 5`). A TRIGGER can execute multi-table procedural logic, inspect before-and-after values (`NEW` vs `OLD`), and raise custom exceptions using `SIGNAL SQLSTATE '45000'`."

3. **How does your Stored Procedure handle errors?**
   - *Answer:* "It uses `DECLARE EXIT HANDLER FOR SQLEXCEPTION` with `GET DIAGNOSTICS`. If any SQL error occurs, it rolls back the transaction, sets the output ID to 0, and returns the diagnostic error message."

4. **Why is your schema in BCNF?**
   - *Answer:* "Because for every non-trivial functional dependency $X \rightarrow Y$ in all seven tables, the determinant $X$ is a superkey (candidate key)."

5. **How did you prevent SQL Injection?**
   - *Answer:* "We used parameterized prepared statements with the `mysql2/promise` library (`db.execute('SELECT ... WHERE id = ?', [id])`). The SQL command and parameters are transmitted separately, making SQL injection impossible."
