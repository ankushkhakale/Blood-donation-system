from database import get_db
from werkzeug.security import generate_password_hash, check_password_hash


# ─── User Helpers ────────────────────────────────────────────────────────────

def get_user_by_id(user_id):
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    return user


def get_user_by_email(email):
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()
    return user


def create_user(name, email, password, role, blood_type=None, location=None, phone=None):
    pw_hash = generate_password_hash(password)
    conn = get_db()
    try:
        conn.execute(
            """INSERT INTO users (name, email, password_hash, role, blood_type, location, phone)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (name, email, pw_hash, role, blood_type, location, phone)
        )
        conn.commit()
        user_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
    finally:
        conn.close()
    return user_id


def verify_password(user, password):
    return check_password_hash(user['password_hash'], password)


def toggle_donor_availability(user_id, available):
    conn = get_db()
    conn.execute("UPDATE users SET is_available = ? WHERE id = ?", (1 if available else 0, user_id))
    conn.commit()
    conn.close()


def update_user_profile(user_id, name, phone, location, blood_type):
    conn = get_db()
    conn.execute(
        "UPDATE users SET name=?, phone=?, location=?, blood_type=? WHERE id=?",
        (name, phone, location, blood_type, user_id)
    )
    conn.commit()
    conn.close()


# ─── Hospital Helpers ─────────────────────────────────────────────────────────

def create_hospital(user_id, hospital_name, address, city):
    conn = get_db()
    conn.execute(
        "INSERT INTO hospitals (user_id, hospital_name, address, city) VALUES (?, ?, ?, ?)",
        (user_id, hospital_name, address, city)
    )
    # Seed inventory with 0 units for all blood types
    hosp_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
    blood_types = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    for bt in blood_types:
        conn.execute(
            "INSERT OR IGNORE INTO inventory (hospital_id, blood_type, units_available) VALUES (?, ?, 0)",
            (hosp_id, bt)
        )
    conn.commit()
    conn.close()
    return hosp_id


def get_hospital_by_user_id(user_id):
    conn = get_db()
    h = conn.execute("SELECT * FROM hospitals WHERE user_id = ?", (user_id,)).fetchone()
    conn.close()
    return h


def get_all_hospitals():
    conn = get_db()
    rows = conn.execute(
        "SELECT h.*, u.name as contact_name, u.phone FROM hospitals h JOIN users u ON h.user_id = u.id"
    ).fetchall()
    conn.close()
    return rows


# ─── Inventory Helpers ────────────────────────────────────────────────────────

def get_inventory(hospital_id):
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM inventory WHERE hospital_id = ? ORDER BY blood_type", (hospital_id,)
    ).fetchall()
    conn.close()
    return rows


def update_inventory_manual(hospital_id, blood_type, units):
    """Manually set inventory units."""
    conn = get_db()
    conn.execute(
        """INSERT INTO inventory (hospital_id, blood_type, units_available) VALUES (?, ?, ?)
           ON CONFLICT(hospital_id, blood_type)
           DO UPDATE SET units_available = units_available + ?""",
        (hospital_id, blood_type, units, units)
    )
    conn.commit()
    conn.close()


# ─── Donation Helpers ─────────────────────────────────────────────────────────

def record_donation(donor_id, hospital_id, blood_type, units, status='completed'):
    conn = get_db()
    conn.execute(
        "INSERT INTO donations (donor_id, hospital_id, blood_type, units, status) VALUES (?, ?, ?, ?, ?)",
        (donor_id, hospital_id, blood_type, units, status)
    )
    conn.commit()
    conn.close()


def get_donations_by_donor(donor_id):
    conn = get_db()
    rows = conn.execute(
        """SELECT d.*, h.hospital_name FROM donations d
           JOIN hospitals h ON d.hospital_id = h.id
           WHERE d.donor_id = ? ORDER BY d.donated_at DESC""",
        (donor_id,)
    ).fetchall()
    conn.close()
    return rows


def get_donations_by_hospital(hospital_id):
    conn = get_db()
    rows = conn.execute(
        """SELECT d.*, u.name as donor_name, u.blood_type as donor_bt
           FROM donations d JOIN users u ON d.donor_id = u.id
           WHERE d.hospital_id = ? ORDER BY d.donated_at DESC""",
        (hospital_id,)
    ).fetchall()
    conn.close()
    return rows


# ─── Blood Request Helpers ────────────────────────────────────────────────────

def create_blood_request(recipient_id, blood_type, units, urgency, notes, hospital_id=None):
    conn = get_db()
    conn.execute(
        """INSERT INTO blood_requests (recipient_id, hospital_id, blood_type, units, urgency, notes)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (recipient_id, hospital_id, blood_type, units, urgency, notes)
    )
    conn.commit()
    conn.close()


