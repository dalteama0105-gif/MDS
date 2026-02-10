<?php
require 'php/db.php';

echo "<h1>Credential Fix Tool</h1>";

try {
    // 1. Reset Admin
    $adminPass = password_hash('admin123', PASSWORD_DEFAULT);
    // Try update first
    $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE username = 'admin'");
    $stmt->execute([$adminPass]);

    if ($stmt->rowCount() == 0) {
        // Did not exist, insert
        $stmt = $pdo->prepare("INSERT INTO users (username, password_hash, role) VALUES ('admin', ?, 'admin')");
        $stmt->execute([$adminPass]);
        echo "Admin account created.<br>";
    } else {
        echo "Admin password reset to 'admin123'.<br>";
    }

    // 2. Reset Standard User
    $userPass = password_hash('user123', PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE username = 'user'");
    $stmt->execute([$userPass]);

    if ($stmt->rowCount() == 0) {
        // Did not exist, insert
        $stmt = $pdo->prepare("INSERT INTO users (username, password_hash, role) VALUES ('user', ?, 'user')");
        $stmt->execute([$userPass]);
        echo "User account created.<br>";
    } else {
        echo "User password reset to 'user123'.<br>";
    }

    echo "<h3><a href='login.html'>Go back to Login</a></h3>";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>