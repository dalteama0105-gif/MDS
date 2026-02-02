function updateClock() {
    const now = new Date();

    // Format Date: Monday, January 1, 2026
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('en-US', dateOptions);

    // Format Time: 12:00:00 PM
    const timeString = now.toLocaleTimeString('en-US', { hour12: true });

    document.getElementById('datetime').innerHTML = `<span>${dateString}</span> &nbsp;|&nbsp; <span>${timeString}</span>`;

    // Greeting based on time
    const hour = now.getHours();
    let greeting = "Welcome";
    if (hour < 12) greeting = "Good Morning";
    else if (hour < 18) greeting = "Good Afternoon";
    else greeting = "Good Evening";

    document.getElementById('greeting').innerText = greeting;

    // Force Video Play
    // Force Video Play
    const mainVideo = document.getElementById('main-video-player');
    if (mainVideo) {
        // Removed forced mute to allow audio (User must interact if browser blocks)
        mainVideo.play().catch(e => console.log("Autoplay blocked (Audio might need interaction):", e));
    }
}

function startSlideshow() {
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    if (slides.length === 0) return;

    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 5000); // Change every 5 seconds
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);
    startSlideshow();

    // --- Admin Logic Initialization ---
    initAdminPanel();

    // --- Notice Rotation ---
    initNoticeRotation();

    // --- Content Manager (Alt+X & Admin Panel) ---
    initContentManager();
});

function initContentManager() {
    const modes = ['video', 'website', 'text', 'camera'];
    let currentIndex = 0;

    // Helper: Switch to specific mode by name ('video', 'website', etc.)
    function switchToMode(modeName) {
        const targetIndex = modes.indexOf(modeName);
        if (targetIndex === -1) return;

        // Update logic
        const currentModeName = modes[currentIndex];
        const currentEl = document.getElementById(`mode-${currentModeName}`);

        // Hide current
        if (currentEl) {
            currentEl.classList.add('hidden-mode');
            if (currentModeName === 'camera') stopCamera();
        }

        // Update Index
        currentIndex = targetIndex;
        const newModeName = modes[currentIndex];
        const newEl = document.getElementById(`mode-${newModeName}`);

        // Show new
        if (newEl) {
            newEl.classList.remove('hidden-mode');
            if (newModeName === 'camera') initCamera();
        }

        // Sync Status Bar in Admin Panel
        const statusEl = document.getElementById('curr-module');
        if (statusEl) statusEl.textContent = newModeName.charAt(0).toUpperCase() + newModeName.slice(1);
    }

    // 1. Keyboard Toggle (Alt+X)
    document.addEventListener('keydown', (e) => {
        if (e.altKey && e.key.toLowerCase() === 'x') {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % modes.length;
            switchToMode(modes[nextIndex]);
        }
    });

    // 2. Admin Panel 'Activate' Button (Legacy direct binding - kept for safety, but Event is primary)
    // Note: The new initAdminPanel uses CustomEvent 'mds-mode-change'

    // 3. Custom Event Listener (From Admin Panel)
    document.addEventListener('mds-mode-change', (e) => {
        if (e.detail && e.detail.mode) {
            switchToMode(e.detail.mode);
        }
    });

    // Camera Logic
    let videoStream = null;

    function initCamera() {
        const videoEl = document.getElementById('camera-feed');
        const errorEl = document.getElementById('camera-error');

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            if (errorEl) errorEl.classList.remove('hidden');
            return;
        }

        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                videoStream = stream;
                if (videoEl) {
                    videoEl.srcObject = stream;
                    if (errorEl) errorEl.classList.add('hidden');
                }
            })
            .catch(err => {
                console.error("Camera Error:", err);
                if (errorEl) errorEl.classList.remove('hidden');
            });
    }

    function stopCamera() {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            videoStream = null;
        }
    }
}

function initNoticeRotation() {
    const list = document.querySelector('.announcement-list');
    if (!list || list.children.length === 0) return;

    setInterval(() => {
        const firstItem = list.firstElementChild;
        if (!firstItem) return;

        // Calculate full height (offsetHeight includes padding/border, need margin too)
        const style = window.getComputedStyle(firstItem);
        const marginTop = parseFloat(style.marginTop);
        const marginBottom = parseFloat(style.marginBottom);
        const totalHeight = firstItem.offsetHeight + marginTop + marginBottom;

        // Slide up
        firstItem.style.marginTop = `-${totalHeight}px`;

        // After transition, move to bottom and reset
        setTimeout(() => {
            // Disable transition to snap back instantly
            firstItem.style.transition = 'none';
            firstItem.style.marginTop = '0';

            // Move to end
            list.appendChild(firstItem);

            // Force reflow/repaint
            void firstItem.offsetWidth;

            // Re-enable transition for next time
            firstItem.style.transition = 'margin-top 0.5s ease-in-out';

        }, 500); // 500ms matches CSS transition
    }, 3000); // 3 seconds visible
}

