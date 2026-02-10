<?php
session_start();
header('Content-Type: application/json');

require 'db.php'; // Assumes db.php sets up $pdo

$action = $_GET['action'] ?? '';

// Helper to send JSON response
function jsonResponse($success, $message, $data = [])
{
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $data));
    exit;
}

// 1. LOGIN
if ($action === 'login') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(false, 'Invalid request method');
    }

    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        jsonResponse(false, 'Username and password required');
    }

    try {
        $stmt = $pdo->prepare("SELECT id, username, password_hash, role FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            // Success
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];

            // Determine redirect
            $redirect = ($user['role'] === 'admin') ? 'admin.php' : 'display.php';

            jsonResponse(true, 'Login successful', ['redirect' => $redirect, 'role' => $user['role']]);
        } else {
            jsonResponse(false, 'Invalid credentials');
        }
    } catch (PDOException $e) {
        jsonResponse(false, 'Database error: ' . $e->getMessage());
    }
}

// 2. CHECK SESSION (For frontend guards)
if ($action === 'check') {
    if (isset($_SESSION['user_id'])) {
        jsonResponse(true, 'Authenticated', [
            'username' => $_SESSION['username'],
            'role' => $_SESSION['role']
        ]);
    } else {
        jsonResponse(false, 'Not authenticated');
    }
}

// 3. LOGOUT
if ($action === 'logout') {
    session_destroy();
    jsonResponse(true, 'Logged out', ['redirect' => 'login.html']);
}

// Default
jsonResponse(false, 'Invalid action');
?>