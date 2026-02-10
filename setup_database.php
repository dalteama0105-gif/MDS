<?php
require 'php/db.php';

try {
    // Create Database if not exists
    $pdo->exec("CREATE DATABASE IF NOT EXISTS mds_db");
    $pdo->exec("USE mds_db");

    // Users Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Layouts/Settings Table
    // Stores JSON blobs for layout config per user
    $pdo->exec("CREATE TABLE IF NOT EXISTS layouts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        preset_slot INT DEFAULT 1,
        config_json JSON,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )");

    // Media Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS media (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(20),
        filename VARCHAR(255),
        original_name VARCHAR(255),
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )");

    // Logs Table (Optional for now but good for 'monitoring')
    $pdo->exec("CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(255),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    echo "Database setup completed successfully.<br>";

    // Check if default admin exists
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ?");
    $stmt->execute(['admin']);
    if ($stmt->fetchColumn() == 0) {
        // Create default admin: admin / admin123
        $pass = password_hash('admin123', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)");
        $stmt->execute(['admin', $pass, 'admin']);
        echo "Default admin account created (admin/admin123).<br>";
    }

} catch (PDOException $e) {
    echo "Setup failed: " . $e->getMessage();
}
?>