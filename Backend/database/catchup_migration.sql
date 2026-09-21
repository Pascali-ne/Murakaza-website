-- Murakaza catch-up migration
-- Safe to run multiple times: every step checks "if it doesn't already exist" first.
-- Adds whatever is still missing for: password reset, mobile money payment methods,
-- payment confirmation tracking, and feedback moderation.

-- 1. Password reset columns on users
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;

-- 2. Make sure payment_method enum has every value the app uses
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'mtn_momo';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'tigo_cash';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'airtel_money';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'irembopay';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'flutterwave';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'bank_transfer';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'cash_on_delivery';

-- 3. Payment tracking columns (confirmed_by/confirmed_at likely already added by you)
ALTER TABLE payments ADD COLUMN IF NOT EXISTS tx_ref VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway_response JSONB;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS confirmed_by INTEGER REFERENCES users(user_id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP;

-- 4. Feedback moderation: enum type (only created if missing) + table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feedback_status') THEN
    CREATE TYPE feedback_status AS ENUM ('visible', 'hidden');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS feedback (
    feedback_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    status feedback_status NOT NULL DEFAULT 'visible',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Employee management: employee role & is_active column
DO $$
BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'employee';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 6. Role delegation and temporary transfer columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS delegated_from_role VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS delegated_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS delegated_by INTEGER REFERENCES users(user_id);