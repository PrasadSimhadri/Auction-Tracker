-- IPL Auction Tracker Database Schema
-- Run this script to initialize the database

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS auc_tracker;
USE auc_tracker;

-- Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS settings;

-- Settings table for global configurations
CREATE TABLE settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(50) UNIQUE NOT NULL,
  setting_value VARCHAR(255) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Teams table
CREATE TABLE teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  max_purse DECIMAL(10, 2) DEFAULT 100.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Players table (with unsold support)
CREATE TABLE players (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  role ENUM('WK', 'Batter', 'Bowler', 'AR') NOT NULL,
  sold_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  team_id INT,
  notes TEXT,
  points INT DEFAULT 0,
  is_unsold BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);

-- Insert default settings
INSERT INTO settings (setting_key, setting_value) VALUES
  ('max_purse', '100');

-- Insert 10 IPL-style teams
INSERT INTO teams (name, max_purse) VALUES
  ('Chennai Super Kings', 100.00),
  ('Mumbai Indians', 100.00),
  ('Royal Challengers', 100.00),
  ('Kolkata Knight Riders', 100.00),
  ('Delhi Capitals', 100.00),
  ('Rajasthan Royals', 100.00),
  ('Punjab Kings', 100.00),
  ('Sunrisers Hyderabad', 100.00),
  ('Gujarat Titans', 100.00),
  ('Lucknow Super Giants', 100.00);

-- Verify data
SELECT * FROM teams;
SELECT * FROM settings;
