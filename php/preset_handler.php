<?php
session_start();
require 'db.php';

// Must be logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];
$action = $_POST['action'] ?? '';

if ($action === 'save') {
    // Save preset
    $slot = intval($_POST['slot'] ?? 1);
    $data = $_POST['data'] ?? '';

    if ($slot < 1 || $slot > 9) {
        echo json_encode(['success' => false, 'message' => 'Invalid slot']);
        exit;
    }

    // Upsert preset (insert or update)
    $stmt = $pdo->prepare("
        INSERT INTO presets (user_id, slot, preset_data, updated_at) 
        VALUES (?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE preset_data = ?, updated_at = NOW()
    ");

    $stmt->execute([$user_id, $slot, $data, $data]);

    echo json_encode(['success' => true, 'message' => "Preset $slot saved"]);

} elseif ($action === 'load') {
    // Load preset
    $slot = intval($_POST['slot'] ?? 1);

    if ($slot < 1 || $slot > 9) {
        echo json_encode(['success' => false, 'message' => 'Invalid slot']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT preset_data FROM presets WHERE user_id = ? AND slot = ?");
    $stmt->execute([$user_id, $slot]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        echo json_encode(['success' => true, 'data' => $row['preset_data']]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Preset is empty']);
    }

} elseif ($action === 'list') {
    // List all saved presets for this user
    $stmt = $pdo->prepare("SELECT slot, updated_at FROM presets WHERE user_id = ? ORDER BY slot");
    $stmt->execute([$user_id]);
    $presets = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'presets' => $presets]);

} else {
    echo json_encode(['success' => false, 'message' => 'Invalid action']);
}
