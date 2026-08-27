-- MURAKAZA WEBSITE DATABASE SCHEMA
-- Run with: psql -U postgres -d murakaza_db -f schema.sql

CREATE TYPE user_role AS ENUM ('customer', 'admin', 'staff');
CREATE TYPE product_category AS ENUM ('student_supplies', 'office_equipment', 'other_services');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'delivered', 'cancelled');
CREATE TYPE payment_method AS ENUM ('mtn_momo', 'airtel_money', 'bank_transfer', 'cash_on_delivery');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- 11.1 Users
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(30) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 11.2 Products
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category product_category NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 11.3 Orders
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    total_price NUMERIC(10,2) NOT NULL,
    payment_method payment_method NOT NULL,
    order_status order_status NOT NULL DEFAULT 'pending',
    delivery_address TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Order items (which products belong to which order)
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(product_id),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL
);

-- 11.4 Payments
CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
    payment_method payment_method NOT NULL,
    payment_status payment_status NOT NULL DEFAULT 'pending',
    amount NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Contact / Other Services requests (Section 7.7)
CREATE TABLE service_requests (
    request_id SERIAL PRIMARY KEY,
    customer_name VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(30),
    service_type VARCHAR(100),
    message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sample data to test with
INSERT INTO products (name, category, price, quantity, description, image_url) VALUES
('Exercise Book (A4)', 'student_supplies', 500, 200, 'A4 size exercise book, 96 pages', ''),
('Mathematical Set', 'student_supplies', 2500, 80, 'Complete geometry set with compass and rulers', ''),
('School Bag', 'student_supplies', 15000, 40, 'Durable school backpack', ''),
('Office Chair', 'office_equipment', 45000, 15, 'Adjustable ergonomic office chair', ''),
('HP LaserJet Printer', 'office_equipment', 180000, 5, 'Black and white laser printer', ''),
('Flash Drive 32GB', 'office_equipment', 8000, 60, 'USB 3.0 flash drive', ''),
('Photocopy Service', 'other_services', 50, 1000, 'Per page black and white photocopy', ''),
('Passport Photo Printing', 'other_services', 1000, 1000, 'Set of passport-size photos', '');