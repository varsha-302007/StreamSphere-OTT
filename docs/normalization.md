# StreamSphere OTT Platform — Normalization & Functional Dependencies Analysis

## 1. Problem Statement
Modern Over-The-Top (OTT) streaming platforms manage massive volumes of catalog assets, multi-tiered subscription agreements, user playback telemetry, and qualitative ratings. 

In an unnormalized or poorly designed relational database, storing all operational data within flat tables introduces severe data redundancy and critical update anomalies:
1. **Insertion Anomaly:** A new movie or genre cannot be entered without creating a dummy user or subscription record.
2. **Deletion Anomaly:** Deleting a user's subscription could unintentionally delete the entire record of a subscription plan or movie.
3. **Modification (Update) Anomaly:** If a subscription plan's pricing or a movie's release year changes, dozens or hundreds of redundant rows must be edited, creating severe inconsistencies if any row is missed.

To eliminate redundancy, maintain data consistency, and ensure strict referential integrity, the **StreamSphere** database schema was engineered following formal database normalization principles up to **Third Normal Form (3NF) / Boyce-Codd Normal Form (BCNF)**.

---

## 2. Project Scope & Objectives
1. Model user management, role-based authorization, catalog categorization, subscription billing, streaming history, and user ratings.
2. Maintain ACID transactions and zero data redundancy across all business entities.
3. Establish lossless decomposition and dependency preservation.

---

## 3. Universal Relation (UNF — Unnormalized Form)
Consider a hypothetical flat universal relation representing the entire OTT operational model:

$$\text{STREAM\_UNF}(\underline{\text{user\_id}}, \text{name}, \text{email}, \text{password\_hash}, \text{role}, \text{plan\_name}, \text{plan\_price}, \text{plan\_duration}, \text{sub\_start\_date}, \text{sub\_end\_date}, \text{sub\_status}, \text{content\_title}, \text{content\_type}, \text{genre\_name}, \text{release\_year}, \text{duration\_minutes}, \text{watched\_at}, \text{progress\_minutes}, \text{rating}, \text{review})$$

In this flat relation:
- Attributes contain multi-valued repeating groups (a single user watches multiple movies and purchases multiple subscriptions).
- Modifying a plan's price requires updating every user row that purchased that plan.
- The primary key would require an unwieldy composite of $(\text{user\_id}, \text{content\_id}, \text{sub\_start\_date})$.

---

## 4. Functional Dependencies (FDs)
The semantic business rules of the StreamSphere OTT platform establish the following set of Functional Dependencies:

### Users ($F_1$)
- $FD_{1.1}: \text{user\_id} \rightarrow \{\text{name}, \text{email}, \text{password\_hash}, \text{role}, \text{created\_at}\}$
- $FD_{1.2}: \text{email} \rightarrow \{\text{user\_id}, \text{name}, \text{password\_hash}, \text{role}, \text{created\_at}\}$ (Candidate Key)

### Genres ($F_2$)
- $FD_{2.1}: \text{genre\_id} \rightarrow \{\text{genre\_name}, \text{description}\}$
- $FD_{2.2}: \text{genre\_name} \rightarrow \{\text{genre\_id}, \text{description}\}$ (Candidate Key)

### Content ($F_3$)
- $FD_{3.1}: \text{content\_id} \rightarrow \{\text{title}, \text{content\_type}, \text{genre\_id}, \text{release\_year}, \text{duration\_minutes}, \text{description}, \text{availability\_status}, \text{created\_at}\}$

### Subscription Plans ($F_4$)
- $FD_{4.1}: \text{plan\_id} \rightarrow \{\text{plan\_name}, \text{price}, \text{duration\_days}, \text{description}, \text{created\_at}\}$
- $FD_{4.2}: \text{plan\_name} \rightarrow \{\text{plan\_id}, \text{price}, \text{duration\_days}, \text{description}, \text{created\_at}\}$ (Candidate Key)

### Subscriptions ($F_5$)
- $FD_{5.1}: \text{subscription\_id} \rightarrow \{\text{user\_id}, \text{plan\_id}, \text{start\_date}, \text{end\_date}, \text{status}, \text{amount\_paid}, \text{created\_at}\}$

### Watch History ($F_6$)
- $FD_{6.1}: \text{history\_id} \rightarrow \{\text{user\_id}, \text{content\_id}, \text{watched\_at}, \text{progress\_minutes}\}$

### Ratings ($F_7$)
- $FD_{7.1}: \text{rating\_id} \rightarrow \{\text{user\_id}, \text{content\_id}, \text{rating}, \text{review}, \text{created\_at}\}$
- $FD_{7.2}: (\text{user\_id}, \text{content\_id}) \rightarrow \{\text{rating\_id}, \text{rating}, \text{review}, \text{created\_at}\}$ (Enforced by Composite Unique Key)

---

## 5. Step-by-Step Normalization Process

### Step 1: First Normal Form (1NF)
> **Definition:** A relation $R$ is in 1NF if and only if all underlying domains contain only atomic (indivisible) values, and there are no repeating groups or non-atomic arrays.

- **Transformation:**
  - Multi-valued attributes (such as lists of streamed titles or repeating subscription history) were extracted from the flat record into independent relational entities (`WatchHistory`, `Subscriptions`, `Ratings`).
  - All attributes represent single, atomic domain types (e.g. `DECIMAL(10,2)` for financial amounts, `DATE` for calendar dates, `INT` for durations).
  - Every table has a clearly defined primary key.