// --- Static Logic (No API) ---

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);
    startSlideshow();

    // --- Admin Logic Initialization ---
    initAdminPanel();

    // --- Notice Rotation ---
    initNoticeRotation();
});

// --- Admin Panel Logic ---
function initAdminPanel() {
    if (window.adminInitDone) {
        console.warn("initAdminPanel called twice! Skipping.");
        return;
    }
    window.adminInitDone = true;

    // ... (Clock, Toggle, Close logic same as before) ...
    function updateAdminClock() {
        const now = new Date();
        const dateStr = now.toLocaleDateString();
        const timeStr = now.toLocaleTimeString();
        const clockEl = document.getElementById('admin-clock');
        if (clockEl) clockEl.textContent = `${dateStr} | ${timeStr}`;
    }
    setInterval(updateAdminClock, 1000);
    updateAdminClock();

    const overlay = document.getElementById('admin-overlay');

    // Helper function to toggle visibility
    function toggleOverlay() {
        overlay.style.display = ''; // Clear overrides
        const res = overlay.classList.toggle('admin-hidden');
    }

    document.addEventListener('keydown', (e) => {
        if (e.altKey && (e.code === 'KeyC' || e.key.toLowerCase() === 'c')) {
            e.preventDefault();
            toggleOverlay();
        }
    });

    // Close Button Logic
    const adminCloseBtns = [document.getElementById('admin-close-btn'), document.getElementById('admin-close-btn-2')];
    adminCloseBtns.forEach(btn => {
        if (btn) btn.addEventListener('click', () => {
            log("Close Clicked");
            overlay.classList.add('admin-hidden');
        });
    });

    // Floating Trigger (Active)
    const triggerBtn = document.getElementById('admin-trigger');
    if (triggerBtn) {
        triggerBtn.addEventListener('click', () => {
            log("Gear Clicked");
            toggleOverlay();
        });
    }

    // Toast
    function showToast(message, type = 'info') {
        const existingToast = document.querySelector('.admin-toast');
        if (existingToast) existingToast.remove();
        const toast = document.createElement('div');
        toast.className = `admin-toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('visible'), 10);
        setTimeout(() => { toast.classList.remove('visible'); setTimeout(() => toast.remove(), 300); }, 3000);
    }

    // Section Logic
    const sectionBtns = document.querySelectorAll('.section-btn');
    const propPanel = document.getElementById('properties-panel');

    sectionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sectionBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProperties(btn.dataset.section);
        });
    });

    function renderProperties(section) {
        if (!propPanel) return;
        propPanel.innerHTML = '';

        if (section === 'main') {
            const group = document.createElement('div');
            group.className = 'prop-group';

            // Get current internal iframe src to pre-fill
            const iframeEl = document.querySelector('#mode-website iframe');
            const currentSrc = iframeEl ? iframeEl.src : '';

            group.innerHTML = `<div class="prop-label">Content Layout</div>
                <div class="prop-buttons">
                    <button class="sub-btn" data-mode="video"><span class="icon">▶</span> Video</button>
                    <button class="sub-btn" data-mode="website"><span class="icon">🌐</span> Website</button>
                    <button class="sub-btn" data-mode="text"><span class="icon">Aa</span> Text</button>
                    <button class="sub-btn" data-mode="camera"><span class="icon">📷</span> Camera</button>
                </div>
                <div id="website-url-group" style="margin-top:10px; display:none;">
                    <div class="prop-label">Website URL</div>
                    <input type="text" id="prop-website-url" class="prop-input" value="${currentSrc}" style="width:100%">
                    <div style="font-size:10px; color:#0f0; margin-top:5px;">
                        Note: URLs appear in an iframe and require proper CORS headers to function correctly.
                    </div>
                </div>`;
            propPanel.appendChild(group);

            setTimeout(() => {
                // Sub-buttons to switch between templates
                document.querySelectorAll('.sub-btn[data-mode]').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const mode = btn.dataset.mode;
                        document.querySelectorAll('.sub-btn[data-mode]').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');

                        // Toggle input visibility
                        document.getElementById('website-url-group').style.display = mode === 'website' ? 'block' : 'none';

                        // Trigger Mode Change
                        const event = new CustomEvent('mds-mode-change', { detail: { mode: mode } });
                        document.dispatchEvent(event);
                    });
                });
            }, 0);

        } else if (section === 'header') {
            const headerTitle = document.querySelector('header h1').innerText;
            propPanel.innerHTML = `<div class="prop-group"><div class="prop-label">Header Title</div><input type="text" id="prop-header-title" class="prop-input" value="${headerTitle}" style="width:100%"></div>`;
        } else if (section === 'banner') {
            const bannerSrc = document.querySelector('.banner-ad-section video').getAttribute('src');
            propPanel.innerHTML = `<div class="prop-group"><div class="prop-label">Banner Video Source</div><input type="text" id="prop-banner-src" class="prop-input" value="${bannerSrc}" style="width:100%"></div>`;
        } else if (section === 'msgbar') {
            const msgText = document.querySelector('.marquee-container p').innerText;
            propPanel.innerHTML = `<div class="prop-group"><div class="prop-label">Ticker Message</div><input type="text" id="prop-msg-text" class="prop-input" value="${msgText}" style="width:100%"></div>`;
        } else if (section === 'sidebar-top') {
            propPanel.innerHTML = `<div class="prop-group" style="flex:1">
                <div class="prop-label">Slideshow Controls</div>
                <div class="prop-buttons">
                    <button class="sub-btn" id="prev-slide-btn"><span class="icon">◀</span> Prev</button>
                    <button class="sub-btn" id="pause-slide-btn"><span class="icon">❚❚</span> Pause</button>
                    <button class="sub-btn" id="next-slide-btn"><span class="icon">▶</span> Next</button>
                </div>
                <div style="margin-top:15px; padding-top:15px; border-top:1px solid rgba(255,255,255,0.1);">
                    <div class="prop-label">Slide Actions</div>
                    <div style="display:flex; gap:10px;">
                        <button class="sub-btn" id="add-slide-btn"><span class="icon">✚</span> Add Slide</button>
                        <button class="sub-btn" id="edit-slide-btn"><span class="icon">✎</span> Edit</button>
                    </div>
                </div>
            </div>`;
            setTimeout(() => {
                document.getElementById('prev-slide-btn').addEventListener('click', () => manualSlide(-1));
                document.getElementById('next-slide-btn').addEventListener('click', () => manualSlide(1));
                document.getElementById('add-slide-btn').addEventListener('click', () => showToast('Add Slide feature coming soon.'));
                document.getElementById('edit-slide-btn').addEventListener('click', () => {
                    const selected = document.querySelector('#content-rows tr.selected');
                    if (selected) {
                        showToast('Edit Slide feature coming soon.');
                    } else {
                        showToast('Select a slide first.', 'error');
                    }
                });
            }, 0);
        } else if (section === 'sidebar-bottom') {
            propPanel.innerHTML = `<div class="prop-group" style="flex:1"><div class="prop-label">New Notice Text (Multi-line)</div><div style="display:flex; gap:10px; flex-direction:column"><textarea id="prop-notice-text" class="prop-input" style="width:100%; height:80px; resize:vertical; font-family:inherit" placeholder="Enter notice..."></textarea><div style="display:flex; gap:10px"><button class="sub-btn" id="add-notice-btn">Add</button><button class="sub-btn danger" id="clear-notice-btn">Clear</button></div></div></div>`;
            setTimeout(() => {
                document.getElementById('add-notice-btn').addEventListener('click', () => addNoticeAPI());
                document.getElementById('clear-notice-btn').addEventListener('click', () => clearNoticesAPI());
            }, 0);
        }
        renderTable(section);

    }

    // --- Dynamic Table Rendering ---
    function renderTable(section) {
        const tbody = document.getElementById('content-rows');
        if (!tbody) return;
        tbody.innerHTML = '';

        let rows = [];

        // Define data based on section
        if (section === 'main') {
            const urlInput = document.getElementById('prop-website-url');
            const currentUrl = urlInput ? urlInput.value : 'www.wikipedia.org';
            rows = [
                { name: 'Live Feed Placeholder', desc: 'Default Video Loop', type: 'Video', dur: 'Loop' },
                { name: 'Company Website', desc: currentUrl, type: 'Website', dur: 'Interactive' },
                { name: 'Welcome Message', desc: '"Welcome to MDS"', type: 'Text', dur: 'Static' },
                { name: 'Security Camera 1', desc: 'Live Webcam Feed', type: 'Camera', dur: 'Live' }
            ];
        } else if (section === 'header') {
            const val = document.querySelector('header h1').innerText;
            rows = [
                { name: 'Main Header', desc: val, type: 'Static Text', dur: 'Always On' }
            ];
        } else if (section === 'banner') {
            const title = document.querySelector('.banner-ad-section h2').innerText;
            const sub = document.querySelector('.banner-ad-section p').innerText;
            rows = [
                { name: 'Banner Title', desc: title, type: 'Static Text', dur: 'Always On' },
                { name: 'Subtitle', desc: sub, type: 'Static Text', dur: 'Always On' }
            ];
        } else if (section === 'msgbar') {
            const text = document.querySelector('.marquee-container p').innerText;
            rows = [
                { name: 'Ticker Message', desc: text.substring(0, 30) + '...', type: 'Marquee', dur: 'Loop' }
            ];
        } else if (section === 'sidebar-top') {
            const images = document.querySelectorAll('.slide');
            images.forEach((img, i) => {
                rows.push({ name: `Slide ${i + 1}`, desc: img.alt || 'Image', type: 'Image', dur: '5s' });
            });
        } else if (section === 'sidebar-bottom') {
            const notices = document.querySelectorAll('.announcement-item');
            notices.forEach((n, i) => {
                rows.push({ name: `Notice ${i + 1}`, desc: n.innerText.substring(0, 30) + '...', type: 'Text', dur: '5s' });
            });
        }

        // Render Rows
        rows.forEach((r, i) => {
            const tr = document.createElement('tr');
            if (i === 0) tr.classList.add('selected'); // Auto-select first
            tr.innerHTML = `<td>${r.name}</td><td>${r.desc}</td><td>${r.type}</td><td>${r.dur}</td><td>--:--:--</td>`;
            tr.addEventListener('click', () => {
                document.querySelectorAll('#content-rows tr').forEach(row => row.classList.remove('selected'));
                tr.classList.add('selected');
            });
            tbody.appendChild(tr);
        });
    }

    // --- Dynamic Table Rendering ---
    function renderTable(section) {
        const tbody = document.getElementById('content-rows');
        if (!tbody) return;
        tbody.innerHTML = '';

        let rows = [];

        // Define data based on section
        if (section === 'main') {
            const urlInput = document.getElementById('prop-website-url');
            const currentUrl = urlInput ? urlInput.value : 'www.wikipedia.org';
            rows = [
                { name: 'Primary Video', desc: 'assets/video/Noisestorm - Crab Rave [Monstercat Release].mp4', type: 'Video', dur: 'Loop' },
                { name: 'Company Website', desc: currentUrl, type: 'Website', dur: 'Interactive' },
                { name: 'Welcome Message', desc: '"Welcome to MDS"', type: 'Text', dur: 'Static' },
                { name: 'Security Camera 1', desc: 'Live Webcam Feed', type: 'Camera', dur: 'Live' }
            ];
        } else if (section === 'header') {
            const val = document.querySelector('header h1').innerText;
            rows = [
                { name: 'Main Header', desc: val, type: 'Static Text', dur: 'Always On' }
            ];
        } else if (section === 'banner') {
            const vid = document.querySelector('.banner-ad-section video');
            rows = [
                { name: 'Banner Video', desc: vid ? vid.getAttribute('src') : 'None', type: 'Video', dur: 'Loop' }
            ];
        } else if (section === 'msgbar') {
            const text = document.querySelector('.marquee-container p').innerText;
            rows = [
                { name: 'Ticker Message', desc: text, type: 'Marquee', dur: 'Loop' }
            ];
        } else if (section === 'sidebar-top') {
            const images = document.querySelectorAll('.slide');
            images.forEach((img, i) => {
                rows.push({ name: `Slide ${i + 1}`, desc: img.alt || 'Image', type: 'Image', dur: '5s' });
            });
        } else if (section === 'sidebar-bottom') {
            const notices = document.querySelectorAll('.announcement-item');
            notices.forEach((n, i) => {
                rows.push({ name: `Notice ${i + 1}`, desc: n.innerText, type: 'Text', dur: '5s' });
            });
        }

        // Render Rows
        rows.forEach((r, i) => {
            const tr = document.createElement('tr');
            if (i === 0) tr.classList.add('selected'); // Auto-select first
            tr.innerHTML = `<td>${r.name}</td><td>${r.desc}</td><td>${r.type}</td><td>${r.dur}</td><td>--:--:--</td>`;
            tr.addEventListener('click', () => {
                document.querySelectorAll('#content-rows tr').forEach(row => row.classList.remove('selected'));
                tr.classList.add('selected');
            });
            tbody.appendChild(tr);
        });
    }

    renderProperties('main');

    // Table Select
    const tableRows = document.querySelectorAll('.data-table tbody tr');
    tableRows.forEach(row => row.addEventListener('click', () => {
        tableRows.forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
    }));

    // ==========================================
    // CONTROL PANEL BUTTON HANDLERS (UNIFIED)
    // ==========================================

    /**
     * Helper: Clone button to remove old event listeners
     */
    function cloneButton(selector) {
        const btn = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (!btn) return null;
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        return newBtn;
    }

    /**
     * Helper: Get currently active section
     */
    function getActiveSection() {
        const activeBtn = document.querySelector('.section-btn.active');
        return activeBtn ? activeBtn.dataset.section : null;
    }

    // ------------------------------------------
    // BUTTON: ACTIVATE (Visibility Toggle)
    // ------------------------------------------
    const activateBtn = cloneButton('#action-activate');
    if (activateBtn) {
        activateBtn.addEventListener('click', () => {
            const section = getActiveSection();
            if (!section) {
                showToast("Select a section first!", "error");
                return;
            }
            triggerActivate(section);
        });
    }

    // ------------------------------------------
    // BUTTON: LAYOUT (Save/Load Layouts)
    // ------------------------------------------
    const layoutBtn = cloneButton('#action-layout');
    if (layoutBtn) {
        layoutBtn.addEventListener('click', () => {
            const slot = prompt("Enter slot number (0-9) to SAVE current layout:", "0");
            if (slot !== null && slot.length === 1 && slot >= '0' && slot <= '9') {
                LayoutManager.saveLayout(slot);
            } else if (slot !== null) {
                showToast("Invalid slot. Use 0-9.", "error");
            }
        });
    }

    // ------------------------------------------
    // BUTTON: CONFIRM (Apply Changes)
    // ------------------------------------------
    const confirmBtn = cloneButton('.action-btn.confirm');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            const section = getActiveSection();
            if (section) {
                applyUpdates(section);
                showToast("Changes applied successfully.");
            } else {
                showToast("Select a section first!", "error");
            }
        });
    }

    // ------------------------------------------
    // BUTTON: EDIT (Edit Selected Item)
    // ------------------------------------------
    const editBtn = cloneButton('.action-btn.edit');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            const selected = document.querySelector('#content-rows tr.selected');
            if (!selected) {
                showToast('No item selected to edit.', 'error');
                return;
            }

            const cell = selected.cells[1]; // Description/Value column
            const oldVal = cell.innerText;
            const newVal = prompt("Edit Value:", oldVal);

            if (newVal !== null && newVal !== oldVal) {
                cell.innerText = newVal;

                // Instant Preview: Update DOM
                const section = getActiveSection();
                if (section === 'header') {
                    const input = document.getElementById('prop-header-title');
                    if (input) input.value = newVal;
                    document.querySelector('header h1').innerText = newVal;

                } else if (section === 'banner') {
                    const input = document.getElementById('prop-banner-src');
                    if (input) input.value = newVal;
                    const vid = document.querySelector('.banner-ad-section video');
                    if (vid) vid.src = newVal;

                } else if (section === 'msgbar') {
                    const input = document.getElementById('prop-msg-text');
                    if (input) input.value = newVal;
                    document.querySelector('.marquee-container p').innerText = newVal;

                } else if (section === 'main' && selected.cells[2].innerText === 'Website') {
                    const input = document.getElementById('prop-website-url');
                    if (input) input.value = newVal;
                    let url = newVal.startsWith('http') ? newVal : 'https://' + newVal;
                    const iframe = document.querySelector('#mode-website iframe');
                    if (iframe) iframe.src = 'proxy.php?url=' + encodeURIComponent(url);
                }

                showToast('Item updated instantly.');
            }
        });
    }

    // ------------------------------------------
    // BUTTON: DELETE (Delete Selected Item)
    // ------------------------------------------
    const deleteBtn = cloneButton('.action-btn.delete');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            const selected = document.querySelector('#content-rows tr.selected');
            if (!selected) {
                showToast('No item selected.', 'error');
                return;
            }

            if (confirm('Delete selected item?')) {
                selected.remove();
                showToast('Item deleted.');
            }
        });
    }

    // ------------------------------------------
    // BUTTON: ADD / CREATE (Add New Item)
    // ------------------------------------------
    ['add', 'create'].forEach(key => {
        const addBtn = cloneButton(`.action-btn.${key}`);
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const tbody = document.getElementById('content-rows');
                if (!tbody) return;

                const tr = document.createElement('tr');
                tr.innerHTML = `<td>New Item</td><td>User Created</td><td>Custom</td><td>--</td><td>--:--:--</td>`;
                tr.addEventListener('click', () => {
                    document.querySelectorAll('#content-rows tr').forEach(row => row.classList.remove('selected'));
                    tr.classList.add('selected');
                });
                tbody.appendChild(tr);
                showToast('New item added to list.');
            });
        }
    });

    // ------------------------------------------
    // BUTTON: IMPORT (Import Media)
    // ------------------------------------------
    const importBtn = cloneButton('.action-btn.import');
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            showToast('Import Media feature coming soon.');
        });
    }

    // ------------------------------------------
    // BUTTON: SCHEDULE (Manage Schedule)
    // ------------------------------------------
    const scheduleBtn = cloneButton('.action-btn.schedule');
    if (scheduleBtn) {
        scheduleBtn.addEventListener('click', () => {
            showToast('Schedule Management feature coming soon.');
        });
    }

    // ------------------------------------------
    // BUTTON: CLOSE (Close Panel)
    // ------------------------------------------
    const closeBtns = [
        cloneButton('.action-btn.close'),
        cloneButton('#admin-close-btn-2')
    ];
    closeBtns.forEach(closeBtn => {
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                const panel = document.getElementById('admin-overlay');
                if (panel) panel.classList.add('admin-hidden');
            });
        }
    });
} // End initAdminPanel

// Action 3: Trigger Activate (Top Level)
function triggerActivate(activeSection, selected) {
    log(`Activating ${activeSection}`);

    let targetElement = null;
    if (activeSection === 'main') targetElement = document.querySelector('.main-display');
    else if (activeSection === 'header') targetElement = document.querySelector('header');
    else if (activeSection === 'banner') targetElement = document.querySelector('.banner-ad-section');
    else if (activeSection === 'msgbar') targetElement = document.querySelector('.message-bar');
    else if (activeSection === 'sidebar-top') targetElement = document.querySelector('.sidebar-top');
    else if (activeSection === 'sidebar-bottom') targetElement = document.querySelector('.sidebar-bottom');

    // Check current state
    const isCurrentlyHidden = targetElement ? targetElement.classList.contains('blackout') : false;

    if (!isCurrentlyHidden) {
        // currently visible -> DEACTIVATE (Hide)
        if (targetElement) targetElement.classList.add('blackout');
        showToast(`${activeSection.toUpperCase()} Deactivated (Hidden).`);
        updateActivateButtonText("Activate");
    } else {
        // currently hidden -> ACTIVATE (Show & Update)
        if (targetElement) targetElement.classList.remove('blackout');
        applyUpdates(activeSection);
        showToast(`${activeSection.toUpperCase()} Activated (Visible).`);
        updateActivateButtonText("Deactivate");
    }
}

function updateActivateButtonText(text) {
    const btn = document.getElementById('action-activate');
    if (btn) btn.innerText = text;
}

function applyUpdates(secType) {
    // 1. Main Display
    if (secType === 'main') {
        const selectedSub = document.querySelector('.sub-btn.active');
        if (selectedSub && selectedSub.dataset.mode) {
            const mode = selectedSub.dataset.mode;
            const event = new CustomEvent('mds-mode-change', { detail: { mode: mode } });
            document.dispatchEvent(event);

            if (mode === 'website') {
                const urlInput = document.getElementById('prop-website-url');
                const iframe = document.querySelector('#mode-website iframe');
                if (urlInput && iframe && urlInput.value) {
                    let url = urlInput.value;
                    if (!url.startsWith('http')) url = 'https://' + url;
                    iframe.src = 'proxy.php?url=' + encodeURIComponent(url);
                }
            }
        }
    }
    else if (secType === 'header') {
        const input = document.getElementById('prop-header-title');
        if (input) document.querySelector('header h1').innerText = input.value;
    }
    else if (secType === 'banner') {
        const input = document.getElementById('prop-banner-src');
        const vid = document.querySelector('.banner-ad-section video');
        if (vid && input) vid.src = input.value;
    }
    else if (secType === 'msgbar') {
        const input = document.getElementById('prop-msg-text');
        if (input) document.querySelector('.marquee-container p').innerText = input.value;
    }
    renderTable(secType);
}

function clearNoticesAPI() {
    if (!confirm('Clear all notices?')) return;
    document.querySelector('.announcement-list').innerHTML = '';
    showToast('Notices cleared.');
    renderTable('sidebar-bottom');
}

// --- Layout Manager (Global) ---
const LayoutManager = {
    saveLayout: (slot) => {
        const layout = {};
        ['header', 'main-display', 'banner-ad-section', 'message-bar', 'sidebar-container'].forEach(cls => {
            const el = document.querySelector('.' + cls) || document.querySelector(cls);
            // Special handling if using IDs or tags
            const el2 = (cls === 'header') ? document.querySelector('header') :
                (cls === 'main-display') ? document.querySelector('main') :
                    (el || document.getElementById(cls)); // Fallback

            if (el2) {
                layout[cls] = el2.classList.contains('blackout');
            }
        });
        localStorage.setItem('mds_layout_' + slot, JSON.stringify(layout));
        showToast(`Layout saved to Alt+${slot}`);
    },
    loadLayout: (slot) => {
        const data = localStorage.getItem('mds_layout_' + slot);
        if (!data) {
            showToast(`No layout found for Alt+${slot}`);
            return;
        }
        const layout = JSON.parse(data);
        Object.keys(layout).forEach(cls => {
            const el = document.querySelector('.' + cls) || document.querySelector(cls);
            const el2 = (cls === 'header') ? document.querySelector('header') :
                (cls === 'main-display') ? document.querySelector('main') :
                    (el || document.getElementById(cls));

            if (el2) {
                const shouldBeHidden = layout[cls];
                if (shouldBeHidden) el2.classList.add('blackout');
                else el2.classList.remove('blackout');
            }
        });
        showToast(`Layout Alt+${slot} loaded`);
    }
};

document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        LayoutManager.loadLayout(e.key);
    }
});

// Helpers for Slideshow/Notices
function manualSlide(dir) {
    const slides = document.querySelectorAll('.slide');
    const current = document.querySelector('.slide.active');
    if (!current) return;

    let idx = Array.from(slides).indexOf(current);
    current.classList.remove('active');

    idx = (idx + dir + slides.length) % slides.length;
    slides[idx].classList.add('active');
}

function addNoticeFromPanel() {
    const input = document.getElementById('prop-notice-text');
    if (!input || !input.value.trim()) {
        showToast('Please enter notice text.', 'error');
        return;
    }

    const list = document.querySelector('.announcement-list');
    const div = document.createElement('div');
    div.className = 'announcement-item';
    div.innerText = "★ " + input.value;
    list.prepend(div); // Add to top
    input.value = '';
    showToast('Notice added successfully.');
    renderTable('sidebar-bottom');
}

// Alias for compatibility
function addNoticeAPI() {
    addNoticeFromPanel();
}

function clearNotices() {
    const list = document.querySelector('.announcement-list');
    list.innerHTML = '';
}

// --- Resizable Grid Logic (All Sections) ---
function initResizableGrid() {
    const grid = document.getElementById('grid-container');
    const gutterCol = document.getElementById('gutter-col');
    const gutterHeader = document.getElementById('gutter-header');
    const gutterRow = document.getElementById('gutter-row');

    if (!grid) return;

    let activeGutter = null;

    // Helper: Add drag listeners to a gutter
    function setupGutter(gutterEl, type) {
        if (!gutterEl) return;
        gutterEl.addEventListener('mousedown', (e) => {
            activeGutter = type;
            document.body.style.cursor = type === 'col' ? 'col-resize' : 'row-resize';
            document.body.style.userSelect = 'none';
            e.preventDefault();
        });
    }

    setupGutter(gutterCol, 'col');
    setupGutter(gutterHeader, 'header');
    setupGutter(gutterRow, 'row');
    const gutterBannerMsg = document.getElementById('gutter-banner-msg');
    setupGutter(gutterBannerMsg, 'banner-msg');

    // Current row heights (in px) 
    // Defaults: header=60, gh=6, main=1fr, gr=6, banner=150, gbm=6, msgbar=40, footer=30
    let headerH = 60;
    let mainH = null; // Calculated
    let bannerH = 150;
    let msgbarH = 40;
    const footerH = 30;
    const gutterSize = 6;

    document.addEventListener('mousemove', (e) => {
        if (!activeGutter) return;

        const gridRect = grid.getBoundingClientRect();

        // Column Resize
        if (activeGutter === 'col') {
            const offsetX = e.clientX - gridRect.left;
            let leftPercent = (offsetX / gridRect.width) * 100;
            leftPercent = Math.max(20, Math.min(80, leftPercent));
            const rightPercent = 100 - leftPercent - 1;
            grid.style.gridTemplateColumns = `${leftPercent}% ${gutterSize}px ${rightPercent}%`;
        }

        // Row Resize: Header
        if (activeGutter === 'header') {
            let newHeaderH = e.clientY - gridRect.top;
            newHeaderH = Math.max(30, Math.min(150, newHeaderH));
            headerH = newHeaderH;
            updateRowTemplate();
        }

        // Row Resize: Main / Banner boundary
        if (activeGutter === 'row') {
            // Available space for Main + Banner = Total - Header - Gutters - MsgBar - Footer
            const available = gridRect.height - headerH - (gutterSize * 3) - msgbarH - footerH;

            let newMainH = e.clientY - gridRect.top - headerH - gutterSize;
            newMainH = Math.max(100, Math.min(available - 50, newMainH)); // Min 50px for banner

            mainH = newMainH;
            bannerH = available - mainH;

            updateRowTemplate();
        }

        // Row Resize: Banner / MsgBar boundary
        if (activeGutter === 'banner-msg') {
            // Available space for Banner + MsgBar = Total - Header - Gutters - Main - Footer
            // Note: mainH must be calculated/known
            if (mainH === null) {
                mainH = gridRect.height - headerH - (gutterSize * 3) - bannerH - msgbarH - footerH;
            }

            const available = gridRect.height - headerH - (gutterSize * 3) - mainH - footerH;

            // Distance from top to cursor
            let distFromTop = e.clientY - gridRect.top;

            // Banner Height = CursorPos - (Header + G + Main + G)
            let newBannerH = distFromTop - (headerH + gutterSize + mainH + gutterSize);

            newBannerH = Math.max(50, Math.min(available - 25, newBannerH)); // Min 25px for msgbar

            bannerH = newBannerH;
            msgbarH = available - bannerH;

            updateRowTemplate();
        }
    });

    function updateRowTemplate() {
        if (mainH === null) {
            const gridRect = grid.getBoundingClientRect();
            mainH = gridRect.height - headerH - (gutterSize * 3) - bannerH - msgbarH - footerH;
        }
        grid.style.gridTemplateRows = `${headerH}px ${gutterSize}px ${mainH}px ${gutterSize}px ${bannerH}px ${gutterSize}px ${msgbarH}px ${footerH}px`;
    }

    document.addEventListener('mouseup', () => {
        if (activeGutter) {
            activeGutter = null;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    });

    // --- Sidebar Internal Resize ---
    initSidebarResize();
}

function initSidebarResize() {
    const sidebarContainer = document.getElementById('sidebar-container');
    const gutterSidebar = document.getElementById('gutter-sidebar');
    const sidebarTop = document.getElementById('sidebar-top');
    const sidebarBottom = document.getElementById('sidebar-bottom');

    if (!sidebarContainer || !gutterSidebar || !sidebarTop || !sidebarBottom) return;

    let isResizing = false;

    gutterSidebar.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const containerRect = sidebarContainer.getBoundingClientRect();
        const offsetY = e.clientY - containerRect.top;
        const totalHeight = containerRect.height;
        const gutterH = 6;

        // Calculate new heights
        let topHeight = offsetY;
        topHeight = Math.max(50, Math.min(totalHeight - gutterH - 50, topHeight));
        const bottomHeight = totalHeight - topHeight - gutterH;

        sidebarTop.style.flex = 'none';
        sidebarTop.style.height = `${topHeight}px`;
        sidebarBottom.style.flex = 'none';
        sidebarBottom.style.height = `${bottomHeight}px`;
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    });
}

// Initialize Resizable Grid on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initResizableGrid();
});
