-- IPL Auction Tracker Database Schema
-- Run this script to initialize the database

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS auc_tracker;
USE auc_tracker;

-- Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS teams;

-- Teams table
CREATE TABLE teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  max_purse DECIMAL(10, 2) DEFAULT 100.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Players table
CREATE TABLE players (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  role ENUM('WK', 'Batter', 'Bowler', 'AR') NOT NULL,
  sold_amount DECIMAL(10, 2) NOT NULL,
  team_id INT NOT NULL,
  notes TEXT,
  points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Insert 10 default teams
INSERT INTO teams (name, max_purse) VALUES
  ('Team 1', 100.00),
  ('Team 2', 100.00),
  ('Team 3', 100.00),
  ('Team 4', 100.00),
  ('Team 5', 100.00),
  ('Team 6', 100.00),
  ('Team 7', 100.00),
  ('Team 8', 100.00),
  ('Team 9', 100.00),
  ('Team 10', 100.00);

-- Verify data
SELECT * FROM teams;
