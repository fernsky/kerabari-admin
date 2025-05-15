-- Create the population_gender_wise_cbs table if it doesn't exist
CREATE TABLE IF NOT EXISTS population_gender_wise_cbs (
  id VARCHAR(48) PRIMARY KEY NOT NULL,
  ward_no INTEGER,
  total_population INTEGER,
  total_male INTEGER,
  total_female INTEGER
);

-- Clear existing data (optional)
-- TRUNCATE TABLE population_gender_wise_cbs;

-- Insert ward-wise population data
INSERT INTO population_gender_wise_cbs (id, ward_no, total_population, total_male, total_female)
VALUES 
  ('pop_ward_1', 1, 1994, 973, 1021),
  ('pop_ward_2', 2, 2192, 1063, 1129),
  ('pop_ward_3', 3, 3390, 1647, 1743),
  ('pop_ward_4', 4, 1682, 838, 844),
  ('pop_ward_5', 5, 3892, 1839, 2053),
  ('pop_ward_6', 6, 3991, 1924, 2067),
  ('pop_ward_7', 7, 4169, 1967, 2202),
  ('pop_ward_8', 8, 4088, 1925, 2163),
  ('pop_ward_9', 9, 5564, 2576, 2988),
  ('pop_ward_10', 10, 3542, 1663, 1879);