def get_requests_by_recipient(recipient_id):
    conn = get_db()
    rows = conn.execute(
        """SELECT r.*, h.hospital_name FROM blood_requests r
           LEFT JOIN hospitals h ON r.hospital_id = h.id
           WHERE r.recipient_id = ? ORDER BY r.created_at DESC""",
        (recipient_id,)
    ).fetchall()
    conn.close()
    return rows


def get_requests_by_hospital(hospital_id):
    conn = get_db()
    rows = conn.execute(
        """SELECT r.*, u.name as recipient_name, u.phone as recipient_phone
           FROM blood_requests r JOIN users u ON r.recipient_id = u.id
           WHERE r.hospital_id = ? ORDER BY
           CASE r.urgency WHEN 'critical' THEN 0 WHEN 'urgent' THEN 1 ELSE 2 END,
           r.created_at DESC""",
        (hospital_id,)
    ).fetchall()
    conn.close()
    return rows


def update_request_status(request_id, status, hospital_id=None):
    conn = get_db()
    if hospital_id:
        conn.execute(
            "UPDATE blood_requests SET status=?, hospital_id=?, updated_at=datetime('now') WHERE id=?",
            (status, hospital_id, request_id)
        )
    else:
        conn.execute(
            "UPDATE blood_requests SET status=?, updated_at=datetime('now') WHERE id=?",
            (status, request_id)
        )
    conn.commit()
    conn.close()


def get_all_pending_requests():
    conn = get_db()
    rows = conn.execute(
        """SELECT r.*, u.name as recipient_name, u.phone
           FROM blood_requests r JOIN users u ON r.recipient_id = u.id
           WHERE r.status = 'pending' ORDER BY
           CASE r.urgency WHEN 'critical' THEN 0 WHEN 'urgent' THEN 1 ELSE 2 END,
           r.created_at""",
    ).fetchall()
    conn.close()
    return rows


# ─── Donor Search ─────────────────────────────────────────────────────────────

def get_available_donors(blood_type=None, location=None):
    conn = get_db()
    query = "SELECT * FROM users WHERE role = 'donor' AND is_available = 1"
    params = []
    if blood_type:
        query += " AND blood_type = ?"
        params.append(blood_type)
    if location:
        query += " AND location LIKE ?"
        params.append(f"%{location}%")
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return rows


# ─── Dashboard Stats ──────────────────────────────────────────────────────────

def get_global_stats():
    conn = get_db()
    total_donors = conn.execute("SELECT COUNT(*) FROM users WHERE role='donor'").fetchone()[0]
    total_hospitals = conn.execute("SELECT COUNT(*) FROM hospitals").fetchone()[0]
    total_donations = conn.execute("SELECT COUNT(*) FROM donations WHERE status='completed'").fetchone()[0]
    total_requests = conn.execute("SELECT COUNT(*) FROM blood_requests").fetchone()[0]
    fulfilled = conn.execute("SELECT COUNT(*) FROM blood_requests WHERE status='fulfilled'").fetchone()[0]
    conn.close()
    return {
        'total_donors': total_donors,
        'total_hospitals': total_hospitals,
        'total_donations': total_donations,
        'total_requests': total_requests,
        'fulfilled_requests': fulfilled
    }
