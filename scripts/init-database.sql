-- BloodLink Database Schema
-- Create all tables and enable Realtime

-- Create donors table
CREATE TABLE IF NOT EXISTS donors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  city VARCHAR(100) NOT NULL,
  blood_group VARCHAR(10) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  last_donated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create hospitals table
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  city VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create blood_stock table
CREATE TABLE IF NOT EXISTS blood_stock (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  blood_group VARCHAR(10) NOT NULL,
  units_available INT DEFAULT 0,
  critical_level INT DEFAULT 2,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(hospital_id, blood_group)
);

-- Create emergency_requests table
CREATE TABLE IF NOT EXISTS emergency_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  blood_group VARCHAR(10) NOT NULL,
  units_required INT NOT NULL,
  urgency_level VARCHAR(20) DEFAULT 'high',
  status VARCHAR(20) DEFAULT 'active',
  requested_at TIMESTAMP DEFAULT NOW(),
  fulfilled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Realtime on critical tables
ALTER PUBLICATION supabase_realtime ADD TABLE blood_stock;
ALTER PUBLICATION supabase_realtime ADD TABLE emergency_requests;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_donors_blood_group ON donors(blood_group);
CREATE INDEX IF NOT EXISTS idx_donors_is_available ON donors(is_available);
CREATE INDEX IF NOT EXISTS idx_blood_stock_hospital ON blood_stock(hospital_id);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_hospital ON emergency_requests(hospital_id);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_status ON emergency_requests(status);

-- Seed initial hospitals
INSERT INTO hospitals (name, city, phone, address) VALUES
  ('Central Medical Hospital', 'New York', '212-555-0100', '123 Main St, NY'),
  ('Metro Health Center', 'Los Angeles', '310-555-0200', '456 Oak Ave, LA'),
  ('Community Care Hospital', 'Chicago', '312-555-0300', '789 Pine Rd, Chicago'),
  ('St. Mary Hospital', 'Houston', '713-555-0400', '321 Elm Blvd, Houston'),
  ('Highland Medical Center', 'Phoenix', '602-555-0500', '654 Cedar Ln, Phoenix')
ON CONFLICT DO NOTHING;

-- Seed initial blood stock for all hospitals
INSERT INTO blood_stock (hospital_id, blood_group, units_available) 
SELECT h.id, bg.blood_group, (RANDOM() * 20 + 5)::INT
FROM hospitals h
CROSS JOIN (
  VALUES ('A+'), ('A-'), ('B+'), ('B-'), ('AB+'), ('AB-'), ('O+'), ('O-')
) AS bg(blood_group)
ON CONFLICT (hospital_id, blood_group) DO UPDATE
SET units_available = (RANDOM() * 20 + 5)::INT;

-- Seed initial donors
INSERT INTO donors (name, phone, city, blood_group, is_available) VALUES
  ('John Smith', '212-555-1001', 'New York', 'O+', true),
  ('Mary Johnson', '310-555-1002', 'Los Angeles', 'A+', true),
  ('Robert Williams', '312-555-1003', 'Chicago', 'B+', false),
  ('Patricia Brown', '713-555-1004', 'Houston', 'AB+', true),
  ('Michael Davis', '602-555-1005', 'Phoenix', 'O-', true),
  ('Jennifer Garcia', '212-555-1006', 'New York', 'A-', true),
  ('David Miller', '310-555-1007', 'Los Angeles', 'B-', true),
  ('Linda Rodriguez', '312-555-1008', 'Chicago', 'AB-', false),
  ('James Martinez', '713-555-1009', 'Houston', 'O+', true),
  ('Barbara Lopez', '602-555-1010', 'Phoenix', 'A+', true)
ON CONFLICT DO NOTHING;
