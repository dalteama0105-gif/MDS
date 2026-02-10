<?php
// MDS System Health Check & Landing Page
session_start();

// Suppress errors for initial DB check
$dbStatus = 'DISCONNECTED';
$dbLatency = null;
$userCount = 0;

try {
    // Try to connect manually to avoid issues if db.php fails
    $host = 'localhost';
    $user = 'root';
    $pass = '';
    $dbname = 'mds_db';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $start = microtime(true);
    $stmt = $pdo->query("SELECT 1");
    $dbLatency = round((microtime(true) - $start) * 1000, 2);
    $dbStatus = 'CONNECTED';
    
    // Get user count
    $stmt = $pdo->query("SELECT COUNT(*) FROM users");
    $userCount = $stmt->fetchColumn();
} catch (Exception $e) {
    $dbStatus = 'ERROR';
}

// System Checks
$phpVersion = phpversion();
$pdoInstalled = extension_loaded('pdo_mysql');

// File checks
$loginExists = file_exists('login.html');
$displayExists = file_exists('display.php');
$adminExists = file_exists('admin.php');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MDS - Multimedia Digital Signage</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
            color: #ecf0f1;
            min-height: 100vh;
            padding: 2rem;
            position: relative;
            overflow-x: hidden;
        }

        /* Animated Background */
        body::before {
            content: '';
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: 
                radial-gradient(circle at 20% 50%, rgba(0, 206, 201, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(52, 152, 219, 0.1) 0%, transparent 50%);
            z-index: -1;
            animation: bgPulse 10s ease-in-out infinite;
        }

        @keyframes bgPulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
        }

        .container { 
            max-width: 1200px; 
            margin: 0 auto;
            position: relative;
            z-index: 1;
        }

        /* Header */
        .header {
            text-align: center;
            margin-bottom: 3rem;
            animation: slideDown 0.6s ease;
        }

        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .logo {
            font-size: 3rem;
            font-weight: 700;
            background: linear-gradient(135deg, #00cec9 0%, #3498db 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 0.5rem;
        }

        .tagline {
            color: #95a5a6;
            font-size: 1.1rem;
            font-weight: 400;
        }

        /* Grid Layout */
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        /* Cards */
        .card {
            background: rgba(26, 26, 26, 0.8);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 1.5rem;
            transition: all 0.3s ease;
            animation: fadeInUp 0.6s ease forwards;
            opacity: 0;
        }

        .card:nth-child(1) { animation-delay: 0.1s; }
        .card:nth-child(2) { animation-delay: 0.2s; }
        .card:nth-child(3) { animation-delay: 0.3s; }
        .card:nth-child(4) { animation-delay: 0.4s; }

        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .card:hover {
            transform: translateY(-5px);
            border-color: rgba(0, 206, 201, 0.5);
            box-shadow: 0 10px 30px rgba(0, 206, 201, 0.2);
        }

        .card-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 1rem;
        }

        .card-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #00cec9, #3498db);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
        }

        .card-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #fff;
        }

        .card-content {
            color: #bdc3c7;
            line-height: 1.8;
        }

        .stat {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .stat:last-child { border-bottom: none; }

        .stat-label { color: #95a5a6; }
        .stat-value { 
            font-weight: 600;
            color: #ecf0f1;
        }

        .status-ok { color: #2ecc71 !important; }
        .status-error { color: #e74c3c !important; }
        .status-warning { color: #f39c12 !important; }

        /* Action Buttons */
        .actions {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 2rem;
        }

        .btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            border: 2px solid;
            position: relative;
            overflow: hidden;
        }

        .btn::before {
            content: '';
            position: absolute;
            top: 50%; left: 50%;
            width: 0; height: 0;
            border-radius: 50%;
            background: rgba(255,255,255,0.1);
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
        }

        .btn:hover::before {
            width: 300px;
            height: 300px;
        }

        .btn span { position: relative; z-index: 1; }

        .btn-primary {
            background: linear-gradient(135deg, #00cec9, #0984e3);
            border-color: #00cec9;
            color: #fff;
        }

        .btn-secondary {
            background: transparent;
            border-color: #7f8c8d;
            color: #ecf0f1;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(0, 206, 201, 0.4);
        }

        .footer {
            text-align: center;
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid rgba(255,255,255,0.1);
            color: #7f8c8d;
            font-size: 0.9rem;
        }

        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .badge-success { background: rgba(46, 204, 113, 0.2); color: #2ecc71; }
        .badge-danger { background: rgba(231, 76, 60, 0.2); color: #e74c3c; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">MDS Platform</div>
            <div class="tagline">Multimedia Digital Signage System</div>
        </div>

        <!-- System Status Grid -->
        <div class="grid">
            <!-- Environment Card -->
            <div class="card">
                <div class="card-header">
                    <div class="card-icon">⚙️</div>
                    <div class="card-title">Environment</div>
                </div>
                <div class="card-content">
                    <div class="stat">
                        <span class="stat-label">PHP Version</span>
                        <span class="stat-value"><?php echo $phpVersion; ?></span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">PDO MySQL</span>
                        <span class="stat-value <?php echo $pdoInstalled ? 'status-ok' : 'status-error'; ?>">
                            <?php echo $pdoInstalled ? '✓ Installed' : '✗ Missing'; ?>
                        </span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Server Time</span>
                        <span class="stat-value"><?php echo date('H:i:s'); ?></span>
                    </div>
                </div>
            </div>

            <!-- Database Card -->
            <div class="card">
                <div class="card-header">
                    <div class="card-icon">🗄️</div>
                    <div class="card-title">Database</div>
                </div>
                <div class="card-content">
                    <div class="stat">
                        <span class="stat-label">Connection</span>
                        <span class="stat-value <?php echo ($dbStatus === 'CONNECTED') ? 'status-ok' : 'status-error'; ?>">
                            <?php echo $dbStatus === 'CONNECTED' ? '✓ Connected' : '✗ ' . $dbStatus; ?>
                        </span>
                    </div>
                    <?php if($dbLatency): ?>
                    <div class="stat">
                        <span class="stat-label">Latency</span>
                        <span class="stat-value"><?php echo $dbLatency; ?> ms</span>
                    </div>
                    <?php endif; ?>
                    <div class="stat">
                        <span class="stat-label">Total Users</span>
                        <span class="stat-value"><?php echo $userCount; ?></span>
                    </div>
                </div>
            </div>

            <!-- Application Card -->
            <div class="card">
                <div class="card-header">
                    <div class="card-icon">📱</div>
                    <div class="card-title">Application</div>
                </div>
                <div class="card-content">
                    <div class="stat">
                        <span class="stat-label">Login Page</span>
                        <span class="stat-value"><?php echo $loginExists ? '<span class="badge badge-success">Ready</span>' : '<span class="badge badge-danger">Missing</span>'; ?></span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Display Page</span>
                        <span class="stat-value"><?php echo $displayExists ? '<span class="badge badge-success">Ready</span>' : '<span class="badge badge-danger">Missing</span>'; ?></span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Admin Panel</span>
                        <span class="stat-value"><?php echo $adminExists ? '<span class="badge badge-success">Ready</span>' : '<span class="badge badge-danger">Missing</span>'; ?></span>
                    </div>
                </div>
            </div>

            <!-- Quick Info Card -->
            <div class="card">
                <div class="card-header">
                    <div class="card-icon">ℹ️</div>
                    <div class="card-title">Quick Info</div>
                </div>
                <div class="card-content">
                    <div class="stat">
                        <span class="stat-label">Version</span>
                        <span class="stat-value">v1.0.0-beta</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Status</span>
                        <span class="stat-value status-ok">✓ Operational</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Session</span>
                        <span class="stat-value"><?php echo isset($_SESSION['user_id']) ? 'Active' : 'Guest'; ?></span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="actions">
            <?php if($loginExists): ?>
                <a href="login.html" class="btn btn-primary">
                    <span>🔐 Login</span>
                </a>
            <?php endif; ?>
            
            <?php if($displayExists && isset($_SESSION['user_id'])): ?>
                <a href="display.php" class="btn btn-primary">
                    <span>📺 Go to Display</span>
                </a>
            <?php endif; ?>

            <?php if($adminExists && isset($_SESSION['role']) && $_SESSION['role'] === 'admin'): ?>
                <a href="admin.php" class="btn btn-secondary">
                    <span>⚡ Admin Panel</span>
                </a>
            <?php endif; ?>

            <a href="setup_database.php" class="btn btn-secondary">
                <span>🔧 Setup Database</span>
            </a>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>&copy; <?php echo date('Y'); ?> Multimedia Digital Signage Platform. All rights reserved.</p>
            <p style="margin-top: 0.5rem; font-size: 0.8rem;">Built with PHP <?php echo $phpVersion; ?> & MySQL</p>
        </div>
    </div>
</body>
</html>