<?php
$host = 'localhost';
$db = 'mds_db';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    // If database doesn't exist, we might be in setup mode
    if (strpos($e->getMessage(), "Unknown database") !== false) {
        $dsn_no_db = "mysql:host=$host;charset=$charset";
        try {
            $pdo = new PDO($dsn_no_db, $user, $pass, $options);
        } catch (\PDOException $e2) {
            die("Database connection failed (No DB): " . $e2->getMessage());
        }
    } else {
        die("Database connection failed (Main): " . $e->getMessage());
    }
}
?>