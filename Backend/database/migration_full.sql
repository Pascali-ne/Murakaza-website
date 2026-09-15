-- 1. Expand roles
ALTER TYPE user_role RENAME TO user_role_old;
CREATE TYPE user_role AS ENUM ('customer', 'cashier', 'storekeeper', 'manager', 'admin');
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
ALTER TABLE users ALTER COLUMN role TYPE user_role USING (
  CASE role::text WHEN 'staff' THEN 'storekeeper' ELSE role::text END
)::user_role;
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'customer';
DROP TYPE user_role_old;

-- 2. Password reset
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;

-- 3. Payment methods + cashier confirmation
ALTER TYPE payment_method RENAME TO payment_method_old;
CREATE TYPE payment_method AS ENUM ('mtn_momo','tigo_cash','airtel_money','irembopay','flutterwave','bank_transfer','cash_on_delivery');
ALTER TABLE orders ALTER COLUMN payment_method TYPE payment_method USING payment_method::text::payment_method;
ALTER TABLE payments ALTER COLUMN payment_method TYPE payment_method USING payment_method::text::payment_method;
DROP TYPE payment_method_old;

ALTER TABLE payments ADD COLUMN IF NOT EXISTS tx_ref VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway_response JSONB;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS confirmed_by INTEGER REFERENCES users(user_id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP;

-- 4. Feedback moderation
CREATE TYPE feedback_status AS ENUM ('visible', 'hidden');
CREATE TABLE IF NOT EXISTS feedback (
    feedback_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    status feedback_status NOT NULL DEFAULT 'visible',
    created_at TIMESTAMP DEFAULT NOW()
);