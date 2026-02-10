-- Add presets table to database
CREATE TABLE IF NOT EXISTS presets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    slot INT NOT NULL,
    preset_data TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_slot (user_id, slot),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
