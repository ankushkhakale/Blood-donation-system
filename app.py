from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash
from database import init_db
import models

app = Flask(__name__)
app.secret_key = 'blood-donation-secret-key-2024'

# ─── Flask-Login Setup ─────────────────────────────────────────────────────────

login_manager = LoginManager(app)
login_manager.login_view = 'login'
login_manager.login_message = 'Please log in to access this page.'
login_manager.login_message_category = 'info'


class User(UserMixin):
    def __init__(self, row):
        self.id = row['id']
        self.name = row['name']
        self.email = row['email']
        self.role = row['role']
        self.blood_type = row['blood_type']
        self.location = row['location']
        self.phone = row['phone']
        self.is_available = row['is_available']
        self.created_at = row['created_at']


@login_manager.user_loader
def load_user(user_id):
    row = models.get_user_by_id(int(user_id))
    return User(row) if row else None


# ─── Landing Page ──────────────────────────────────────────────────────────────

@app.route('/')
def index():
    stats = models.get_global_stats()
    return render_template('index.html', stats=stats)


# ─── Authentication ────────────────────────────────────────────────────────────

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        confirm = request.form.get('confirm_password', '')
        role = request.form.get('role', 'donor')
        blood_type = request.form.get('blood_type', '')
        location = request.form.get('location', '').strip()
        phone = request.form.get('phone', '').strip()

        # Validation
        if not all([name, email, password, role]):
            flash('All required fields must be filled.', 'error')
            return render_template('auth/register.html')

        if password != confirm:
            flash('Passwords do not match.', 'error')
            return render_template('auth/register.html')

        if len(password) < 6:
            flash('Password must be at least 6 characters.', 'error')
            return render_template('auth/register.html')

        if models.get_user_by_email(email):
            flash('Email already registered. Please login.', 'error')
            return render_template('auth/register.html')

        # Create user
        user_id = models.create_user(name, email, password, role, blood_type, location, phone)

        # Hospital-specific extra fields
        if role == 'hospital':
            hospital_name = request.form.get('hospital_name', '').strip()
            address = request.form.get('address', '').strip()
            city = request.form.get('city', '').strip()
            if not hospital_name:
                flash('Hospital name is required.', 'error')
                return render_template('auth/register.html')
            models.create_hospital(user_id, hospital_name, address, city)

        flash('Registration successful! Please log in.', 'success')
        return redirect(url_for('login'))

    return render_template('auth/register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        remember = request.form.get('remember', False)

        row = models.get_user_by_email(email)
        if not row or not models.verify_password(row, password):
            flash('Invalid email or password.', 'error')
            return render_template('auth/login.html')

        user = User(row)
        login_user(user, remember=bool(remember))
        flash(f'Welcome back, {user.name}!', 'success')

        next_page = request.args.get('next')
        return redirect(next_page or url_for('dashboard'))

    return render_template('auth/login.html')


@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('index'))


# ─── Dashboard Router ──────────────────────────────────────────────────────────

@app.route('/dashboard')
@login_required
def dashboard():
    if current_user.role == 'hospital':
        return redirect(url_for('hospital_dashboard'))
    elif current_user.role == 'donor':
        return redirect(url_for('donor_dashboard'))
    else:
        return redirect(url_for('recipient_dashboard'))


# ─── Donor Dashboard ───────────────────────────────────────────────────────────

@app.route('/dashboard/donor')
@login_required
def donor_dashboard():
    if current_user.role != 'donor':
        flash('Access denied.', 'error')
        return redirect(url_for('dashboard'))

    donations = models.get_donations_by_donor(current_user.id)
    hospitals = models.get_all_hospitals()
    pending_requests = models.get_all_pending_requests()
    stats = {
        'total_donations': len([d for d in donations if d['status'] == 'completed']),
        'units_donated': sum(d['units'] for d in donations if d['status'] == 'completed'),
        'scheduled': len([d for d in donations if d['status'] == 'scheduled']),
    }
    return render_template('dashboard/donor.html',
                           donations=donations,
                           hospitals=hospitals,
                           pending_requests=pending_requests,
                           stats=stats)


@app.route('/donor/toggle-availability', methods=['POST'])
@login_required
def toggle_availability():
    if current_user.role != 'donor':
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    available = data.get('available', True)
    models.toggle_donor_availability(current_user.id, available)
    return jsonify({'success': True, 'available': available})


@app.route('/donor/schedule-donation', methods=['POST'])
@login_required
def schedule_donation():
    if current_user.role != 'donor':
        flash('Access denied.', 'error')
        return redirect(url_for('dashboard'))

    hospital_id = request.form.get('hospital_id')
    units = int(request.form.get('units', 1))
    status = request.form.get('status', 'scheduled')

    if not hospital_id:
        flash('Please select a hospital.', 'error')
        return redirect(url_for('donor_dashboard'))

    models.record_donation(
        donor_id=current_user.id,
        hospital_id=int(hospital_id),
        blood_type=current_user.blood_type,
        units=units,
        status=status
    )
    msg = 'Donation recorded successfully!' if status == 'completed' else 'Donation scheduled!'
    flash(msg, 'success')
    return redirect(url_for('donor_dashboard'))


@app.route('/donor/profile', methods=['POST'])
@login_required
def update_donor_profile():
    if current_user.role != 'donor':
        return redirect(url_for('dashboard'))

    models.update_user_profile(
        current_user.id,
        request.form.get('name'),
        request.form.get('phone'),
        request.form.get('location'),
        request.form.get('blood_type')
    )
    flash('Profile updated successfully!', 'success')
    return redirect(url_for('donor_dashboard'))


# ─── Hospital Dashboard ────────────────────────────────────────────────────────

