import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_streamsphere_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    blank_layout = prs.slide_layouts[6] # blank layout

    # Color Palette (Dark OTT Theme)
    BG_COLOR = RGBColor(10, 13, 26)       # #0a0d1a
    SURFACE_COLOR = RGBColor(18, 23, 43)  # #12172b
    SURFACE_LIGHT = RGBColor(25, 32, 60)  # #19203c
    BORDER_COLOR = RGBColor(45, 55, 90)   # #2d375a
    PRIMARY_COLOR = RGBColor(99, 102, 241)# #6366f1 (Indigo)
    ACCENT_PURPLE = RGBColor(139, 92, 246)# #8b5cf6 (Violet)
    ACCENT_CYAN = RGBColor(6, 182, 212)   # #06b6d4 (Cyan)
    ACCENT_EMERALD = RGBColor(16, 185, 129)# #10b981 (Emerald)
    ACCENT_AMBER = RGBColor(245, 158, 11) # #f59e0b (Amber)
    ACCENT_DANGER = RGBColor(239, 68, 68) # #ef4444 (Red)
    TEXT_WHITE = RGBColor(248, 250, 252)  # #f8fafc
    TEXT_MUTED = RGBColor(148, 163, 184)  # #94a3b8
    TEXT_DIM = RGBColor(100, 116, 139)    # #64748b
    CODE_BG = RGBColor(8, 10, 20)         # #080a14
    CODE_TEXT = RGBColor(165, 180, 252)   # #a5b4fc

    def apply_slide_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_COLOR
        bg.line.fill.background() # no border
        return bg

    def add_header(slide, category, title, subtitle=None):
        # Category Tag Pill
        cat_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.5), Inches(4.2), Inches(0.35))
        cat_box.fill.solid()
        cat_box.fill.fore_color.rgb = SURFACE_LIGHT
        cat_box.line.color.rgb = PRIMARY_COLOR
        cat_box.line.width = Pt(1)
        tf = cat_box.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.15)
        tf.margin_top = Inches(0.04)
        p = tf.paragraphs[0]
        p.text = category.upper()
        p.font.name = "Segoe UI"
        p.font.size = Pt(9.5)
        p.font.bold = True
        p.font.color.rgb = PRIMARY_COLOR

        # Title
        tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(11.7), Inches(0.7))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.name = "Segoe UI"
        p.font.size = Pt(22)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE

        # Subtitle
        if subtitle:
            p2 = tf.add_paragraph()
            p2.text = subtitle
            p2.font.name = "Segoe UI"
            p2.font.size = Pt(11)
            p2.font.italic = True
            p2.font.color.rgb = TEXT_MUTED

    def add_footer(slide, slide_num):
        tb = slide.shapes.add_textbox(Inches(0.8), Inches(7.0), Inches(11.7), Inches(0.4))
        tf = tb.text_frame
        p = tf.paragraphs[0]
        p.text = "StreamSphere — OTT Platform Management System  |  DBMS Laboratory Mini-Project"
        p.font.name = "Segoe UI"
        p.font.size = Pt(8.5)
        p.font.color.rgb = TEXT_DIM

        # Slide Number on right
        tb_num = slide.shapes.add_textbox(Inches(11.5), Inches(7.0), Inches(1.0), Inches(0.4))
        tf_num = tb_num.text_frame
        p_num = tf_num.paragraphs[0]
        p_num.alignment = PP_ALIGN.RIGHT
        p_num.text = f"{slide_num} / 12"
        p_num.font.name = "Segoe UI"
        p_num.font.size = Pt(8.5)
        p_num.font.bold = True
        p_num.font.color.rgb = PRIMARY_COLOR

    def add_card(slide, left, top, width, height, title=None, border_color=BORDER_COLOR, bg_color=SURFACE_COLOR):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = border_color
        card.line.width = Pt(1.2)
        
        if title:
            # Title header inside card
            tb = slide.shapes.add_textbox(left + Inches(0.15), top + Inches(0.12), width - Inches(0.3), Inches(0.4))
            tf = tb.text_frame
            tf.word_wrap = True
            p = tf.paragraphs[0]
            p.text = title
            p.font.name = "Segoe UI"
            p.font.size = Pt(12)
            p.font.bold = True
            p.font.color.rgb = TEXT_WHITE
        return card

    # =========================================================================
    # SLIDE 1: TITLE SLIDE
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_layout)
    apply_slide_background(slide1)

    # Accent decorative top strip
    top_strip = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(0.15))
    top_strip.fill.solid()
    top_strip.fill.fore_color.rgb = PRIMARY_COLOR
    top_strip.line.fill.background()

    # Project Tag Pill
    proj_pill = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(0.9), Inches(4.8), Inches(0.4))
    proj_pill.fill.solid()
    proj_pill.fill.fore_color.rgb = SURFACE_LIGHT
    proj_pill.line.color.rgb = PRIMARY_COLOR
    proj_pill.line.width = Pt(1)
    tf = proj_pill.text_frame
    p = tf.paragraphs[0]
    p.text = "DBMS LABORATORY MINI-PROJECT  |  ACADEMIC YEAR 2025–2026"
    p.font.name = "Segoe UI"
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = PRIMARY_COLOR

    # Main Project Title
    title_box = slide1.shapes.add_textbox(Inches(1.0), Inches(1.4), Inches(11.3), Inches(1.4))
    tf = title_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "StreamSphere"
    p.font.name = "Segoe UI"
    p.font.size = Pt(44)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    p2 = tf.add_paragraph()
    p2.text = "OTT Platform Management System"
    p2.font.name = "Segoe UI"
    p2.font.size = Pt(22)
    p2.font.bold = True
    p2.font.color.rgb = ACCENT_PURPLE

    p3 = tf.add_paragraph()
    p3.text = "A Full-Stack Relational Database System with MySQL 8.0, Node.js REST API, and Modern React Dashboard"
    p3.font.name = "Segoe UI"
    p3.font.size = Pt(12)
    p3.font.italic = True
    p3.font.color.rgb = TEXT_MUTED

    # 3 Information Cards at bottom
    # Card 1: Department & College
    add_card(slide1, Inches(1.0), Inches(3.6), Inches(3.5), Inches(2.8), title="Institution & Department")
    tb = slide1.shapes.add_textbox(Inches(1.15), Inches(4.2), Inches(3.2), Inches(2.0))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "DEPARTMENT:"
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = PRIMARY_COLOR
    p_val = tf.add_paragraph()
    p_val.text = "[Department of Computer Science & Engineering]"
    p_val.font.size = Pt(10.5)
    p_val.font.color.rgb = TEXT_WHITE

    p_c = tf.add_paragraph()
    p_c.text = "\nCOLLEGE / INSTITUTION:"
    p_c.font.size = Pt(9.5)
    p_c.font.bold = True
    p_c.font.color.rgb = PRIMARY_COLOR
    p_c_val = tf.add_paragraph()
    p_c_val.text = "[Your College / Institute Name Here]"
    p_c_val.font.size = Pt(10.5)
    p_c_val.font.color.rgb = TEXT_WHITE

    # Card 2: Student Team
    add_card(slide1, Inches(4.9), Inches(3.6), Inches(3.7), Inches(2.8), title="Project Team Members")
    tb = slide1.shapes.add_textbox(Inches(5.05), Inches(4.2), Inches(3.4), Inches(2.0))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "TEAM MEMBERS & ROLL NUMBERS:"
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = ACCENT_PURPLE

    m1 = tf.add_paragraph()
    m1.text = "1. [Student Name 1 — Roll No / Reg No]"
    m1.font.size = Pt(10.5)
    m1.font.color.rgb = TEXT_WHITE

    m2 = tf.add_paragraph()
    m2.text = "2. [Student Name 2 — Roll No / Reg No]"
    m2.font.size = Pt(10.5)
    m2.font.color.rgb = TEXT_WHITE

    m3 = tf.add_paragraph()
    m3.text = "3. [Student Name 3 — Roll No / Reg No]"
    m3.font.size = Pt(10.5)
    m3.font.color.rgb = TEXT_WHITE

    m_deg = tf.add_paragraph()
    m_deg.text = "\nDegree: B.Tech Computer Science & Engineering (Year II)"
    m_deg.font.size = Pt(9.5)
    m_deg.font.color.rgb = TEXT_MUTED

    # Card 3: Faculty Guidance & Evaluation
    add_card(slide1, Inches(8.9), Inches(3.6), Inches(3.4), Inches(2.8), title="Faculty & Evaluation")
    tb = slide1.shapes.add_textbox(Inches(9.05), Inches(4.2), Inches(3.1), Inches(2.0))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "COURSE INSTRUCTOR / GUIDE:"
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = ACCENT_CYAN

    f1 = tf.add_paragraph()
    f1.text = "[Prof. / Dr. Faculty Name Here]"
    f1.font.size = Pt(10.5)
    f1.font.color.rgb = TEXT_WHITE

    f_sub = tf.add_paragraph()
    f_sub.text = "\nLABORATORY COURSE:"
    f_sub.font.size = Pt(9.5)
    f_sub.font.bold = True
    f_sub.font.color.rgb = ACCENT_CYAN

    f_sub_val = tf.add_paragraph()
    f_sub_val.text = "Database Management Systems Lab\nCourse Code: [CS-302P / CS-XXXX]"
    f_sub_val.font.size = Pt(10.5)
    f_sub_val.font.color.rgb = TEXT_WHITE

    slide1.notes_slide.notes_text_frame.text = (
        "Good morning respected evaluators, professors, and faculty members. "
        "Today we present our DBMS Laboratory mini-project titled 'StreamSphere: OTT Platform Management System'. "
        "Our system is designed and implemented as a complete, working relational database solution using MySQL 8.0, "
        "Express REST APIs, and a modern React dashboard. We will demonstrate how real-world OTT streaming operations "
        "are mapped into normalized relational tables, constrained by database business rules, and analyzed using advanced "
        "SQL objects including stored procedures, views, and triggers."
    )

    # =========================================================================
    # SLIDE 2: INTRODUCTION & DOMAIN BACKGROUND
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    apply_slide_background(slide2)
    add_header(slide2, "1. Introduction & Domain Background", "Understanding OTT Operations & Database Imperatives", "Why media streaming platforms require strict relational consistency over simple flat stores")
    add_footer(slide2, 2)

    # 3 Column Cards
    col_width = Inches(3.64)
    # Card 1: What is OTT?
    add_card(slide2, Inches(0.8), Inches(1.8), col_width, Inches(4.8), title="The OTT Streaming Paradigm")
    tb = slide2.shapes.add_textbox(Inches(0.95), Inches(2.4), col_width - Inches(0.3), Inches(4.0))
    tf = tb.text_frame
    tf.word_wrap = True
    bullets1 = [
        "Over-The-Top (OTT) media services stream films, episodic web series, and live television directly to consumers over the public Internet.",
        "Bypasses traditional broadcast, cable, and satellite television distributors.",
        "Examples: Netflix, Amazon Prime Video, Disney+ Hotstar, HBO Max.",
        "Exponential scale: modern platforms manage tens of thousands of catalog titles and hundreds of thousands of concurrent viewing streams."
    ]
    for i, b in enumerate(bullets1):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"•  {b}"
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_MUTED
        p.space_after = Pt(10)

    # Card 2: Why Database Integrity Matters
    add_card(slide2, Inches(4.84), Inches(1.8), col_width, Inches(4.8), title="Why Relational Integrity Matters")
    tb = slide2.shapes.add_textbox(Inches(4.99), Inches(2.4), col_width - Inches(0.3), Inches(4.0))
    tf = tb.text_frame
    tf.word_wrap = True
    bullets2 = [
        "Financial Billing Accuracy: Subscriptions involve recurring transactions; missing or duplicate records result in revenue loss or user disputes.",
        "Temporal Access Windows: Access must be strictly governed by start and expiration dates (end_date >= start_date).",
        "Playback Telemetry: Tracking stream progress (minutes watched) requires referential integrity across Users and Content.",
        "ACID Guarantees: Activation of paid plans requires atomic execution — updating prior subscriptions and creating new ones in a single transaction."
    ]
    for i, b in enumerate(bullets2):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"•  {b}"
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_MUTED
        p.space_after = Pt(10)

    # Card 3: The StreamSphere Solution
    add_card(slide2, Inches(8.88), Inches(1.8), col_width, Inches(4.8), title="The StreamSphere Solution")
    tb = slide2.shapes.add_textbox(Inches(9.03), Inches(2.4), col_width - Inches(0.3), Inches(4.0))
    tf = tb.text_frame
    tf.word_wrap = True
    bullets3 = [
        "Relational-First Design: 7 interconnected tables modeled in MySQL 8.0 InnoDB engine.",
        "Zero Mock Data: Every dashboard card, genre bar, and report is computed live via SQL queries.",
        "Integrated SQL Objects: Utilizes MySQL Stored Procedures, Triggers, Views, and Check Constraints.",
        "Academic & Professional Rigor: Fully normalized schema (3NF/BCNF) paired with an enterprise REST API and modern UI."
    ]
    for i, b in enumerate(bullets3):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"•  {b}"
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_MUTED
        p.space_after = Pt(10)

    slide2.notes_slide.notes_text_frame.text = (
        "In this slide, we introduce the domain context. Over-The-Top or OTT platforms like Netflix and Prime Video "
        "have revolutionized media distribution. However, behind the simple user interface lies a massive data challenge: "
        "managing dynamic catalogs, subscription periods, watch telemetry, and ratings. "
        "A database-first approach is essential because subscriptions represent monetary contracts that require strict ACID compliance. "
        "StreamSphere was engineered to tackle these real-world challenges through a solid MySQL 8.0 relational architecture."
    )

    # =========================================================================
    # SLIDE 3: PROBLEM STATEMENT & PROJECT OBJECTIVES
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    apply_slide_background(slide3)
    add_header(slide3, "2. Problem Statement & Scope", "Operational Challenges & Technical Project Objectives", "Bridging the gap between raw media catalogs and reliable, normalized database management")
    add_footer(slide3, 3)

    # Left Box: Problem Statement
    add_card(slide3, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), title="Operational Challenges & Problem Statement", border_color=ACCENT_DANGER)
    tb = slide3.shapes.add_textbox(Inches(1.0), Inches(2.4), Inches(5.2), Inches(4.0))
    tf = tb.text_frame
    tf.word_wrap = True
    problems = [
        ("Data Redundancy in Catalogs", "Unnormalized flat schemas store repetitive genre names and plan pricing strings, leading to high storage overhead and update anomalies."),
        ("Subscription Overlaps & Inconsistencies", "Without atomic database procedures, users can hold conflicting active subscriptions or invalid expiration dates (e.g. end date earlier than start date)."),
        ("Orphaned Records & Integrity Loss", "Deleting a user or content title without defined foreign key deletion rules leaves dangling watch telemetry and unlinked ratings."),
        ("Academic Simulation Fallacy", "Many DBMS academic projects rely on hardcoded JavaScript arrays or client-side mock storage, failing to demonstrate real SQL query execution.")
    ]
    for i, (head, desc) in enumerate(problems):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"  {head}: "
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = ACCENT_DANGER
        run = p.add_run()
        run.text = desc
        run.font.bold = False
        run.font.color.rgb = TEXT_MUTED
        p.space_after = Pt(8)

    # Right Box: Project Objectives
    add_card(slide3, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.8), title="Key Project Objectives & System Scope", border_color=ACCENT_EMERALD)
    tb = slide3.shapes.add_textbox(Inches(7.0), Inches(2.4), Inches(5.3), Inches(4.0))
    tf = tb.text_frame
    tf.word_wrap = True
    objectives = [
        ("Formally Normalized Schema", "Design a 7-table relational schema meeting Third Normal Form (3NF) and BCNF standards to eliminate all update, insertion, and deletion anomalies."),
        ("Transactional Procedure Execution", "Implement a MySQL Stored Procedure (`sp_register_subscription`) to atomically validate plans, calculate terms, and update active statuses."),
        ("Active Trigger-Based Enforcement", "Implement server-side MySQL Triggers (`trg_validate_subscription_insert`) to block invalid dates and negative prices at the engine level."),
        ("Analytical Querying & Views", "Create pre-aggregated SQL Views (`vw_content_performance`) and report queries demonstrating JOIN, GROUP BY, SUM, AVG, and HAVING."),
        ("Project Scope Boundary", "Focuses on administrative operations, subscriber lifecycle, and telemetry analytics (excluding actual video file streaming and CDN bandwidth management).")
    ]
    for i, (head, desc) in enumerate(objectives):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"  {head}: "
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = ACCENT_EMERALD
        run = p.add_run()
        run.text = desc
        run.font.bold = False
        run.font.color.rgb = TEXT_MUTED
        p.space_after = Pt(7)

    slide3.notes_slide.notes_text_frame.text = (
        "On this slide, we outline the exact problems our project solves. In standard unnormalized databases, "
        "redundant genre descriptions and plan prices cause update anomalies. Furthermore, without database triggers and procedures, "
        "invalid subscription dates or orphaned watch logs can easily corrupt data. "
        "Our primary objective was to build a rigorous 7-table schema normalized to 3NF/BCNF, backed by transactional stored procedures, "
        "integrity triggers, and multi-table analytical views, while scoping out copyrighted video delivery to concentrate strictly on DBMS excellence."
    )

    # =========================================================================
    # SLIDE 4: TECHNOLOGY STACK & SYSTEM ARCHITECTURE
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    apply_slide_background(slide4)
    add_header(slide4, "3. System Architecture", "Three-Tier Client-Server Architecture", "End-to-end data flow: User Action → React Client → Express REST API → MySQL 8.0 Engine")
    add_footer(slide4, 4)

    # Horizontal Flow Visual Box
    flow_box = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(11.7), Inches(1.1))
    flow_box.fill.solid()
    flow_box.fill.fore_color.rgb = SURFACE_LIGHT
    flow_box.line.color.rgb = PRIMARY_COLOR
    flow_box.line.width = Pt(1.5)
    tf = flow_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    p.text = "CLIENT TIER (React + Vite)  ──[ HTTP / REST JSON ]──>  APPLICATION TIER (Node + Express)  ──[ Parameterized SQL ]──>  DATABASE TIER (MySQL 8.0)"
    p.font.name = "Segoe UI"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    p2 = tf.add_paragraph()
    p2.alignment = PP_ALIGN.CENTER
    p2.text = "Single Page Application (SPA)  |  Role-Based JWT Auth  |  Prepared Statements (Anti-SQLi)  |  InnoDB ACID Engine"
    p2.font.name = "Segoe UI"
    p2.font.size = Pt(9.5)
    p2.font.color.rgb = ACCENT_CYAN

    # 3 Technology Tier Cards
    col_w = Inches(3.64)
    # Tier 1: Frontend
    add_card(slide4, Inches(0.8), Inches(3.1), col_w, Inches(3.6), title="Client Tier: React 18 & Vite")
    tb = slide4.shapes.add_textbox(Inches(0.95), Inches(3.65), col_w - Inches(0.3), Inches(2.9))
    tf = tb.text_frame
    tf.word_wrap = True
    t1_bullets = [
        "Vite Build Tool: Lightning-fast HMR and optimized production bundles.",
        "Component Architecture: Reusable views for Dashboard, Catalog, Subscriptions, and Reports.",
        "Lucide Icons & Modern CSS: Custom dark glassmorphism theme inspired by premier streaming platforms.",
        "Reactive State: Synchronous UI feedback on CRUD operations with toast notifications."
    ]
    for i, b in enumerate(t1_bullets):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"•  {b}"
        p.font.size = Pt(10)
        p.font.color.rgb = TEXT_MUTED
        p.space_after = Pt(6)

    # Tier 2: Backend
    add_card(slide4, Inches(4.84), Inches(3.1), col_w, Inches(3.6), title="App Tier: Node.js & Express 5")
    tb = slide4.shapes.add_textbox(Inches(4.99), Inches(3.65), col_w - Inches(0.3), Inches(2.9))
    tf = tb.text_frame
    tf.word_wrap = True
    t2_bullets = [
        "Express 5 REST API: Structured modular routes for users, content, subscriptions, and telemetry.",
        "Security & Authentication: One-way bcrypt password hashing with salt rounds and signed JWT authorization.",
        "Parameterized Prepared SQL: Zero string concatenation in queries, strictly preventing SQL Injection attacks.",
        "Environment Secrets: Isolated database credentials managed via .env configuration."
    ]
    for i, b in enumerate(t2_bullets):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"•  {b}"
        p.font.size = Pt(10)
        p.font.color.rgb = TEXT_MUTED
        p.space_after = Pt(6)

    # Tier 3: Database
    add_card(slide4, Inches(8.88), Inches(3.1), col_w, Inches(3.6), title="Data Tier: MySQL 8.0 InnoDB")
    tb = slide4.shapes.add_textbox(Inches(9.03), Inches(3.65), col_w - Inches(0.3), Inches(2.9))
    tf = tb.text_frame
    tf.word_wrap = True
    t3_bullets = [
        "InnoDB Engine: Full ACID transactional safety, foreign key constraint enforcement, and row-level locking.",
        "7 Relational Tables: High-performance indexed storage for catalogs, users, billing, and logs.",
        "Database Programmability: Pre-compiled Stored Procedures, Triggers, Views, and Stored Functions.",
        "Connection Pooling: Managed via mysql2/promise with connection limits and health checks."
    ]
    for i, b in enumerate(t3_bullets):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"•  {b}"
        p.font.size = Pt(10)
        p.font.color.rgb = TEXT_MUTED
        p.space_after = Pt(6)

    slide4.notes_slide.notes_text_frame.text = (
        "Here we show the classical 3-tier architecture of StreamSphere. "
        "The presentation layer is built with React 18 and Vite for a reactive single-page experience. "
        "The middle tier uses Node.js and Express 5, implementing bcrypt hashing and JWT role guards. "
        "Crucially, the backend executes parameterized SQL statements through mysql2, which guarantees immunity against SQL injection. "
        "The data tier is powered by MySQL 8.0 with the InnoDB engine, providing native foreign keys, check constraints, and transactional procedures."
    )

    # =========================================================================
    # SLIDE 5: ER DIAGRAM
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    apply_slide_background(slide5)
    add_header(slide5, "4. Entity-Relationship Design", "Conceptual Entity-Relationship (ER) Model", "Visual mapping of 7 core entities, primary keys, foreign keys, and relationship cardinalities")
    add_footer(slide5, 5)

    # Left Container: Entity Summary Table
    add_card(slide5, Inches(0.8), Inches(1.8), Inches(6.0), Inches(4.8), title="Implemented Entity Definitions & Keys")
    tb = slide5.shapes.add_textbox(Inches(0.95), Inches(2.35), Inches(5.7), Inches(4.1))
    tf = tb.text_frame
    tf.word_wrap = True
    entities = [
        ("Users", "user_id (PK)", "name, email (UK), password_hash, role, created_at"),
        ("Genres", "genre_id (PK)", "genre_name (UK), description"),
        ("Content", "content_id (PK)", "title, content_type, genre_id (FK), release_year, duration"),
        ("SubscriptionPlans", "plan_id (PK)", "plan_name (UK), price, duration_days, description"),
        ("Subscriptions", "subscription_id (PK)", "user_id (FK), plan_id (FK), start_date, end_date, status"),
        ("WatchHistory", "history_id (PK)", "user_id (FK), content_id (FK), watched_at, progress_minutes"),
        ("Ratings", "rating_id (PK)", "user_id (FK), content_id (FK), rating, review, UK(user, content)")
    ]
    for i, (name, pk, attrs) in enumerate(entities):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"{i+1}. {name}: "
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = PRIMARY_COLOR
        r_pk = p.add_run()
        r_pk.text = f"[{pk}] "
        r_pk.font.bold = True
        r_pk.font.color.rgb = ACCENT_AMBER
        r_at = p.add_run()
        r_at.text = attrs
        r_at.font.bold = False
        r_at.font.color.rgb = TEXT_MUTED
        p.space_after = Pt(4)

    # Right Container: Cardinalities & Structural Relationships
    add_card(slide5, Inches(7.1), Inches(1.8), Inches(5.4), Inches(4.8), title="Relationship Cardinality Matrix")
    tb = slide5.shapes.add_textbox(Inches(7.25), Inches(2.35), Inches(5.1), Inches(4.1))
    tf = tb.text_frame
    tf.word_wrap = True
    rels = [
        ("Users (1)  ──  (M) Subscriptions", "One user purchases zero, one, or multiple subscription terms over time. Each subscription record belongs strictly to exactly one customer account."),
        ("SubscriptionPlans (1)  ──  (M) Subscriptions", "A commercial tier (e.g. Standard HD) is subscribed to by many users. Each active subscription is governed by one pricing tier."),
        ("Genres (1)  ──  (M) Content", "One genre category (e.g. Sci-Fi) classifies multiple movies and series. Each catalog item references a valid genre."),
        ("Users (M)  ──  (N) Content  [via WatchHistory]", "Many-to-many relationship tracking viewing telemetry. Resolved by associative entity WatchHistory with progress minutes."),
        ("Users (M)  ──  (N) Content  [via Ratings]", "Many-to-many relationship storing audience critiques. Governed by composite UNIQUE constraint (user_id, content_id).")
    ]
    for i, (rel_head, rel_desc) in enumerate(rels):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"•  {rel_head}\n"
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = ACCENT_CYAN
        r = p.add_run()
        r.text = f"   {rel_desc}"
        r.font.bold = False
        r.font.color.rgb = TEXT_MUTED
        p.space_after = Pt(6)

    slide5.notes_slide.notes_text_frame.text = (
        "This slide presents the conceptual Entity-Relationship diagram and cardinality analysis. "
        "Our schema features 7 distinct entities. Notice that many-to-many relationships are properly decomposed: "
        "Users and Content have two distinct M:N relationships. One is playback telemetry through WatchHistory, "
        "and the other is feedback through the Ratings table. In the Ratings table, a composite unique key ensures "
        "that one user can only review a specific title once, preventing duplicate vote rigging."
    )

    # =========================================================================
    # SLIDE 6: RELATIONAL SCHEMA & INTEGRITY CONSTRAINTS
    # =========================================================================
    slide6 = prs.slides.add_slide(blank_layout)
    apply_slide_background(slide6)
    add_header(slide6, "5. Relational Schema & Design", "Relational Schema & Referential Deletion Rules", "Data types, integrity constraints, and academic justification for deletion behaviors")
    add_footer(slide6, 6)

    # Left Container: Schema Definitions
    add_card(slide6, Inches(0.8), Inches(1.8), Inches(6.0), Inches(4.8), title="Relational Integrity & Check Constraints")
    tb = slide6.shapes.add_textbox(Inches(0.95), Inches(2.35), Inches(5.7), Inches(4.1))
    tf = tb.text_frame
    tf.word_wrap = True
    constraints_info = [
        ("PRIMARY KEY Constraints", "Every table uses a surrogate integer auto-increment primary key for optimal B-Tree index traversal."),
        ("UNIQUE KEY Constraints", "Enforced on Users(email), Genres(genre_name), SubscriptionPlans(plan_name), and composite UNIQUE(user_id, content_id) on Ratings."),
        ("CHECK Constraints (MySQL 8.0+)", [
            "Users: email format validation (LIKE '%_@__%.__%')",
            "Content: release_year BETWEEN 1900 AND 2100",
            "Content: duration_minutes IS NULL OR duration_minutes > 0",
            "SubscriptionPlans: price >= 0.00 AND duration_days > 0",
            "Subscriptions: amount_paid >= 0.00 AND end_date >= start_date",
            "Ratings: rating BETWEEN 1.0 AND 5.0"
        ])
    ]
    p1 = tf.paragraphs[0]
    p1.text = "1. PRIMARY KEY & UNIQUE CONSTRAINTS:\n"
    p1.font.size = Pt(10)
    p1.font.bold = True
    p1.font.color.rgb = PRIMARY_COLOR
    r1 = p1.add_run()
    r1.text = "Surrogate integer PKs across all 7 tables. Unique business keys prevent duplicate email accounts, duplicate plan names, and multiple reviews per user-title pair."
    r1.font.bold = False
    r1.font.color.rgb = TEXT_MUTED
    p1.space_after = Pt(10)

    p2 = tf.add_paragraph()
    p2.text = "2. CHECK CONSTRAINTS ENFORCED:\n"
    p2.font.size = Pt(10)
    p2.font.bold = True
    p2.font.color.rgb = ACCENT_PURPLE
    r2 = p2.add_run()
    r2.text = "• Content: release_year BETWEEN 1900 AND 2100\n• Plans: price >= 0.00 and duration_days > 0\n• Subscriptions: amount_paid >= 0.00 and end_date >= start_date\n• Ratings: rating BETWEEN 1.0 AND 5.0"
    r2.font.bold = False
    r2.font.color.rgb = TEXT_MUTED

    # Right Container: Deletion Rules (CASCADE vs RESTRICT)
    add_card(slide6, Inches(7.1), Inches(1.8), Inches(5.4), Inches(4.8), title="Referential Integrity & Deletion Actions")
    tb = slide6.shapes.add_textbox(Inches(7.25), Inches(2.35), Inches(5.1), Inches(4.1))
    tf = tb.text_frame
    tf.word_wrap = True
    
    p_res = tf.paragraphs[0]
    p_res.text = "1. ON DELETE RESTRICT (Data Protection Rules):\n"
    p_res.font.size = Pt(10.5)
    p_res.font.bold = True
    p_res.font.color.rgb = ACCENT_AMBER
    r_res = p_res.add_run()
    r_res.text = (
        "• Genres -> Content: Prevents deleting a genre if active movies or series reference it. Protects catalog structure.\n"
        "• SubscriptionPlans -> Subscriptions: Prohibits deleting commercial pricing tiers that are referenced by active or historical subscription contracts."
    )
    r_res.font.bold = False
    r_res.font.color.rgb = TEXT_MUTED
    p_res.space_after = Pt(12)

    p_cas = tf.add_paragraph()
    p_cas.text = "2. ON DELETE CASCADE (Account Purge Rules):\n"
    p_cas.font.size = Pt(10.5)
    p_cas.font.bold = True
    p_cas.font.color.rgb = ACCENT_EMERALD
    r_cas = p_cas.add_run()
    r_cas.text = (
        "• Users -> Subscriptions, WatchHistory, Ratings: When an account is removed, personal telemetry and billing transactions are purged to prevent orphaned references.\n"
        "• Content -> WatchHistory, Ratings: Purging a movie removes its associated telemetry logs and reviews automatically."
    )
    r_cas.font.bold = False
    r_cas.font.color.rgb = TEXT_MUTED

    slide6.notes_slide.notes_text_frame.text = (
        "A common question asked by DBMS examiners is how deletion rules were chosen. "
        "In StreamSphere, we deliberately avoided blindly cascading all deletions. "
        "We used ON DELETE RESTRICT on Genres and SubscriptionPlans. If an administrator attempts to delete a genre "
        "that still has movies assigned to it, MySQL strictly blocks the deletion. "
        "Conversely, ON DELETE CASCADE is applied to personal user data under Users and Content, ensuring that when an account "
        "is closed, all personal watch history and ratings are cleanly erased without leaving orphan records."
    )

    # =========================================================================
    # SLIDE 7: NORMALIZATION ANALYSIS
    # =========================================================================
    slide7 = prs.slides.add_slide(blank_layout)
    apply_slide_background(slide7)
    add_header(slide7, "6. Database Normalization", "Normalization Analysis & Anomaly Resolution", "Formal proof of schema decomposition from Unnormalized Form (UNF) through 3NF and BCNF")
    add_footer(slide7, 7)

    # 4 Normal Form Cards Grid
    cw = Inches(5.65)
    ch = Inches(2.25)

    # 1NF Card
    add_card(slide7, Inches(0.8), Inches(1.8), cw, ch, title="First Normal Form (1NF)")
    tb = slide7.shapes.add_textbox(Inches(0.95), Inches(2.25), cw - Inches(0.3), Inches(1.7))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Requirement: Atomic attribute values; eliminate repeating groups.\n"
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = PRIMARY_COLOR
    r = p.add_run()
    r.text = "• Flat relation had repeating multi-valued fields for watched titles and purchased subscriptions.\n• Decomposed into distinct entities (WatchHistory, Subscriptions). Every column has atomic scalar domain types."
    r.font.bold = False
    r.font.color.rgb = TEXT_MUTED

    # 2NF Card
    add_card(slide7, Inches(6.85), Inches(1.8), cw, ch, title="Second Normal Form (2NF)")
    tb = slide7.shapes.add_textbox(Inches(7.0), Inches(2.25), cw - Inches(0.3), Inches(1.7))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Requirement: In 1NF and no partial dependencies on candidate keys.\n"
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = ACCENT_PURPLE
    r = p.add_run()
    r.text = "• All primary keys are single-attribute surrogate keys (user_id, content_id), making partial key dependency mathematically impossible.\n• In Ratings with alternate key (user_id, content_id), rating and review depend fully on the complete key."
    r.font.bold = False
    r.font.color.rgb = TEXT_MUTED

    # 3NF Card
    add_card(slide7, Inches(0.8), Inches(4.3), cw, ch, title="Third Normal Form (3NF)")
    tb = slide7.shapes.add_textbox(Inches(0.95), Inches(4.75), cw - Inches(0.3), Inches(1.7))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Requirement: In 2NF and no transitive functional dependencies.\n"
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = ACCENT_CYAN
    r = p.add_run()
    r.text = "• Transitive dependency content_id -> genre_id -> genre_name eliminated by decomposing into Genres.\n• subscription_id -> plan_id -> (price, duration) eliminated by isolating SubscriptionPlans. No non-prime attribute determines another non-prime attribute."
    r.font.bold = False
    r.font.color.rgb = TEXT_MUTED

    # BCNF Card
    add_card(slide7, Inches(6.85), Inches(4.3), cw, ch, title="Boyce-Codd Normal Form (BCNF)")
    tb = slide7.shapes.add_textbox(Inches(7.0), Inches(4.75), cw - Inches(0.3), Inches(1.7))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Requirement: For every functional dependency X -> Y, X is a superkey.\n"
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = ACCENT_EMERALD
    r = p.add_run()
    r.text = "• Users: user_id and email are candidate keys.\n• Genres: genre_id and genre_name are candidate keys.\n• Plans: plan_id and plan_name are candidate keys.\n• Ratings: rating_id and (user_id, content_id) are candidate keys. Schema achieves BCNF."
    r.font.bold = False
    r.font.color.rgb = TEXT_MUTED

    slide7.notes_slide.notes_text_frame.text = (
        "In this slide, we demonstrate normalization up to Boyce-Codd Normal Form. "
        "We started with an unnormalized flat relation where a user's row duplicated movies watched and plans purchased. "
        "In 1NF, we eliminated repeating groups and established atomic scalar domains. "
        "In 2NF, because our tables utilize single-column surrogate keys, partial functional dependencies cannot exist. "
        "In 3NF, we removed transitive dependencies by separating Genres and SubscriptionPlans. "
        "Finally, because every determinant across all functional dependencies is a candidate key, our database satisfies BCNF."
    )

    # =========================================================================
    # SLIDE 8: SQL IMPLEMENTATION (QUERIES & AGGREGATES)
    # =========================================================================
    slide8 = prs.slides.add_slide(blank_layout)
    apply_slide_background(slide8)
    add_header(slide8, "7. SQL Implementation", "Complex SQL Queries, JOINs & Aggregate Reports", "Actual parameterized queries executed live against MySQL 8.0 streamsphere_db")
    add_footer(slide8, 8)

    # Query 1: Content Distribution by Genre (LEFT JOIN, COUNT, SUM CASE)
    add_card(slide8, Inches(0.8), Inches(1.8), Inches(5.7), Inches(4.8), title="1. Content by Genre (JOIN & Conditional SUM)")
    tb1 = slide8.shapes.add_textbox(Inches(0.95), Inches(2.3), Inches(5.4), Inches(2.3))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    p = tf1.paragraphs[0]
    p.text = "SQL Query Statement:"
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = PRIMARY_COLOR

    code_box1 = slide8.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.95), Inches(2.6), Inches(5.4), Inches(2.0))
    code_box1.fill.solid()
    code_box1.fill.fore_color.rgb = CODE_BG
    code_box1.line.color.rgb = BORDER_COLOR
    tf_c1 = code_box1.text_frame
    tf_c1.word_wrap = True
    p_c1 = tf_c1.paragraphs[0]
    p_c1.text = (
        "SELECT g.genre_id, g.genre_name,\n"
        "  COUNT(c.content_id) AS total_titles,\n"
        "  SUM(CASE WHEN c.content_type = 'Movie'\n"
        "      THEN 1 ELSE 0 END) AS movie_count,\n"
        "  SUM(CASE WHEN c.content_type = 'Series'\n"
        "      THEN 1 ELSE 0 END) AS series_count\n"
        "FROM Genres g\n"
        "LEFT JOIN Content c ON g.genre_id = c.genre_id\n"
        "GROUP BY g.genre_id, g.genre_name\n"
        "ORDER BY total_titles DESC;"
    )
    p_c1.font.name = "Consolas"
    p_c1.font.size = Pt(8.5)
    p_c1.font.color.rgb = CODE_TEXT

    tb_exp1 = slide8.shapes.add_textbox(Inches(0.95), Inches(4.7), Inches(5.4), Inches(1.7))
    tf_exp1 = tb_exp1.text_frame
    tf_exp1.word_wrap = True
    p_e1 = tf_exp1.paragraphs[0]
    p_e1.text = "DBMS Viva Explanation:\n"
    p_e1.font.size = Pt(9.5)
    p_e1.font.bold = True
    p_e1.font.color.rgb = ACCENT_AMBER
    r_e1 = p_e1.add_run()
    r_e1.text = "Uses LEFT JOIN so genres with 0 titles are preserved. Combines COUNT with conditional SUM(CASE) to simultaneously calculate total assets, movies, and series in a single table pass."
    r_e1.font.bold = False
    r_e1.font.color.rgb = TEXT_MUTED

    # Query 2: Ratings with HAVING Clause
    add_card(slide8, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.8), title="2. Ratings & Reviews (GROUP BY & HAVING)")
    tb2 = slide8.shapes.add_textbox(Inches(6.95), Inches(2.3), Inches(5.4), Inches(2.3))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "SQL Query Statement:"
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = ACCENT_CYAN

    code_box2 = slide8.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(6.95), Inches(2.6), Inches(5.4), Inches(2.0))
    code_box2.fill.solid()
    code_box2.fill.fore_color.rgb = CODE_BG
    code_box2.line.color.rgb = BORDER_COLOR
    tf_c2 = code_box2.text_frame
    tf_c2.word_wrap = True
    p_c2 = tf_c2.paragraphs[0]
    p_c2.text = (
        "SELECT c.content_id, c.title, g.genre_name,\n"
        "  COUNT(r.rating_id) AS total_reviews,\n"
        "  ROUND(AVG(r.rating), 2) AS average_rating,\n"
        "  MIN(r.rating) AS min_rating,\n"
        "  MAX(r.rating) AS max_rating\n"
        "FROM Content c\n"
        "JOIN Genres g ON c.genre_id = g.genre_id\n"
        "JOIN Ratings r ON c.content_id = r.content_id\n"
        "GROUP BY c.content_id, c.title, g.genre_name\n"
        "HAVING COUNT(r.rating_id) >= 1\n"
        "ORDER BY average_rating DESC;"
    )
    p_c2.font.name = "Consolas"
    p_c2.font.size = Pt(8.5)
    p_c2.font.color.rgb = CODE_TEXT

    tb_exp2 = slide8.shapes.add_textbox(Inches(6.95), Inches(4.7), Inches(5.4), Inches(1.7))
    tf_exp2 = tb_exp2.text_frame
    tf_exp2.word_wrap = True
    p_e2 = tf_exp2.paragraphs[0]
    p_e2.text = "DBMS Viva Explanation:\n"
    p_e2.font.size = Pt(9.5)
    p_e2.font.bold = True
    p_e2.font.color.rgb = ACCENT_AMBER
    r_e2 = p_e2.add_run()
    r_e2.text = "Demonstrates 3-table INNER JOIN across Content, Genres, and Ratings. Uses aggregate functions AVG, MIN, MAX, COUNT, and filters aggregated groups using the HAVING clause."
    r_e2.font.bold = False
    r_e2.font.color.rgb = TEXT_MUTED

    slide8.notes_slide.notes_text_frame.text = (
        "On this slide, we examine the actual SQL queries running in our backend. "
        "The first query uses a LEFT JOIN from Genres to Content with conditional SUM(CASE) to count movies and series "
        "in one consolidated group. "
        "The second query joins Content, Genres, and Ratings. It computes the average, minimum, and maximum scores, "
        "and demonstrates the HAVING clause to filter out unreviewed content from the top-rated leaderboard."
    )

    # =========================================================================
    # SLIDE 9: ADVANCED DATABASE FEATURES (PROCEDURE, TRIGGER, VIEW, FUNCTION)
    # =========================================================================
    slide9 = prs.slides.add_slide(blank_layout)
    apply_slide_background(slide9)
    add_header(slide9, "8. Advanced Database Objects", "Stored Procedure, Trigger, SQL View & Function", "Server-side business logic and transactional abstractions implemented in MySQL 8.0")
    add_footer(slide9, 9)

    cw = Inches(5.65)
    ch = Inches(2.35)

    # Card 1: Stored Procedure
    add_card(slide9, Inches(0.8), Inches(1.8), cw, ch, title="Stored Procedure: sp_register_subscription", border_color=ACCENT_EMERALD)
    tb = slide9.shapes.add_textbox(Inches(0.95), Inches(2.25), cw - Inches(0.3), Inches(1.8))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = (
        "• Parameters: IN p_user_id, IN p_plan_id, IN p_start_date, OUT p_sub_id, OUT p_message\n"
        "• Transactional Atomicity: Uses START TRANSACTION, COMMIT, and EXIT HANDLER FOR SQLEXCEPTION with ROLLBACK.\n"
        "• Business Rules: Validates user/plan existence, computes end_date = DATE_ADD(start_date, INTERVAL duration DAY), and auto-expires prior active subscriptions."
    )
    p.font.size = Pt(9.5)
    p.font.color.rgb = TEXT_MUTED

    # Card 2: Trigger
    add_card(slide9, Inches(6.85), Inches(1.8), cw, ch, title="MySQL Trigger: trg_validate_subscription_insert", border_color=ACCENT_DANGER)
    tb = slide9.shapes.add_textbox(Inches(7.0), Inches(2.25), cw - Inches(0.3), Inches(1.8))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = (
        "• Event: BEFORE INSERT ON Subscriptions FOR EACH ROW.\n"
        "• Validation Logic: Checks if NEW.end_date < NEW.start_date or NEW.amount_paid < 0.00.\n"
        "• Exception Signaling: Throws SIGNAL SQLSTATE '45000' with custom error message.\n"
        "• Live Viva Test: Tested via the app's Reports page; attempting invalid dates immediately raises ER_SIGNAL_EXCEPTION."
    )
    p.font.size = Pt(9.5)
    p.font.color.rgb = TEXT_MUTED

    # Card 3: SQL View
    add_card(slide9, Inches(0.8), Inches(4.35), cw, ch, title="SQL View: vw_content_performance", border_color=PRIMARY_COLOR)
    tb = slide9.shapes.add_textbox(Inches(0.95), Inches(4.8), cw - Inches(0.3), Inches(1.8))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = (
        "• Multi-Table Abstraction: Pre-aggregates Content, Genres, WatchHistory, and Ratings.\n"
        "• Pre-Computed Metrics: Exposes total_views, total_ratings, and avg_rating.\n"
        "• Performance & Security: Eliminates writing 4-table joins in dashboard queries and simplifies client access."
    )
    p.font.size = Pt(9.5)
    p.font.color.rgb = TEXT_MUTED

    # Card 4: Stored Function
    add_card(slide9, Inches(6.85), Inches(4.35), cw, ch, title="Stored Function: fn_calculate_user_watch_hours", border_color=ACCENT_CYAN)
    tb = slide9.shapes.add_textbox(Inches(7.0), Inches(4.8), cw - Inches(0.3), Inches(1.8))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = (
        "• Deterministic Function: Takes p_user_id INT, queries SUM(progress_minutes) from WatchHistory.\n"
        "• Mathematical Output: Returns ROUND(v_total_minutes / 60.0, 2) as DECIMAL(6,2).\n"
        "• Modular Integration: Directly callable within SELECT projection queries across the database."
    )
    p.font.size = Pt(9.5)
    p.font.color.rgb = TEXT_MUTED

    slide9.notes_slide.notes_text_frame.text = (
        "This is a crucial slide for your viva. We implemented all four major advanced database objects. "
        "First, stored procedure sp_register_subscription wraps subscription purchase in a database transaction with ROLLBACK. "
        "Second, trigger trg_validate_subscription_insert fires BEFORE INSERT to reject invalid dates with SQLSTATE 45000. "
        "Third, view vw_content_performance joins four tables to provide pre-aggregated catalog stats. "
        "Fourth, stored function fn_calculate_user_watch_hours converts streaming minutes into rounded hours."
    )

    # =========================================================================
    # SLIDE 10: APPLICATION MODULES & UI DEMONSTRATION
    # =========================================================================
    slide10 = prs.slides.add_slide(blank_layout)
    apply_slide_background(slide10)
    add_header(slide10, "9. Application Walkthrough", "StreamSphere Application Modules & UI Showcase", "Verified operational modules connected directly to MySQL backend REST endpoints")
    add_footer(slide10, 10)

    # 6 Grid Modules
    mw = Inches(3.64)
    mh = Inches(2.25)
    modules = [
        ("1. Operational Dashboard", "Live KPI cards (Users, Catalog, Active Subscriptions, Revenue), interactive genre distribution bars, popular titles, and real-time playback telemetry feed.", ACCENT_EMERALD),
        ("2. Content Catalog Management", "Media inventory table with live search by title, filters by genre and format (Movie/Series), release year sorting, and modal CRUD dialogs.", PRIMARY_COLOR),
        ("3. User & Access Control", "Customer and admin profile management with role indicators, email uniqueness verification, and security guard preventing self-deletion.", ACCENT_PURPLE),
        ("4. Subscription Lifecycle", "Interactive execution of Stored Procedure sp_register_subscription, automatic expiration handling, and remaining access days countdown.", ACCENT_CYAN),
        ("5. Playback Telemetry & Reviews", "Watch history logger tracking streaming duration in minutes, coupled with audience rating submission on a 1.0–5.0 star scale.", ACCENT_AMBER),
        ("6. DBMS Lab & Viva Showcase", "Dedicated demonstration screen with live SQL query inspector, SQL View explorer, Stored Procedure runner, and interactive Trigger tester.", ACCENT_DANGER)
    ]
    coords = [
        (Inches(0.8), Inches(1.8)),
        (Inches(4.84), Inches(1.8)),
        (Inches(8.88), Inches(1.8)),
        (Inches(0.8), Inches(4.35)),
        (Inches(4.84), Inches(4.35)),
        (Inches(8.88), Inches(4.35))
    ]
    for (name, desc, accent), (l, t) in zip(modules, coords):
        add_card(slide10, l, t, mw, mh, title=name, border_color=accent)
        tb = slide10.shapes.add_textbox(l + Inches(0.15), t + Inches(0.48), mw - Inches(0.3), mh - Inches(0.6))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.size = Pt(9.5)
        p.font.color.rgb = TEXT_MUTED
        
        # Placeholder indicator
        p_ph = tf.add_paragraph()
        p_ph.text = "[ Screenshot: Live Screen in App ]"
        p_ph.font.size = Pt(8.5)
        p_ph.font.italic = True
        p_ph.font.color.rgb = accent

    slide10.notes_slide.notes_text_frame.text = (
        "Here we show the user interface architecture. The application features six dedicated management screens. "
        "The Dashboard displays live aggregate metrics directly computed by MySQL. "
        "The Content screen supports full search and multi-filtering. "
        "The Subscription screen invokes our stored procedure directly from the UI. "
        "And the DBMS Lab Showcase screen allows professors and examiners to inspect the exact SQL queries running "
        "behind each report and trigger exceptions live."
    )

    # =========================================================================
    # SLIDE 11: TESTING AND RESULTS
    # =========================================================================
    slide11 = prs.slides.add_slide(blank_layout)
    apply_slide_background(slide11)
    add_header(slide11, "10. Testing & Quality Assurance", "Empirical Testing & Verification Results", "100% verified test cases executed against MySQL database and REST API endpoints")
    add_footer(slide11, 11)

    # Verification Badge
    badge = slide11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.75), Inches(11.7), Inches(0.5))
    badge.fill.solid()
    badge.fill.fore_color.rgb = RGBColor(16, 185, 129)
    badge.line.fill.background()
    tf_b = badge.text_frame
    p_b = tf_b.paragraphs[0]
    p_b.alignment = PP_ALIGN.CENTER
    p_b.text = "VERIFIED TEST EXECUTION: ALL 15 AUTOMATED SYSTEM & DATABASE TESTS PASSED SUCCESSFULLY"
    p_b.font.name = "Segoe UI"
    p_b.font.size = Pt(10.5)
    p_b.font.bold = True
    p_b.font.color.rgb = RGBColor(255, 255, 255)

    # Test Results Table
    add_card(slide11, Inches(0.8), Inches(2.4), Inches(11.7), Inches(4.4), title="Automated End-to-End Test Matrix")
    tb = slide11.shapes.add_textbox(Inches(0.95), Inches(2.9), Inches(11.4), Inches(3.7))
    tf = tb.text_frame
    tf.word_wrap = True

    test_cases = [
        ("TC-01", "Database Connectivity", "Verify MySQL connection pool and health check", "HTTP 200, connected to streamsphere_db", "PASS"),
        ("TC-02", "Admin Authentication", "Login with valid admin credentials", "HTTP 200, JWT token returned, role: Admin", "PASS"),
        ("TC-03", "Invalid Login Guard", "Submit incorrect password", "HTTP 401 Unauthorized, access rejected", "PASS"),
        ("TC-04", "Live Dashboard Stats", "Query aggregate user, content, and revenue KPIs", "HTTP 200, users=12, content=12, rev=₹10,938", "PASS"),
        ("TC-05", "Parameterized Filtering", "Filter content by genre (Sci-Fi, genre_id=2)", "HTTP 200, returns exactly 3 Sci-Fi titles", "PASS"),
        ("TC-06", "Stored Procedure", "Execute CALL sp_register_subscription(4, 1, ...)", "HTTP 201, auto-expires prior sub, returns ID", "PASS"),
        ("TC-07", "MySQL Trigger Validation", "Attempt invalid subscription (end_date < start_date)", "Trigger intercepts, signals SQLSTATE 45000", "PASS"),
        ("TC-08", "SQL View Execution", "Query SELECT * FROM vw_content_performance", "HTTP 200, 12 summarized rows returned", "PASS"),
        ("TC-09", "Referential Integrity", "Delete genre referenced by active titles", "HTTP 400 Bad Request (RESTRICT enforced)", "PASS"),
        ("TC-10", "Composite Unique Key", "Submit review on existing user-content pair", "HTTP 201, ON DUPLICATE KEY UPDATE executed", "PASS")
    ]
    for i, (tc_id, module, action, expected, status) in enumerate(test_cases):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"{tc_id} | {module.ljust(20)} | {action.ljust(40)} | Expected: {expected}  "
        p.font.name = "Consolas"
        p.font.size = Pt(8.5)
        p.font.color.rgb = TEXT_MUTED
        r = p.add_run()
        r.text = f"[{status}]"
        r.font.bold = True
        r.font.color.rgb = ACCENT_EMERALD
        p.space_after = Pt(2)

    slide11.notes_slide.notes_text_frame.text = (
        "This slide documents our rigorous quality assurance. We wrote an automated end-to-end verification script "
        "that executes all 15 core test cases against the live MySQL database. "
        "Every single test passed with a 100% success rate. "
        "Specifically, we verified that login authentication rejects bad passwords, stored procedures execute atomically, "
        "and our trigger successfully catches and blocks invalid subscription dates with SQLSTATE 45000."
    )

    # =========================================================================
    # SLIDE 12: CONCLUSION AND FUTURE ENHANCEMENTS
    # =========================================================================
    slide12 = prs.slides.add_slide(blank_layout)
    apply_slide_background(slide12)
    add_header(slide12, "11. Conclusion & Scope", "Project Summary, Academic Contributions & Future Scope", "Reflecting on achievements, database engineering takeaways, and technical scalability")
    add_footer(slide12, 12)

    # Left Box: Key Achievements
    add_card(slide12, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.0), title="Key Project Achievements", border_color=PRIMARY_COLOR)
    tb = slide12.shapes.add_textbox(Inches(1.0), Inches(2.4), Inches(5.2), Inches(3.2))
    tf = tb.text_frame
    tf.word_wrap = True
    achievements = [
        ("Database-First Engineering", "Built a complete working system where every single view and report runs genuine SQL against MySQL 8.0."),
        ("Formal Normalization", "Demonstrated and verified schema decomposition up to 3NF/BCNF, eliminating update anomalies."),
        ("Active SQL Programmability", "Implemented and verified Stored Procedures, Triggers, Views, and Check Constraints."),
        ("Security & Integrity", "Enforced parameterized queries against SQL injection and utilized bcrypt password hashing."),
        ("Viva Demonstration Ready", "Full UI and backend running live with automated test confirmation.")
    ]
    for i, (head, desc) in enumerate(achievements):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"•  {head}: "
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = PRIMARY_COLOR
        r = p.add_run()
        r.text = desc
        r.font.bold = False
        r.font.color.rgb = TEXT_MUTED
        p.space_after = Pt(6)

    # Right Box: Future Enhancements
    add_card(slide12, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.0), title="Future Roadmap & Scalability Scope", border_color=ACCENT_CYAN)
    tb = slide12.shapes.add_textbox(Inches(7.0), Inches(2.4), Inches(5.3), Inches(3.2))
    tf = tb.text_frame
    tf.word_wrap = True
    future = [
        ("CDN & HLS Video Streaming", "Integration of Amazon S3/CloudFront and HTTP Live Streaming (HLS) adaptive bitrate chunking."),
        ("ML Recommendation Engine", "Collaborative filtering matrix factorization and cosine similarity models based on watch history and ratings."),
        ("Commercial Payment Webhooks", "Integration with payment gateways (Stripe/Razorpay) for automated renewal events."),
        ("Multi-Profile Account Sharing", "Adding family profile partitions per user account with parental rating control PINs.")
    ]
    for i, (head, desc) in enumerate(future):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"•  {head}: "
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = ACCENT_CYAN
        r = p.add_run()
        r.text = desc
        r.font.bold = False
        r.font.color.rgb = TEXT_MUTED
        p.space_after = Pt(6)

    # Bottom Thank You / Q&A Banner
    thank_box = slide12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.0), Inches(11.7), Inches(0.8))
    thank_box.fill.solid()
    thank_box.fill.fore_color.rgb = SURFACE_LIGHT
    thank_box.line.color.rgb = PRIMARY_COLOR
    thank_box.line.width = Pt(1.5)
    tf_th = thank_box.text_frame
    p_th = tf_th.paragraphs[0]
    p_th.alignment = PP_ALIGN.CENTER
    p_th.text = "THANK YOU!  |  QUESTIONS & LIVE DEMONSTRATION"
    p_th.font.name = "Segoe UI"
    p_th.font.size = Pt(13)
    p_th.font.bold = True
    p_th.font.color.rgb = TEXT_WHITE
    p_sub = tf_th.add_paragraph()
    p_sub.alignment = PP_ALIGN.CENTER
    p_sub.text = "StreamSphere DBMS Mini-Project is ready for live SQL inspection, trigger tests, and viva evaluation."
    p_sub.font.name = "Segoe UI"
    p_sub.font.size = Pt(9.5)
    p_sub.font.color.rgb = ACCENT_PURPLE

    slide12.notes_slide.notes_text_frame.text = (
        "In conclusion, StreamSphere demonstrates how relational database principles translate directly into real-world applications. "
        "We successfully normalized our schema to 3NF/BCNF, proved transactional safety with stored procedures, "
        "and enforced business constraints via triggers. In the future, the platform can be expanded with CDN streaming, "
        "ML recommendation algorithms, and payment webhooks. "
        "Thank you for your time. We are now ready to demonstrate the live application and answer your questions."
    )

    output_path = os.path.abspath("StreamSphere_DBMS_Presentation.pptx")
    prs.save(output_path)
    print(f"Presentation successfully saved to: {output_path}")
    return output_path

if __name__ == "__main__":
    create_streamsphere_presentation()
