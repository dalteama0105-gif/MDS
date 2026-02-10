<?php
session_start();
require 'db.php';

header('Content-Type: application/json');

// Security Check
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized Access']);
    exit;
}

$action = $_GET['action'] ?? '';

// GET USERS
if ($action === 'get_users') {
    try {
        // Prepare list
        $stmt = $pdo->query("SELECT id, username, role, created_at FROM users ORDER BY created_at DESC");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'data' => $users]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ADD USER
elseif ($action === 'add_user' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $username = trim($data['username'] ?? '');
    $password = $data['password'] ?? '';
    // Role is optional, default to user. Only allow creating 'user' or 'admin'
    $role = $data['role'] ?? 'user';

    if (empty($username) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Username and password required']);
        exit;
    }

    try {
        // hash password
        $hash = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $pdo->prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)");
        $stmt->execute([$username, $hash, $role]);

        echo json_encode(['success' => true, 'message' => 'User created successfully']);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // Integrity constraint violation (duplicate entry)
            echo json_encode(['success' => false, 'message' => 'Username already exists']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Database error']);
        }
    }
}

// DELETE USER
elseif ($action === 'delete_user' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? 0;

    // Prevent deleting self
    if ($id == $_SESSION['user_id']) {
        echo json_encode(['success' => false, 'message' => 'Cannot delete yourself']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'User deleted']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid action']);
}
