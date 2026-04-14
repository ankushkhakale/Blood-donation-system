# 🩸 Blood Donation System

A modern, aesthetic, and fully functional Blood Donation Management System built with **Flask** and **SQLite**. This platform connects blood donors, recipients, and hospitals in a seamless ecosystem with automated inventory management and request fulfillment.

---

## 🌟 Key Features

### 💉 For Blood Donors
- **Personal Dashboard**: Track your donation history and impact.
- **Availability Toggle**: Let hospitals and recipients know when you're ready to help.
- **Easy Scheduling**: Book donation visits at your preferred local hospitals.

### 🏥 For Hospitals
- **Inventory Management**: Real-time tracking of blood stock across all blood types.
- **Request Handling**: Review and fulfill blood requests from recipients.
- **Donor Logging**: Record physical donor visits to automatically update inventory levels.

### 🏨 For Recipients
- **Urgent Requests**: Post blood requests with urgency levels (Normal, Urgent, Critical).
- **Donor Search**: Find available donors in your city with specific blood types.
- **Request Tracking**: Monitor the status of your requests as they get fulfilled by hospitals.

---

## 🛠️ Tech Stack

- **Backend**: Python / Flask
- **Database**: SQLite (with advanced SQL Triggers for automation)
- **Frontend**: HTML5, CSS3 (Custom Dark Theme), Vanilla JavaScript
- **Auth**: Flask-Login

---

## 🚀 Quick Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ankushkhakale/Blood-donation-system.git
   cd Blood-donation-system
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Initialize the database & Seed demo data**:
   ```bash
   python seed.py
   ```

4. **Run the application**:
   ```bash
   python app.py
   ```
   The app will be available at `http://127.0.0.1:5000`.
---

## 📦 Project Structure

- `app.py`: Main application routes and logic.
- `database.py`: Database initialization and schema definitions.
- `models.py`: Helper functions for database operations.
- `seed.py`: Script to populate the database with initial demo data.
- `static/`: CSS styling and client-side scripts.
- `templates/`: Jinja2 templates for the multi-role dashboard system.

---

## 🛡️ License
Distributed under the MIT License.
