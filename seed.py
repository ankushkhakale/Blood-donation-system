"""
Seed script: Creates demo accounts for testing all 3 roles.
Run once: python seed.py
"""
from database import init_db, get_db
import models

def seed():
    init_db()
    print("[SEED] Initializing database...")

    # Create demo donor
    if not models.get_user_by_email('donor@test.com'):
        uid = models.create_user('Rahul Sharma', 'donor@test.com', '123456', 'donor', 'O+', 'Nashik', '9876543210')
        print(f"[SEED] Created donor: donor@test.com (id={uid})")

    # Create demo recipient  
    if not models.get_user_by_email('recipient@test.com'):
        uid = models.create_user('Priya Sharma', 'recipient@test.com', '123456', 'recipient', 'A+', 'Pune', '9988776655')
        print(f"[SEED] Created recipient: recipient@test.com (id={uid})")

    # Create demo hospital
    if not models.get_user_by_email('hospital@test.com'):
        uid = models.create_user('Admin', 'hospital@test.com', '123456', 'hospital', None, 'Nashik', '0253-1234567')
        hosp_id = models.create_hospital(uid, 'Nashik Civil Hospital', 'Civil Hospital Road', 'Nashik')
        # Seed some inventory
        conn = get_db()
        inventory_data = [('A+', 12), ('A-', 5), ('B+', 8), ('B-', 3), ('AB+', 4), ('AB-', 1), ('O+', 15), ('O-', 7)]
        for bt, units in inventory_data:
            conn.execute(
                "UPDATE inventory SET units_available = ? WHERE hospital_id = ? AND blood_type = ?",
                (units, hosp_id, bt)
            )
        conn.commit()
        conn.close()
        print(f"[SEED] Created hospital: hospital@test.com (id={uid}, hosp_id={hosp_id})")

    # Create a second donor
    if not models.get_user_by_email('donor2@test.com'):
        uid = models.create_user('Amit Patil', 'donor2@test.com', '123456', 'donor', 'B+', 'Nashik', '9112233445')
        print(f"[SEED] Created donor2: donor2@test.com (id={uid})")

    print("[SEED] ✅ Demo accounts created successfully!")
    print("\n  Login credentials:")
    print("  Donor:     donor@test.com / 123456")
    print("  Hospital:  hospital@test.com / 123456")
    print("  Recipient: recipient@test.com / 123456")

if __name__ == '__main__':
    seed()