@app.route('/dashboard/hospital')
@login_required
def hospital_dashboard():
    if current_user.role != 'hospital':
        flash('Access denied.', 'error')
        return redirect(url_for('dashboard'))

    hospital = models.get_hospital_by_user_id(current_user.id)
    if not hospital:
        flash('Hospital profile not found.', 'error')
        return redirect(url_for('index'))

    inventory = models.get_inventory(hospital['id'])
    requests = models.get_requests_by_hospital(hospital['id'])
    donations = models.get_donations_by_hospital(hospital['id'])
    all_donors = models.get_available_donors()
    stats = {
        'total_inventory': sum(i['units_available'] for i in inventory),
        'pending_requests': len([r for r in requests if r['status'] == 'pending']),
        'total_donations': len(donations),
        'critical_requests': len([r for r in requests if r['urgency'] == 'critical' and r['status'] == 'pending']),
    }
    return render_template('dashboard/hospital.html',
                           hospital=hospital,
                           inventory=inventory,
                           requests=requests,
                           donations=donations,
                           all_donors=all_donors,
                           stats=stats)


@app.route('/hospital/update-request', methods=['POST'])
@login_required
def update_request():
    if current_user.role != 'hospital':
        return jsonify({'error': 'Unauthorized'}), 403

    request_id = request.form.get('request_id')
    status = request.form.get('status')
    hospital = models.get_hospital_by_user_id(current_user.id)

    models.update_request_status(int(request_id), status, hospital['id'])
    flash(f'Request marked as {status}.', 'success')
    return redirect(url_for('hospital_dashboard'))


@app.route('/hospital/add-inventory', methods=['POST'])
@login_required
def add_inventory():
    if current_user.role != 'hospital':
        flash('Access denied.', 'error')
        return redirect(url_for('dashboard'))

    hospital = models.get_hospital_by_user_id(current_user.id)
    blood_type = request.form.get('blood_type')
    units = int(request.form.get('units', 0))

    if units > 0 and blood_type:
        models.update_inventory_manual(hospital['id'], blood_type, units)
        flash(f'Added {units} units of {blood_type} to inventory.', 'success')
    else:
        flash('Invalid input.', 'error')

    return redirect(url_for('hospital_dashboard'))


@app.route('/hospital/record-donation', methods=['POST'])
@login_required
def hospital_record_donation():
    if current_user.role != 'hospital':
        flash('Access denied.', 'error')
        return redirect(url_for('dashboard'))

    hospital = models.get_hospital_by_user_id(current_user.id)
    donor_id = request.form.get('donor_id')
    blood_type = request.form.get('blood_type')
    units = int(request.form.get('units', 1))

    models.record_donation(
        donor_id=int(donor_id),
        hospital_id=hospital['id'],
        blood_type=blood_type,
        units=units,
        status='completed'
    )
    flash('Donation recorded and inventory updated!', 'success')
    return redirect(url_for('hospital_dashboard'))


# ─── Recipient Dashboard ───────────────────────────────────────────────────────

@app.route('/dashboard/recipient')
@login_required
def recipient_dashboard():
    if current_user.role != 'recipient':
        flash('Access denied.', 'error')
        return redirect(url_for('dashboard'))

    my_requests = models.get_requests_by_recipient(current_user.id)
    hospitals = models.get_all_hospitals()
    blood_type_filter = request.args.get('blood_type', '')
    location_filter = request.args.get('location', '')
    available_donors = models.get_available_donors(
        blood_type=blood_type_filter if blood_type_filter else None,
        location=location_filter if location_filter else None
    )
    stats = {
        'total_requests': len(my_requests),
        'pending': len([r for r in my_requests if r['status'] == 'pending']),
        'fulfilled': len([r for r in my_requests if r['status'] == 'fulfilled']),
        'rejected': len([r for r in my_requests if r['status'] == 'rejected']),
    }
    return render_template('dashboard/recipient.html',
                           my_requests=my_requests,
                           hospitals=hospitals,
                           available_donors=available_donors,
                           stats=stats,
                           blood_type_filter=blood_type_filter,
                           location_filter=location_filter)


@app.route('/recipient/request-blood', methods=['POST'])
@login_required
def request_blood():
    if current_user.role != 'recipient':
        flash('Access denied.', 'error')
        return redirect(url_for('dashboard'))

    blood_type = request.form.get('blood_type')
    units = int(request.form.get('units', 1))
    urgency = request.form.get('urgency', 'normal')
    notes = request.form.get('notes', '').strip()
    hospital_id = request.form.get('hospital_id') or None

    if hospital_id:
        hospital_id = int(hospital_id)

    models.create_blood_request(
        recipient_id=current_user.id,
        blood_type=blood_type,
        units=units,
        urgency=urgency,
        notes=notes,
        hospital_id=hospital_id
    )
    flash('Blood request submitted successfully!', 'success')
    return redirect(url_for('recipient_dashboard'))


@app.route('/recipient/cancel-request', methods=['POST'])
@login_required
def cancel_request():
    if current_user.role != 'recipient':
        return jsonify({'error': 'Unauthorized'}), 403

    request_id = int(request.form.get('request_id'))
    models.update_request_status(request_id, 'rejected')
    flash('Request cancelled.', 'info')
    return redirect(url_for('recipient_dashboard'))


# ─── API Endpoints ─────────────────────────────────────────────────────────────

@app.route('/api/donors/search')
def api_search_donors():
    blood_type = request.args.get('blood_type')
    location = request.args.get('location')
    donors = models.get_available_donors(blood_type, location)
    return jsonify([dict(d) for d in donors])


@app.route('/api/stats')
def api_stats():
    return jsonify(models.get_global_stats())


# ─── Main ──────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    init_db()
    print("[APP] Starting Blood Donation App at http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
