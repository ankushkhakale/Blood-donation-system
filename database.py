import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'blood_donation.db')

SCHEMA = """
PRAGMA journal_mode=WAL;

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('donor','recipient','hospital')),
    blood_type TEXT,
    location TEXT,
    phone TEXT,
    is_available INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS hospitals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    hospital_name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hospital_id INTEGER NOT NULL,
    blood_type TEXT NOT NULL,
    units_available INTEGER DEFAULT 0,
    UNIQUE(hospital_id, blood_type),
    FOREIGN KEY(hospital_id) REFERENCES hospitals(id)
);

CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donor_id INTEGER NOT NULL,
    hospital_id INTEGER NOT NULL,
    blood_type TEXT NOT NULL,
    units INTEGER DEFAULT 1,
    status TEXT DEFAULT 'completed' CHECK(status IN ('scheduled','completed','cancelled')),
    donated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(donor_id) REFERENCES users(id),
    FOREIGN KEY(hospital_id) REFERENCES hospitals(id)
);

CREATE TABLE IF NOT EXISTS blood_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient_id INTEGER NOT NULL,
    hospital_id INTEGER,
    blood_type TEXT NOT NULL,
    units INTEGER DEFAULT 1,
    urgency TEXT DEFAULT 'normal' CHECK(urgency IN ('normal','urgent','critical')),
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','fulfilled','rejected')),
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(recipient_id) REFERENCES users(id),
    FOREIGN KEY(hospital_id) REFERENCES hospitals(id)
);

-- TRIGGER: After a donation is completed, auto-update hospital inventory
CREATE TRIGGER IF NOT EXISTS trg_update_inventory_after_donation
AFTER INSERT ON donations
WHEN NEW.status = 'completed'
BEGIN
    INSERT INTO inventory (hospital_id, blood_type, units_available)
    VALUES (NEW.hospital_id, NEW.blood_type, NEW.units)
    ON CONFLICT(hospital_id, blood_type)
    DO UPDATE SET units_available = units_available + NEW.units;
END;

-- TRIGGER: After inventory update, auto-fulfill pending requests if stock available
CREATE TRIGGER IF NOT EXISTS trg_fulfill_requests_after_inventory
AFTER INSERT ON inventory
BEGIN
    UPDATE blood_requests
    SET status = 'fulfilled', updated_at = datetime('now')
    WHERE status = 'pending'
      AND blood_type = NEW.blood_type
      AND hospital_id = NEW.hospital_id
      AND units <= NEW.units_available;
END;

-- TRIGGER: When request status updated to fulfilled, deduct from inventory
CREATE TRIGGER IF NOT EXISTS trg_deduct_inventory_on_fulfill
AFTER UPDATE OF status ON blood_requests
WHEN NEW.status = 'fulfilled' AND OLD.status = 'pending'
BEGIN
    UPDATE inventory
    SET units_available = MAX(0, units_available - NEW.units)
    WHERE hospital_id = NEW.hospital_id
      AND blood_type = NEW.blood_type;
END;
"""


def get_db():
    """Get a database connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    """Initialize the database schema and seed default inventory."""
    conn = get_db()
    conn.executescript(SCHEMA)
    conn.commit()
    conn.close()
    print("[DB] Database initialized.")