- **Result:** Schema satisfies **1NF**.

---

### Step 2: Second Normal Form (2NF)
> **Definition:** A relation $R$ is in 2NF if it is in 1NF and every non-prime attribute is fully functionally dependent on the entire primary key (no partial functional dependencies $X \rightarrow Y$ where $X$ is a proper subset of a candidate key).

- **Analysis:**
  - In our schema, tables with surrogate integer primary keys (`user_id`, `genre_id`, `content_id`, `plan_id`, `subscription_id`, `history_id`, `rating_id`) have single-attribute primary keys. Partial key dependency is mathematically impossible when the primary key consists of a single attribute.
  - In `Ratings`, although $(\text{user\_id}, \text{content\_id})$ forms an alternate candidate key, both `rating` and `review` require the full pair:
    $$\text{user\_id} \not\rightarrow \text{rating}$$
    $$\text{content\_id} \not\rightarrow \text{rating}$$
    $$(\text{user\_id}, \text{content\_id}) \rightarrow \text{rating}$$
  - Neither attribute is determined by either key component in isolation.
- **Result:** No partial dependency exists in any table. Schema strictly satisfies **2NF**.

---

### Step 3: Third Normal Form (3NF)
> **Definition:** A relation $R$ is in 3NF if it is in 2NF and no non-prime attribute is transitively dependent on the primary key (for every functional dependency $X \rightarrow Y$, either $X$ is a superkey, or $Y$ is a prime attribute).

- **Analysis of Potential Transitive Dependencies:**
  1. **Content & Genres:** If `genre_name` and `genre_description` were stored inside `Content`, we would have:
     $$\text{content\_id} \rightarrow \text{genre\_id} \rightarrow \text{genre\_name}$$
     This is a transitive dependency ($X \rightarrow Y \rightarrow Z$).
     *Resolution:* Decomposed into two relations: `Content(content_id, ..., genre_id)` and `Genres(genre_id, genre_name, description)`. In both relations, the determinant is a superkey.
  2. **Subscriptions & Plans:** If plan tier details (`price`, `duration_days`) were stored in `Subscriptions`, we would have:
     $$\text{subscription\_id} \rightarrow \text{plan\_id} \rightarrow (\text{price}, \text{duration\_days})$$
     *Resolution:* Decomposed into `Subscriptions(subscription_id, ..., plan_id)` and `SubscriptionPlans(plan_id, plan_name, price, duration_days)`.
     *(Note: `amount_paid` in `Subscriptions` records the historical transaction price at purchase time, representing a point-in-time financial audit attribute, not a transitive duplicate of plan price).*
  3. **WatchHistory & Users/Content:**
     $$\text{history\_id} \rightarrow (\text{user\_id}, \text{content\_id})$$
     User metadata (`name`, `email`) and content metadata (`title`, `release_year`) are not duplicated in `WatchHistory`.
- **Result:** Every determinant in all functional dependencies is a superkey. Therefore, the schema strictly satisfies **3NF**.

---

### Step 4: Boyce-Codd Normal Form (BCNF)
> **Definition:** A relation $R$ is in BCNF if for every non-trivial functional dependency $X \rightarrow Y$, $X$ is a superkey of $R$.

- In all seven relations:
  - `Users`: Determinants are `user_id` and `email` (both candidate keys).
  - `Genres`: Determinants are `genre_id` and `genre_name` (both candidate keys).
  - `Content`: Determinant is `content_id` (candidate key).
  - `SubscriptionPlans`: Determinants are `plan_id` and `plan_name` (both candidate keys).
  - `Subscriptions`: Determinant is `subscription_id` (candidate key).
  - `WatchHistory`: Determinant is `history_id` (candidate key).
  - `Ratings`: Determinants are `rating_id` and $(\text{user\_id}, \text{content\_id})$ (both candidate keys).
- **Conclusion:** Because **every determinant across all seven tables is a superkey**, the entire StreamSphere relational schema satisfies **Boyce-Codd Normal Form (BCNF)**.

---

## 6. Summary of Normalized Relational Schema
1. $\text{Users}(\underline{\text{user\_id}}, \text{name}, \text{email}, \text{password\_hash}, \text{role}, \text{created\_at})$
2. $\text{Genres}(\underline{\text{genre\_id}}, \text{genre\_name}, \text{description})$
3. $\text{Content}(\underline{\text{content\_id}}, \text{title}, \text{content\_type}, \text{genre\_id}^*, \text{release\_year}, \text{duration\_minutes}, \text{description}, \text{availability\_status}, \text{created\_at})$
4. $\text{SubscriptionPlans}(\underline{\text{plan\_id}}, \text{plan\_name}, \text{price}, \text{duration\_days}, \text{description}, \text{created\_at})$
5. $\text{Subscriptions}(\underline{\text{subscription\_id}}, \text{user\_id}^*, \text{plan\_id}^*, \text{start\_date}, \text{end\_date}, \text{status}, \text{amount\_paid}, \text{created\_at})$
6. $\text{WatchHistory}(\underline{\text{history\_id}}, \text{user\_id}^*, \text{content\_id}^*, \text{watched\_at}, \text{progress\_minutes})$
7. $\text{Ratings}(\underline{\text{rating\_id}}, \text{user\_id}^*, \text{content\_id}^*, \text{rating}, \text{review}, \text{created\_at})$

*(Asterisk $*$ denotes Foreign Key).*
