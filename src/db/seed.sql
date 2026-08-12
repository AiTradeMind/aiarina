-- Seed Data
INSERT INTO roles (name, description) VALUES 
('admin', 'System Administrator'),
('trader', 'Active Trader'),
('analyst', 'Market Analyst')
ON CONFLICT (name) DO NOTHING;

INSERT INTO ai_providers (name, is_active, priority) VALUES
('OpenRouter', true, 1)
ON CONFLICT (name) DO NOTHING;
