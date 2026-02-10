<?php
session_start();
require 'db.php';

// JSON Response header
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$userId = $_SESSION['user_id'];
$targetDir = "../uploads/user_" . $userId . "/";

// Create dir if not exists
if (!is_dir($targetDir)) {
    mkdir($targetDir, 0755, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['mediaFile'])) {
    $file = $_FILES['mediaFile'];
    $fileName = basename($file['name']);
    $targetFile = $targetDir . $fileName;
    $fileType = strtolower(pathinfo($targetFile, PATHINFO_EXTENSION));

    // Validation
    $allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm', 'pdf']; // PPT usually converted to PDF for browser display
    if (!in_array($fileType, $allowedTypes)) {
        echo json_encode(['success' => false, 'message' => 'Invalid file type. Allowed: jpg, png, mp4, webm, pdf']);
        exit;
    }

    // Check size (Max 50MB)
    if ($file['size'] > 50 * 1024 * 1024) {
        echo json_encode(['success' => false, 'message' => 'File too large (Max 50MB)']);
        exit;
    }

    if (move_uploaded_file($file['tmp_name'], $targetFile)) {
        // Return public path
        $publicPath = "uploads/user_" . $userId . "/" . $fileName;
        echo json_encode([
            'success' => true,
            'message' => 'Upload successful',
            'file_path' => $publicPath,
            'file_name' => $fileName,
            'type' => $fileType
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error saving file']);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // List files
    $files = scandir($targetDir);
    $output = [];
    foreach ($files as $f) {
        if ($f !== '.' && $f !== '..') {
            $output[] = [
                'name' => $f,
                'path' => "uploads/user_" . $userId . "/" . $f
            ];
        }
    }
    echo json_encode(['success' => true, 'files' => $output]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid Request']);
}
