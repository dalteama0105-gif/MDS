<?php
session_start();
// Redirect if not logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MDS Display - <?php echo htmlspecialchars($_SESSION['username']); ?></title>

    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=JetBrains+Mono:wght@500&display=swap"
        rel="stylesheet">

    <!-- Styles -->
    <link rel="stylesheet" href="assets/css/base.css">
    <link rel="stylesheet" href="assets/css/display.css">
    <link rel="stylesheet" href="assets/css/control_panel.css">
</head>

<body>

    <div class="mds-grid">
        <!-- 1. Header Zone -->
        <div id="header-zone" class="zone">
            <div id="header-logo">Multimedia Digital Signage</div>
        </div>

        <!-- 2. Main Display Zone -->
        <div id="main-zone" class="zone">
            <!-- Mode: Video (Default) -->
            <video id="view-video" class="content-wrapper active-mode" autoplay loop controls
                style="width:100%; height:100%; object-fit:contain;">
                <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm"
                    type="video/webm">
                Your browser does not support video.
            </video>

            <!-- Mode: Website (Iframe) -->
            <iframe id="view-website" class="content-wrapper hidden-mode" src="about:blank"
                sandbox="allow-scripts allow-same-origin allow-forms"></iframe>

            <!-- Mode: Text/Announcement -->
            <div id="view-text" class="content-wrapper hidden-mode flex-center"
                style="font-size: 4rem; text-align: center; padding: 2rem;">
                <!-- JS will inject text here -->
            </div>

            <!-- Mode: Camera -->
            <video id="view-camera" class="content-wrapper hidden-mode" autoplay muted
                style="transform: scaleX(-1);"></video>

            <!-- Mode: Slideshow -->
            <div id="view-slides" class="content-wrapper hidden-mode"
                style="background-size: cover; background-position: center;"></div>
        </div>

        <!-- 3. Sidebar Zone -->
        <div id="sidebar-zone">
            <div id="sidebar-image" class="zone">
                <img src="https://images.unsplash.com/photo-1516387938699-a93567ec168e?q=80&w=600&auto=format&fit=crop"
                    style="width:100%; height:100%; object-fit:cover;" alt="Promo">
            </div>
            <div id="sidebar-notices" class="zone">
                <div class="notice-item">
                    <div class="notice-title">System Maintenance</div>
                    <div class="notice-body">Scheduled maintenance on Feb 10, 2024 from 2:00 AM - 4:00 AM.</div>
                </div>
                <div class="notice-item">
                    <div class="notice-title">Staff Meeting</div>
                    <div class="notice-body">All team leads are requested to attend the quarterly review meeting.
                    </div>
                </div>
                <div class="notice-item">
                    <div class="notice-title">Team Meeting</div>
                    <div class="notice-body">Marketing team meeting scheduled for tomorrow at 10 AM in Room 305.
                    </div>
                </div>
                <div class="notice-item">
                    <div class="notice-title">Holiday Notice</div>
                    <div class="notice-body">Office will be closed on Feb 15 for public holiday celebration.</div>
                </div>
            </div>
        </div>

        <!-- 4. Banner Zone -->
        <div id="banner-zone" class="zone" style="
            background: linear-gradient(135deg, #00cec9 0%, #0984e3 50%, #6c5ce7 100%);
            padding: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
        ">
            <h2 style="
                color: white;
                font-size: 2rem;
                font-weight: 700;
                text-shadow: 0 2px 10px rgba(0,0,0,0.3);
                margin: 0;
            ">🚀 DIGITAL INNOVATION - Powering the Future</h2>
        </div>

        <!-- 5. Message Board (Ticker) Zone -->
        <div id="message-board-zone" class="zone">
            <div id="ticker-zone" class="ticker-wrap">
                <div class="ticker-move" id="ticker-content">
                    <span class="ticker-item">BREAKING: Welcome to the new Multimedia Digital Signage System.</span>
                    <span class="ticker-item">REMINDER: Staff meeting at 3 PM in Conference Room B.</span>
                    <span class="ticker-item">NEWS: Global stocks rally as tech sector booms.</span>
                </div>
            </div>
        </div>

        <!-- 6. Footer Zone -->
        <div id="footer-zone" class="zone">
            <div id="greeting" class="footer-section" style="color: #888; font-size: 0.9rem;">Good Evening</div>

            <div id="copyright-display" class="footer-section">
                &copy; <?php echo date("Y"); ?> Multimedia Digital Signage Sdn. Bhd.
            </div>

            <div style="display: flex; gap: 2rem;" class="footer-section">
                <div id="date-display">00/00/0000</div>
                <div id="clock-display">00:00:00</div>
            </div>
        </div>
    </div>

    <!-- CONTROL PANEL OVERLAY (Hidden by default, Toggle with Alt+C) -->
    <div id="control-panel" class="hidden">
        <div class="panel-content">
            <div class="panel-header">
                <div class="panel-title">Control Panel</div>
                <div style="display: flex; gap: 15px; align-items: center;">
                    <div id="panel-clock-display"
                        style="font-family: monospace; color: var(--accent); font-weight: bold;">--:--:--</div>
                    <span style="color: #666; font-size: 1.2rem;">|</span>
                    <div class="panel-status">User: <?php echo htmlspecialchars($_SESSION['username']); ?></div>
                </div>
            </div>

            <!-- TABS NAVIGATION -->
            <div class="panel-tabs">
                <button class="tab-btn active" onclick="mds.switchTab('modes')">Display Modes</button>
                <button class="tab-btn" onclick="mds.switchTab('content')">Edit Content</button>
                <button class="tab-btn" onclick="mds.switchTab('media')">My Media</button>
                <button class="tab-btn" onclick="mds.switchTab('presets')">Presets</button>
                <button class="tab-btn" onclick="mds.switchTab('system')">System</button>
            </div>

            <!-- TAB 1: MODES -->
            <div id="tab-modes" class="tab-content active">
                <div class="grid-controls">
                    <!-- Mode Switchers -->
                    <div class="control-card" onclick="window.changeMode('video')">
                        <h3>Video Mode</h3>
                        <p>Play standard loop</p>
                    </div>
                    <div class="control-card" onclick="mds.toggleInput('website')">
                        <h3>Website Mode</h3>
                        <p>Embed external URL</p>
                        <div class="input-row hidden" id="input-website" onclick="event.stopPropagation()">
                            <input type="text" class="input-dark" id="val-website" placeholder="https://example.com"
                                value="https://en.wikipedia.org">
                            <button class="btn-action" onclick="mds.submitMode('website')">GO</button>
                        </div>
                    </div>
                    <div class="control-card" onclick="mds.toggleInput('text')">
                        <h3>Text Mode</h3>
                        <p>Show announcement</p>
                        <div class="input-row hidden" id="input-text" onclick="event.stopPropagation()"
                            style="flex-direction: column; align-items: stretch;">
                            <textarea class="input-dark" id="val-text" placeholder="Enter Message" rows="3"
                                style="width: 100%; margin-bottom: 5px; resize: vertical;">HELLO WORLD</textarea>
                            <button class="btn-action" onclick="mds.submitMode('text')">GO</button>
                        </div>
                    </div>
                    <div class="control-card" onclick="window.changeMode('camera')">
                        <h3>Camera Mode</h3>
                        <p>Live feed (Mirror)</p>
                    </div>
                </div>
            </div>

            <!-- TAB 2: CONTENT EDITOR (REFACTORED) -->
            <div id="tab-content" class="tab-content">
                <!-- Sub-Navigation for "Folders/Pages" -->
                <div class="content-subnav"
                    style="display: flex; gap: 10px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 5px;">
                    <button class="subtab-btn active" onclick="mds.switchContentPage('header')">Header</button>
                    <button class="subtab-btn" onclick="mds.switchContentPage('banner')">Banner</button>
                    <button class="subtab-btn" onclick="mds.switchContentPage('ticker')">Message Board</button>
                    <button class="subtab-btn" onclick="mds.switchContentPage('notice')">Sidebar Notice</button>
                    <button class="subtab-btn" onclick="mds.switchContentPage('text')">Quick Announce</button>
                </div>

                <!-- PAGE: Header -->
                <div id="page-header" class="content-page active">
                    <div
                        style="background: rgba(255,255,255,0.05); padding: 15px; border-radius:8px; border:1px solid rgba(255,255,255,0.1);">

                        <!-- Header Mode Switch -->
                        <div
                            style="margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px;">
                            <label style="font-size:0.8rem; color:#aaa; display:block; margin-bottom:10px;">Header
                                Mode</label>
                            <div style="display:flex; gap:15px;">
                                <label style="display:flex; align-items:center; cursor:pointer;">
                                    <input type="radio" name="header-mode" value="standard" checked
                                        onchange="mds.setHeaderMode('standard')" style="margin-right:8px;">
                                    <span style="color:#ddd; font-size:0.9rem;">Text + Background</span>
                                </label>
                                <label style="display:flex; align-items:center; cursor:pointer;">
                                    <input type="radio" name="header-mode" value="image-only"
                                        onchange="mds.setHeaderMode('image-only')" style="margin-right:8px;">
                                    <span style="color:#ddd; font-size:0.9rem;">Image/GIF Only</span>
                                </label>
                            </div>
                        </div>

                        <!-- Text Control (Hidden in 'image-only' mode) -->
                        <div id="header-text-controls">
                            <h3 style="margin-top:0; color:#ddd;">Header Title</h3>
                            <p style="font-size:0.8rem; color:#888;">Manage the main title text.</p>
                            <div class="input-row" style="margin-top:15px;">
                                <textarea class="input-dark" id="edit-header" placeholder="New Title..." rows="2"
                                    style="resize:vertical;"></textarea>
                                <button class="btn-action" onclick="mds.addItem('header')">Add</button>
                            </div>
                            <div id="list-header"
                                style="margin-top:15px; max-height:100px; overflow-y:auto; display:flex; flex-direction:column; gap:5px;">
                            </div>
                            <!-- Alignment Controls -->
                            <div style="margin-top: 20px;">
                                <label style="font-size:0.8rem; color:#aaa; display:block; margin-bottom:5px;">Title
                                    Alignment</label>
                                <div style="display:flex; gap:10px;">
                                    <button class="btn-action" style="background:#333;"
                                        onclick="mds.setHeaderAlign('flex-start')">Left</button>
                                    <button class="btn-action" style="background:#333;"
                                        onclick="mds.setHeaderAlign('center')">Center</button>
                                    <button class="btn-action" style="background:#333;"
                                        onclick="mds.setHeaderAlign('flex-end')">Right</button>
                                </div>
                            </div>
                        </div>

                        <!-- Background Image Control (Shared) -->
                        <div style="margin-top: 25px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
                            <label style="font-size:0.8rem; color:#aaa; display:block; margin-bottom:5px;">Background
                                Image / GIF</label>

                            <!-- Upload Input -->
                            <div
                                style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 4px; display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                                <input type="file" id="header-bg-upload" accept="image/*"
                                    style="font-size: 0.8rem; color: #ccc;">
                                <button class="btn-action" onclick="mds.uploadHeaderBg()">Upload & Set</button>
                            </div>

                            <p style="font-size:0.75rem; color:#666;">Or enter URL manually:</p>
                            <div class="input-row">
                                <input type="text" class="input-dark" id="header-bg-url" placeholder="Image URL...">
                                <button class="btn-action" onclick="mds.setHeaderBg()">Set URL</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PAGE: Banner -->
                <div id="page-banner" class="content-page hidden">
                    <div
                        style="background: rgba(255,255,255,0.05); padding: 15px; border-radius:8px; border:1px solid rgba(255,255,255,0.1);">
                        <h3 style="margin-top:0; color:#ddd;">Banner Text</h3>
                        <p style="font-size:0.8rem; color:#888;">Manage large text displayed in the center banner zone.
                        </p>

                        <div class="input-row" style="margin-top:15px;">
                            <textarea class="input-dark" id="edit-banner" placeholder="New Banner Text..." rows="3"
                                style="resize:vertical;"></textarea>
                            <button class="btn-action" onclick="mds.addItem('banner')">Add</button>
                        </div>
                        <div id="list-banner"
                            style="margin-top:15px; max-height:250px; overflow-y:auto; display:flex; flex-direction:column; gap:5px;">
                        </div>
                    </div>
                </div>

                <!-- PAGE: Message Board (Ticker) -->
                <div id="page-ticker" class="content-page hidden">
                    <div
                        style="background: rgba(255,255,255,0.05); padding: 15px; border-radius:8px; border:1px solid rgba(255,255,255,0.1);">
                        <h3 style="margin-top:0; color:#ddd;">Message Board</h3>
                        <p style="font-size:0.8rem; color:#888;">Manage scrolling ticker messages.</p>

                        <div class="input-row" style="margin-top:15px;">
                            <textarea class="input-dark" id="edit-ticker" placeholder="New Ticker Message..." rows="2"
                                style="resize:vertical;"></textarea>
                            <button class="btn-action" onclick="mds.addItem('ticker')">Add</button>
                        </div>
                        <div id="list-ticker"
                            style="margin-top:15px; max-height:250px; overflow-y:auto; display:flex; flex-direction:column; gap:5px;">
                        </div>
                    </div>
                </div>

                <!-- PAGE: Sidebar Notice -->
                <div id="page-notice" class="content-page hidden">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <!-- Left: Add New -->
                        <div
                            style="background: rgba(255,255,255,0.05); padding: 15px; border-radius:8px; border:1px solid rgba(255,255,255,0.1);">
                            <h3 style="margin-top:0; color:#ddd;">Add Saved Notice</h3>
                            <div class="input-row" style="margin-top:15px; flex-direction: column; gap: 10px;">
                                <textarea class="input-dark" id="edit-notice-title" placeholder="Title" rows="1"
                                    style="resize:vertical;"></textarea>
                                <textarea class="input-dark" id="edit-notice-body" placeholder="Body" rows="4"
                                    style="resize:vertical;"></textarea>
                                <button class="btn-action" style="width: 100%;" onclick="mds.addNoticeItem()">Add to
                                    Saved List</button>
                            </div>
                            <label style="font-size:0.8rem; color:#aaa; display:block; margin-top:15px;">Saved Notices
                                List:</label>
                            <div id="list-notice"
                                style="margin-top:5px; max-height:200px; overflow-y:auto; display:flex; flex-direction:column; gap:5px;">
                            </div>
                        </div>

                        <!-- Right: Active Live -->
                        <div
                            style="background: rgba(76, 209, 55, 0.05); padding: 15px; border-radius:8px; border:1px solid rgba(76, 209, 55, 0.2);">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <h3 style="margin:0; color:#4cd137;">Live Active Notices</h3>
                                <button class="btn-action"
                                    style="padding:2px 5px; font-size:0.7rem; background:transparent; border:1px solid #555;"
                                    onclick="mds.renderActiveNotices()">↻ Refresh</button>
                            </div>
                            <p style="font-size:0.8rem; color:#888;">Currently displayed on screen.</p>

                            <div id="list-active-notices"
                                style="margin-top:15px; max-height:300px; overflow-y:auto; display:flex; flex-direction:column; gap:5px;">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PAGE: Quick Announcements -->
                <div id="page-text" class="content-page hidden">
                    <div
                        style="background: rgba(255,255,255,0.05); padding: 15px; border-radius:8px; border:1px solid rgba(255,255,255,0.1);">
                        <h3 style="margin-top:0; color:#ddd;">Quick Announcements</h3>
                        <p style="font-size:0.8rem; color:#888;">Fullscreen text announcements (Text Mode).</p>

                        <div class="input-row" style="margin-top:15px;">
                            <textarea class="input-dark" id="new-quick-text" placeholder="Enter announcement text..."
                                rows="3" style="resize:vertical;"></textarea>
                            <button class="btn-action" onclick="mds.addItem('text')">Add</button>
                        </div>
                        <div id="list-text"
                            style="margin-top:15px; max-height:250px; overflow-y:auto; display:flex; flex-direction:column; gap:5px;">
                        </div>
                    </div>
                </div>

                <?php if ($_SESSION['role'] === 'admin'): ?>
                    <div style="margin-top: 20px; border-top: 1px solid #333; padding-top: 10px;">
                        <details>
                            <summary style="cursor:pointer; color:#e74c3c; font-size:0.8rem;">Admin Options (Footer)
                            </summary>
                            <div
                                style="background: rgba(200, 50, 50, 0.1); padding: 10px; border-radius:4px; margin-top:5px; border:1px solid #700;">
                                <label style="font-size:0.8rem; color:#e74c3c;">Footer Copyright</label>
                                <div class="input-row" style="margin-top:5px;">
                                    <input type="text" class="input-dark" id="edit-footer" placeholder="Copyright Text">
                                    <button class="btn-action" style="background:#c0392b;"
                                        onclick="mds.updateContent('footer')">Set</button>
                                </div>
                            </div>
                        </details>
                    </div>
                <?php endif; ?>
            </div>

            <!-- TAB 3: MEDIA LIBRARY -->
            <div id="tab-media" class="tab-content">
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <input type="file" id="media-upload-input" style="display: none;" onchange="mds.handleUpload(this)">
                    <button class="btn-action" onclick="document.getElementById('media-upload-input').click()">+ Upload
                        New</button>
                    <button class="btn-action" style="background:transparent; border:1px solid #555; color:#fff;"
                        onclick="mds.refreshMediaList()">Refresh List</button>
                </div>

                <div id="media-list"
                    style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; max-height: 300px; overflow-y: auto;">
                    <!-- JS will populate fetching from php/upload_media.php -->
                    <div style="color: #666; font-size: 0.9rem;">No media found.</div>
                </div>
            </div>

            <!-- TAB 4: PRESETS -->
            <div id="tab-presets" class="tab-content">
                <div style="max-height: 450px; overflow-y: auto; padding-right: 10px;">

                    <div class="presets-area">
                        <h3>Layout Presets</h3>
                        <p style="color:#888; margin-bottom:1rem;">Quick save/load layouts. Press Alt + 1-9 to load
                            instantly.</p>

                        <!-- Preset Grid (3x3) -->
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                            <?php for ($i = 1; $i <= 9; $i++): ?>
                                <div
                                    style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);">
                                    <div style="font-size: 0.8rem; color: #7f8c8d; margin-bottom: 5px;">Preset
                                        <?php echo $i; ?>
                                    </div>
                                    <div style="display: flex; gap: 5px;">
                                        <button class="btn-action" style="flex: 1; font-size: 0.8rem; padding: 5px;"
                                            onclick="mds.savePreset(<?php echo $i; ?>)">💾</button>
                                        <button class="btn-action"
                                            style="flex: 1; font-size: 0.8rem; padding: 5px; background: #2c3e50;"
                                            onclick="mds.loadPreset(<?php echo $i; ?>)">▶</button>
                                    </div>
                                </div>
                            <?php endfor; ?>
                        </div>
                    </div>

                    <!-- Custom Greeting Config -->
                    <div
                        style="background: rgba(255,255,255,0.05); padding: 10px; border-radius:4px; margin-top: 20px;">
                        <label style="font-size:0.8rem; color:#aaa;">Custom Greetings</label>
                        <div class="input-row" style="margin-top:5px; flex-direction:column; gap:5px;">
                            <input type="text" class="input-dark" id="edit-greet-morning"
                                placeholder="Morning Greeting">
                            <input type="text" class="input-dark" id="edit-greet-afternoon"
                                placeholder="Afternoon Greeting">
                            <input type="text" class="input-dark" id="edit-greet-evening"
                                placeholder="Evening Greeting">
                            <button class="btn-action" onclick="mds.saveGreetings()">Save Greetings</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- TAB 5: SYSTEM -->
            <div id="tab-system" class="tab-content">
                <!-- BULK IMPORT -->
                <div
                    style="background: rgba(52, 152, 219, 0.1); padding: 15px; border-radius:4px; border: 1px dashed #3498db; margin-bottom: 20px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <h3 style="margin:0; font-size:1rem; color:#3498db;">📥 Bulk Content Import</h3>
                            <p style="margin:5px 0 0 0; font-size:0.8rem; color:#aaa;">Import multiple items from
                                Excel/CSV.</p>
                        </div>
                        <button class="btn-action" style="background: #2980b9;" onclick="mds.downloadTemplate()">📄 Get
                            Template</button>
                    </div>
                    <div class="input-row" style="margin-top:15px;">
                        <input type="file" id="import-file" accept=".csv, .txt" style="font-size:0.8rem; color:#ccc;">
                        <button class="btn-action" style="background: #27ae60;" onclick="mds.importContent()">Upload &
                            Import</button>
                    </div>
                </div>

                <div style="margin-top: 2rem; border-top: 1px solid #333; padding-top: 1rem;">
                    <h3>System Info</h3>
                    <p style="color:#666; font-size: 0.9rem;">Version: MDS v1.0.0-beta</p>
                    <button class="btn-action" style="background: #333; margin-top: 10px;"
                        onclick="window.location.href='login.html'">Logout</button>
                </div>
            </div>

            <div class="shortcut-hint">Press <b>Alt + C</b> to Close Panel</div>
        </div>
    </div>

    <!-- Scripts -->
    <script>
        // Inject Role for JS usage if needed
        window.userRole = '<?php echo $_SESSION['role']; ?>';
    </script>
    <script src="assets/js/display.js"></script>
</body>

</html>