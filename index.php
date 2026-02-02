<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Multimedia Digital Signage (MDS)</title>
    <link rel="stylesheet" href="style.css?v=nocache_static_1">
</head>

<body>

    <div class="grid-container" id="grid-container">
        <!-- 1. Header -->
        <header class="header">
            <h1>Multimedia Digital Signage (MDS)</h1>
        </header>



        <!-- 2. Main Display Area -->
        <main class="main-display">
            <div id="main-content">
                <!-- Mode 1: Video -->
                <div id="mode-video" class="content-mode">
                    <video id="main-video-player"
                        src="assets/video/Noisestorm%20-%20Crab%20Rave%20%5BMonstercat%20Release%5D.mp4" autoplay loop
                        controls style="width:100%; height:100%; object-fit:cover;"></video>
                </div>

                <!-- Mode 2: Website -->
                <div id="mode-website" class="content-mode hidden-mode">
                    <iframe src="https://www.wikipedia.org" title="Embedded Website"></iframe>
                </div>

                <!-- Mode 3: Text -->
                <div id="mode-text" class="content-mode hidden-mode">
                    <div class="text-content">
                        <h1>WELCOME TO MDS</h1>
                        <p>Special Announcement Text Here</p>
                    </div>
                </div>

                <!-- Mode 4: Camera -->
                <div id="mode-camera" class="content-mode hidden-mode">
                    <video id="camera-feed" autoplay playsinline></video>
                    <div id="camera-error" class="error-msg hidden">Camera access denied or unavailable</div>
                </div>
            </div>
        </main>



        <!-- Sidebar Container (Flex for independent resizing) -->
        <div class="sidebar-container" id="sidebar-container">
            <!-- Sidebar Top (Slideshow) -->
            <div class="sidebar-top" id="sidebar-top">
                <div class="slideshow-container">
                    <img src="data:image/jpeg;base64,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"
                        alt="Promo 1" class="slide active">
                    <img src="data:image/jpeg;base64,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"
                        alt="Promo 2" class="slide">
                    <img src="assets/images/ai_art.png" alt="Promo Added" class="slide">
                    <img src="assets/images/logo1.png" alt="Promo Logo" class="slide">
                </div>
            </div>



            <!-- Sidebar Bottom (Notices) -->
            <div class="sidebar-bottom" id="sidebar-bottom">
                <h3>Notices</h3>
                <div class="announcement-list">
                    <div class="announcement-item">⚠ System maintenance scheduled for 2:00 AM.</div>
                    <div class="announcement-item">ℹ Welcome to the MDS dashboard.</div>
                    <div class="announcement-item">★ Special event happening today on Floor 3.</div>
                    <div class="announcement-item">☔ Rain forecast for tomorrow evening.</div>
                    <div class="announcement-item">✓ Monthly audit completed successfully.</div>
                </div>
            </div>
        </div>



        <!-- Banner Section (Landscape Advertisement) -->
        <section class="banner-ad-section" id="banner-ad-section">
            <video src="assets/banner/vecteezy_rural-summer-sunset-landscape-with-river-lakes-swamp-and_12354498.mp4"
                autoplay loop muted style="width:100%; height:100%; object-fit:cover;"></video>
        </section>



        <!-- Message Board (Marquee) -->
        <div class="message-bar">
            <div class="marquee-container">
                <p>Welcome to our Digital Signage System. Please observe safety guidelines at all times.
                    &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; New cafeteria menu available now! &nbsp;&nbsp;&nbsp; |
                    &nbsp;&nbsp;&nbsp; Contact support for assistance.</p>
            </div>
        </div>

        <!-- 7. Footer (containing Greeting, Copyright, Clock) - NOT Resizable -->
        <div class="copyright-footer">
            <div class="footer-left">
                <span class="greeting" id="greeting">Welcome</span>
            </div>
            <div class="footer-center">
                &copy; 2026 MDS Corp. All rights reserved.
            </div>
            <div class="footer-right">
                <span class="datetime" id="datetime">--:--</span>
            </div>
        </div>
    </div>

    <!-- Floating Admin Trigger Button -->
    <button id="admin-trigger" class="admin-trigger" title="Open Control Panel (Alt+1)">⚙</button>

    <!-- ADMIN OVERLAY -->
    <div id="admin-overlay" class="admin-overlay admin-hidden">
        <div class="window admin-panel">
            <!-- 1. Title Bar -->
            <div class="title-bar">
                <div class="title-left">
                    <div class="status-indicator"></div>
                    <span class="window-title">Control Panel <span class="subtitle">- Multimedia Digital Signage
                            (MDS)</span></span>
                </div>
                <div class="window-controls">
                    <button class="win-btn help" title="Help">?</button>
                    <button class="win-btn close" title="Close" id="admin-close-btn">X</button>
                </div>
            </div>

            <!-- 2. Top Module Toolbar -->
            <!-- 2. Top Module Toolbar -->
            <!-- 2. Top Section Toolbar -->
            <div class="toolbar-section">
                <div class="section-label">Select Section:</div>
                <div class="module-grid section-grid">
                    <button class="module-btn section-btn" data-section="header">
                        <div class="icon-box header">H</div>
                        <span>Header</span>
                    </button>
                    <button class="module-btn section-btn active" data-section="main">
                        <div class="icon-box video">📺</div>
                        <span>Main Display</span>
                    </button>
                    <button class="module-btn section-btn" data-section="sidebar-top">
                        <div class="icon-box photo">🖼</div>
                        <span>Slideshow</span>
                    </button>
                    <button class="module-btn section-btn" data-section="sidebar-bottom">
                        <div class="icon-box notice">📋</div>
                        <span>Notices</span>
                    </button>
                    <button class="module-btn section-btn" data-section="banner">
                        <div class="icon-box banner">B</div>
                        <span>Banner</span>
                    </button>
                    <button class="module-btn section-btn" data-section="msgbar">
                        <div class="icon-box msg">✉</div>
                        <span>Message Bar</span>
                    </button>
                </div>
            </div>

            <!-- 2.5 Properties / Sub-Selection Panel -->
            <div class="properties-panel" id="properties-panel">
                <div class="prop-placeholder">Select a section to configure options.</div>
            </div>

            <!-- 3. Main Content Table -->
            <div class="content-area">
                <div class="table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Type</th>
                                <th>Duration</th>
                                <th>Time Remaining</th>
                            </tr>
                        </thead>
                        <tbody id="content-rows">
                            <tr class="selected">
                                <td>Live Feed Placeholder</td>
                                <td>Default Video Loop</td>
                                <td>Video</td>
                                <td>Loop</td>
                                <td>--:--:--</td>
                            </tr>
                            <tr>
                                <td>Company Website</td>
                                <td>www.wikipedia.org</td>
                                <td>Website</td>
                                <td>Interactive</td>
                                <td>--:--:--</td>
                            </tr>
                            <tr>
                                <td>Welcome Message</td>
                                <td>"Welcome to MDS"</td>
                                <td>Text</td>
                                <td>Static</td>
                                <td>--:--:--</td>
                            </tr>
                            <tr>
                                <td>Security Camera 1</td>
                                <td>Live Webcam Feed</td>
                                <td>Camera</td>
                                <td>Live</td>
                                <td>--:--:--</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 4. Action Toolbar -->
            <div class="action-bar">
                <div class="action-group left">
                    <button class="action-btn import"><span class="icon">⬇</span> Import</button>
                    <button id="action-layout" class="action-btn layout"><span class="icon">▤</span> Layout</button>
                    <button class="action-btn schedule"><span class="icon">🕒</span> Schedule</button>
                </div>
                <div class="action-group right">
                    <button class="action-btn confirm highlight"><span class="icon">✔</span> Confirm</button>
                    <button id="action-activate" class="action-btn view-toggle highlight"><span class="icon">👁</span>
                        Activate</button>
                    <button class="action-btn delete danger"><span class="icon">🗑</span> Delete</button>
                    <button class="action-btn close danger" id="admin-close-btn-2"><span class="icon">✖</span>
                        Close</button>
                </div>
            </div>

            <!-- 5. Status Bar -->
            <div class="status-bar">
                <div class="status-left">Status: <span id="sys-status">Ready</span> | Module: <span
                        id="curr-module">PowerPoint</span></div>
                <div class="status-right" id="admin-clock">--:--:--</div>
            </div>
        </div>
    </div>

    <script src="script.js?v=nocache_ui_reorg"></script>
</body>

</html>