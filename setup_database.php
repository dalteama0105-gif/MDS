<?php
require 'db_config.php';

try {
    // 1. Create Database if not exists
    $pdo->exec("CREATE DATABASE IF NOT EXISTS mds_db");
    $pdo->exec("USE mds_db");

    echo "Database 'mds_db' checked/created successfully.<br>";

    // 2. Create Settings Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS system_settings (
        key_name VARCHAR(50) PRIMARY KEY,
        value_text TEXT,
        description VARCHAR(255)
    )");
    echo "Table 'system_settings' checked/created.<br>";

    // 3. Create Notices Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS notices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    echo "Table 'notices' checked/created.<br>";

    // 4. Insert Default Settings (if not exist)
    $defaults = [
        'header_title' => 'Multimedia Digital Signage (MDS)',
        'banner_title' => 'Welcome',
        'banner_sub' => 'Information Display System',
        'msg_bar_text' => 'Welcome to our Digital Signage System. Please observe safety guidelines at all times.',
        'active_mode' => 'video'
    ];

    foreach ($defaults as $key => $val) {
        // Insert Ignore ensures we don't overwrite user changes on re-run
        $stmt = $pdo->prepare("INSERT IGNORE INTO system_settings (key_name, value_text) VALUES (?, ?)");
        $stmt->execute([$key, $val]);
    }
    echo "Default settings populated.<br>";

    echo "<h3>Setup Complete!</h3>";

} catch (PDOException $e) {
    die("DB Setup Failed: " . $e->getMessage());
}
?>