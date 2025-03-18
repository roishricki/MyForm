
-- Plans Table
CREATE TABLE IF NOT EXISTS plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    monthly_price NUMERIC NOT NULL,
    yearly_price NUMERIC NOT NULL,
    icon_path VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add-ons Table
CREATE TABLE IF NOT EXISTS addons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    monthly_price NUMERIC NOT NULL,
    yearly_price NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    plan_id INTEGER NOT NULL REFERENCES plans(id),
    is_yearly BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscription Add-ons Table (for many-to-many relationship)
CREATE TABLE IF NOT EXISTS subscription_addons (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER NOT NULL REFERENCES subscriptions(id),
    addon_id INTEGER NOT NULL REFERENCES addons(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(subscription_id, addon_id)
);

-- App Config Table
CREATE TABLE IF NOT EXISTS app_config (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT NOT NULL
);


DELETE FROM subscription_addons;
DELETE FROM subscriptions;
DELETE FROM users;
DELETE FROM plans;
DELETE FROM addons;


INSERT INTO app_config (key, value) VALUES ('default_plan_id', '1');

INSERT INTO plans (name, description, monthly_price, yearly_price, icon_path) VALUES
('Arcade', 'Basic gaming plan', 9, 90, '/assets/icon-arcade.svg'),
('Advanced', 'More features for serious gamers', 12, 120, '/assets/icon-advanced.svg'),
('Pro', 'Premium experience with all features', 15, 150, '/assets/icon-pro.svg');

INSERT INTO addons (name, description, monthly_price, yearly_price) VALUES
('Online service', 'Access to multiplayer games', 1, 10),
('Larger storage', 'Extra 1TB of cloud save', 2, 20),
('Customizable profile', 'Custom theme on your profile', 2, 20);