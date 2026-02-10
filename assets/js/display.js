/**
 * MDS Viewer Logic
 * Handles clock, layout rendering, content loops, and Control Panel.
 */

class MDSDisplay {
    constructor() {
        this.currentMode = 'video';

        // Video Playlist for Alt+N
        this.videoPlaylist = [
            'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
            'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
        ];
        this.currentVideoIndex = 0;

        // Image Slideshow Playlist (Restored)
        this.imagePlaylist = [
            'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1600&h=900&fit=crop', // Nature
            'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&h=900&fit=crop', // Tech
            'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&h=900&fit=crop', // Circuit
            'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1600&h=900&fit=crop'  // Mountain
        ];

        this.initClock();
        this.initKeyboardShortcuts();
        // this.initNoticeScroller();
        this.startSidebarSlideshow(); // Start sidebar image rotation
        this.initLists(); // Render saved content in control panel
        this.loadHeaderConfig(); // Restore header settings
        this.loadBannerConfig(); // Restore banner settings

        // Expose for debugging/Console control
        window.changeMode = this.setMode.bind(this);
    }

    // --- Header Customization ---
    loadHeaderConfig() {
        const config = JSON.parse(localStorage.getItem('mds_header_config') || '{}');
        const header = document.getElementById('header-zone');
        const logo = document.getElementById('header-logo');

        // Restore Alignment
        if (config.align) header.style.justifyContent = config.align;

        // Restore Background
        if (config.bg) {
            header.style.backgroundImage = `url('${config.bg}')`;
            header.style.backgroundSize = 'cover';
            header.style.backgroundPosition = 'center';
            if (document.getElementById('header-bg-url')) {
                document.getElementById('header-bg-url').value = config.bg;
            }
        }

        // Restore Mode (Standard vs Image Only)
        if (config.mode) {
            this.setHeaderMode(config.mode, false); // false = don't save again
            // Update radio button UI
            const radio = document.querySelector(`input[name="header-mode"][value="${config.mode}"]`);
            if (radio) radio.checked = true;
        }
    }

    setHeaderMode(mode, save = true) {
        const logo = document.getElementById('header-logo');
        const textControls = document.getElementById('header-text-controls');

        if (mode === 'image-only') {
            // Hide Title
            if (logo) logo.style.display = 'none';
            // Hide Text Controls in Panel (Visual cue)
            if (textControls) textControls.classList.add('hidden');
        } else {
            // Show Title
            if (logo) logo.style.display = 'block';
            if (textControls) textControls.classList.remove('hidden');
        }

        if (save) {
            const config = JSON.parse(localStorage.getItem('mds_header_config') || '{}');
            config.mode = mode;
            localStorage.setItem('mds_header_config', JSON.stringify(config));
        }
    }

    setHeaderAlign(align) {
        document.getElementById('header-zone').style.justifyContent = align;

        // Save
        const config = JSON.parse(localStorage.getItem('mds_header_config') || '{}');
        config.align = align;
        localStorage.setItem('mds_header_config', JSON.stringify(config));
    }

    setHeaderBg(url = null) {
        // If url passed, use it. Else get from input.
        const inputVal = document.getElementById('header-bg-url').value.trim();
        const finalUrl = url || inputVal;

        const header = document.getElementById('header-zone');

        if (finalUrl) {
            header.style.backgroundImage = `url('${finalUrl}')`;
            header.style.backgroundSize = 'cover';
            header.style.backgroundPosition = 'center';
            // Update input if we came from upload
            document.getElementById('header-bg-url').value = finalUrl;
        } else {
            header.style.backgroundImage = '';
        }

        // Save
        const config = JSON.parse(localStorage.getItem('mds_header_config') || '{}');
        config.bg = finalUrl;
        localStorage.setItem('mds_header_config', JSON.stringify(config));
    }

    uploadHeaderBg() {
        const input = document.getElementById('header-bg-upload');
        if (input.files && input.files[0]) {
            const formData = new FormData();
            formData.append('mediaFile', input.files[0]);

            fetch('php/upload_media.php', {
                method: 'POST',
                body: formData
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        alert("Header Background Set!");
                        this.setHeaderBg(data.file_path); // Use the returned path
                    } else {
                        alert("Upload Failed: " + data.message);
                    }
                })
                .catch(err => {
                    console.error(err);
                    alert("Upload Error");
                });
        }
    }

    // --- Banner Customization (Image/GIF Only) ---
    loadBannerConfig() {
        const config = JSON.parse(localStorage.getItem('mds_banner_config') || '{}');
        const banner = document.getElementById('banner-zone');

        if (config.bg) {
            banner.style.backgroundImage = `url('${config.bg}')`;
            banner.style.backgroundRepeat = 'no-repeat';
            banner.style.backgroundSize = 'cover'; // Or 'contain' if they want full fit? Cover is safer for filling 16:4
            banner.style.backgroundPosition = 'center';
            banner.innerHTML = ''; // Ensure no text

            if (document.getElementById('banner-bg-url')) {
                document.getElementById('banner-bg-url').value = config.bg;
            }
        }
    }

    setBannerBg(url = null) {
        const inputVal = document.getElementById('banner-bg-url').value.trim();
        const finalUrl = url || inputVal;
        const banner = document.getElementById('banner-zone');

        if (finalUrl) {
            banner.style.backgroundImage = `url('${finalUrl}')`;
            banner.style.backgroundSize = 'cover';
            banner.style.backgroundPosition = 'center';
            banner.innerHTML = ''; // Remove any previous text content

            // Update input
            document.getElementById('banner-bg-url').value = finalUrl;
        } else {
            banner.style.backgroundImage = '';
        }

        // Save
        const config = JSON.parse(localStorage.getItem('mds_banner_config') || '{}');
        config.bg = finalUrl;
        localStorage.setItem('mds_banner_config', JSON.stringify(config));
    }

    uploadBannerBg() {
        const input = document.getElementById('banner-bg-upload');
        if (input.files && input.files[0]) {
            const formData = new FormData();
            formData.append('mediaFile', input.files[0]);

            fetch('php/upload_media.php', {
                method: 'POST',
                body: formData
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        alert("Banner Image Set!");
                        this.setBannerBg(data.file_path);
                    } else {
                        alert("Upload Failed: " + data.message);
                    }
                })
                .catch(err => {
                    console.error(err);
                    alert("Upload Error");
                });
        }
    }

    // --- Video Logic ---
    nextVideo() {
        if (this.currentMode !== 'video') {
            this.setMode('video'); // Switch to video mode if not already
        }

        this.currentVideoIndex = (this.currentVideoIndex + 1) % this.videoPlaylist.length;
        const newSrc = this.videoPlaylist[this.currentVideoIndex];

        const videoEl = document.getElementById('view-video');
        videoEl.src = newSrc;
        videoEl.play();

        // Brief toast or console log
        console.log("Playing video:", newSrc);
    }

    // ... (Clock and other inits remain) ...

    initClock() {
        // ... (Clock logic) ...
        const updateTime = () => {
            // ... (Time logic) ...
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
            const dateStr = now.toLocaleDateString('en-GB'); // DD/MM/YYYY

            // Main Display Clock
            const elClock = document.getElementById('clock-display');
            if (elClock) elClock.textContent = timeStr;

            const elDate = document.getElementById('date-display');
            if (elDate) elDate.textContent = dateStr;

            // Control Panel Clock
            const panelClock = document.getElementById('panel-clock-display');
            if (panelClock) panelClock.textContent = `${dateStr} ${timeStr}`;

            // Greeting Logic
            const hour = now.getHours();
            let greetingKey = 'morning';
            if (hour >= 12 && hour < 18) greetingKey = 'afternoon';
            if (hour >= 18) greetingKey = 'evening';

            // Get custom or default greeting
            const savedGreetings = JSON.parse(localStorage.getItem('mds_greetings') || '{}');
            const defaults = {
                morning: "Good Morning",
                afternoon: "Good Afternoon",
                evening: "Good Evening"
            };
            const greetingText = savedGreetings[greetingKey] || defaults[greetingKey];

            // Update Footer Greeting
            const greetingEl = document.getElementById('greeting');
            if (greetingEl && greetingEl.textContent !== greetingText) {
                greetingEl.textContent = greetingText;
            }
        };
        setInterval(updateTime, 1000);
        updateTime();

        // Initialize Quick Text List
        this.renderQuickTexts();

        // Load Saved Greetings into Inputs
        const savedGreetings = JSON.parse(localStorage.getItem('mds_greetings') || '{}');
        if (document.getElementById('edit-greet-morning')) document.getElementById('edit-greet-morning').value = savedGreetings.morning || '';
        if (document.getElementById('edit-greet-afternoon')) document.getElementById('edit-greet-afternoon').value = savedGreetings.afternoon || '';
        if (document.getElementById('edit-greet-evening')) document.getElementById('edit-greet-evening').value = savedGreetings.evening || '';
    }

    // --- Custom Greetings ---
    saveGreetings() {
        const greetings = {
            morning: document.getElementById('edit-greet-morning').value.trim(),
            afternoon: document.getElementById('edit-greet-afternoon').value.trim(),
            evening: document.getElementById('edit-greet-evening').value.trim()
        };
        localStorage.setItem('mds_greetings', JSON.stringify(greetings));
        alert('Greetings configuration saved!');
        // Force immediate update
        this.initClock();
    }

    // --- Quick Announcements ---
    addQuickText() {
        const input = document.getElementById('new-quick-text');
        const text = input.value.trim();
        if (!text) return;

        const texts = JSON.parse(localStorage.getItem('mds_quick_texts') || '[]');
        texts.push(text);
        localStorage.setItem('mds_quick_texts', JSON.stringify(texts));

        input.value = '';
        this.renderQuickTexts();
    }

    deleteQuickText(index) {
        const texts = JSON.parse(localStorage.getItem('mds_quick_texts') || '[]');
        texts.splice(index, 1);
        localStorage.setItem('mds_quick_texts', JSON.stringify(texts));
        this.renderQuickTexts();
    }

    showQuickText(text) {
        // Switch to text mode with this content
        this.setMode('text', text);
        alert('Displaying announcement: ' + text.substring(0, 20) + '...');
    }

    renderQuickTexts() {
        const listEl = document.getElementById('quick-text-list');
        if (!listEl) return;

        const texts = JSON.parse(localStorage.getItem('mds_quick_texts') || '[]');

        if (texts.length === 0) {
            listEl.innerHTML = '<div style="color:#666; font-size:0.8rem; font-style:italic;">No saved announcements</div>';
            return;
        }

        listEl.innerHTML = texts.map((text, idx) => `
            <div style="background:rgba(255,255,255,0.1); padding:8px; border-radius:4px; display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:0.9rem; margin-right:10px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:200px;">${text}</span>
                <div style="display:flex; gap:5px;">
                    <button class="btn-action" style="padding:2px 8px; font-size:0.7rem; background:#2980b9;" onclick="mds.showQuickText('${text.replace(/'/g, "\\'")}')">Show</button>
                    <button class="btn-action" style="padding:2px 8px; font-size:0.7rem; background:#c0392b;" onclick="mds.deleteQuickText(${idx})">×</button>
                </div>
            </div>
        `).join('');
    }

    // START initKeyboardShortcuts REPLACEMENT
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt + C: Toggle Control Panel
            if (e.altKey && (e.key.toLowerCase() === 'c' || e.code === 'KeyC')) {
                e.preventDefault();
                this.toggleControlPanel();
            }
            // Alt + X: Cycle Main Display Mode
            if (e.altKey && (e.key.toLowerCase() === 'x' || e.code === 'KeyX')) {
                e.preventDefault();
                this.cycleMode();
            }
            // Alt + N: Next Video
            if (e.altKey && (e.key.toLowerCase() === 'n' || e.code === 'KeyN')) {
                e.preventDefault();
                this.nextVideo();
            }
            // Alt + 1-9: Presets
            if (e.altKey && e.key >= '1' && e.key <= '9') {
                this.loadPreset(parseInt(e.key));
            }
        });
    }
    // END initKeyboardShortcuts REPLACEMENT

    cycleMode() {
        const modes = ['video', 'website', 'text', 'camera'];
        const currentIdx = modes.indexOf(this.currentMode);
        const nextIdx = (currentIdx + 1) % modes.length;
        const nextMode = modes[nextIdx];

        console.log(`Cycling from ${this.currentMode} to ${nextMode}`);

        // Prepare content for each mode
        let content = '';
        if (nextMode === 'text') {
            // Always provide default text
            const textEl = document.getElementById('view-text');
            const currentText = textEl?.textContent?.trim();
            content = currentText || 'Welcome to MDS Digital Signage';
            console.log('Text mode content:', content);
        } else if (nextMode === 'website') {
            content = 'https://www.google.com/webhp?igu=1';
        } else if (nextMode === 'slides') {
            // Pass empty to trigger automatic slideshow in setMode
            content = '';
        }

        this.setMode(nextMode, content);
        console.log("Cycled to: " + nextMode + " with content:", content);
    }

    toggleControlPanel() {
        const panel = document.getElementById('control-panel');
        if (panel) {
            const wasHidden = panel.classList.contains('hidden');
            if (wasHidden) {
                panel.classList.remove('hidden');
                // Refresh media list on open if easy
                this.refreshMediaList();
            } else {
                panel.classList.add('hidden');
            }
        }
    }

    switchTab(tabName) {
        // 1. Buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        // Find the button that clicked (trickier if not passed, but we can query by onclick text or just iterate)
        // Actually, let's just use the fact that the button called this. 
        // We will assume the UI state matches the logic.
        // A cleaner way is:
        const buttons = document.querySelectorAll('.tab-btn');
        // Simple mapping based on index or text? 
        // Let's iterate and match onclick attribute string for simplicity in this context
        buttons.forEach(btn => {
            if (btn.getAttribute('onclick').includes(tabName)) {
                btn.classList.add('active');
            }
        });

        // 2. Content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            if (content.id === `tab-${tabName}`) {
                content.classList.add('active');
            }
        });
    }

    /**
     * Helper to show input fields inside the cards
     */
    toggleInput(type) {
        // Hide all other inputs first
        document.querySelectorAll('.input-row').forEach(el => el.classList.add('hidden'));

        const inputDiv = document.getElementById(`input-${type}`);
        if (inputDiv) inputDiv.classList.remove('hidden');

        // Stop bubbling so it doesn't close anything else if we click card
        // (Handled by onclick event propagation stop in HTML)
    }

    submitMode(type) {
        const val = document.getElementById(`val-${type}`).value;
        this.setMode(type, val);
        this.toggleControlPanel(); // Close panel on submit
    }

    /**
     * Switch the Main Display Mode
     * @param {string} mode - 'video', 'website', 'text', 'camera', 'slides'
     * @param {string} source - URL, Text content, or Video Source
     */
    // --- Slideshow Logic ---
    startSlideshow() {
        this.stopSlideshow(); // Clear existing
        if (!this.imagePlaylist || this.imagePlaylist.length === 0) return;

        // Immediate show
        const showNext = () => {
            const slideEl = document.getElementById('view-slides');
            const randomImg = this.imagePlaylist[Math.floor(Math.random() * this.imagePlaylist.length)];
            if (slideEl) {
                slideEl.style.backgroundImage = `url('${randomImg}')`;
                slideEl.style.backgroundSize = 'cover';
                slideEl.style.backgroundPosition = 'center';
                // Optional: Add transition class if wanted
            }
        };

        // this.slideshowInterval is stored on instance
        this.slideshowInterval = setInterval(showNext, 5000); // 5 seconds
        showNext(); // Run immediately
    }

    stopSlideshow() {
        if (this.slideshowInterval) {
            clearInterval(this.slideshowInterval);
            this.slideshowInterval = null;
        }
    }

    // --- Sidebar Slideshow Logic ---
    startSidebarSlideshow() {
        // Independent from main slideshow
        const imgEl = document.querySelector('#sidebar-image img');
        if (!imgEl || this.imagePlaylist.length === 0) return;

        let sidebarIndex = 0;

        setInterval(() => {
            sidebarIndex = (sidebarIndex + 1) % this.imagePlaylist.length;
            const nextImg = this.imagePlaylist[sidebarIndex];

            // Simple fade effect could be added here via CSS classes
            imgEl.style.opacity = '0.5';
            setTimeout(() => {
                imgEl.src = nextImg;
                imgEl.onload = () => { imgEl.style.opacity = '1'; };
            }, 200);

        }, 7000); // Rotate every 7 seconds
    }

    setMode(mode, source = '') {
        console.log(`Switching to mode: ${mode}`);

        // 1. Hide all
        document.querySelectorAll('#main-zone .content-wrapper').forEach(el => {
            el.classList.add('hidden-mode');
            el.classList.remove('active-mode');
        });

        // 2. Stop Camera & Slideshow
        this.stopCamera();
        this.stopSlideshow();

        // 3. Activate specific
        switch (mode) {
            case 'video':
                const videoEl = document.getElementById('view-video');
                if (videoEl) {
                    videoEl.classList.remove('hidden-mode');
                    videoEl.classList.add('active-mode');
                    videoEl.play().catch(e => console.log("Autoplay blocked"));
                }
                break;

            case 'website':
                const iframe = document.getElementById('view-website');
                if (iframe) {
                    // Use proxy if configured
                    iframe.src = `proxy.php?url=${encodeURIComponent(source)}`;
                    iframe.classList.remove('hidden-mode');
                    iframe.classList.add('active-mode');
                }
                break;

            case 'text':
                const textEl = document.getElementById('view-text');
                if (textEl) {
                    const displayText = source || "Welcome to MDS Digital Signage";

                    // SCROLLING LOGIC
                    textEl.innerHTML = ''; // Clear raw text
                    textEl.classList.remove('hidden-mode');
                    textEl.classList.add('active-mode');

                    // Create scroll wrapper
                    const wrapper = document.createElement('div');
                    wrapper.className = 'text-scroll-wrapper';

                    // Create content blocks (Double for loop)
                    const contentDiv1 = document.createElement('div');
                    contentDiv1.className = 'text-scroll-content';
                    contentDiv1.textContent = displayText;

                    const contentDiv2 = document.createElement('div');
                    contentDiv2.className = 'text-scroll-content';
                    contentDiv2.textContent = displayText;

                    wrapper.appendChild(contentDiv1);
                    wrapper.appendChild(contentDiv2);
                    textEl.appendChild(wrapper);

                    console.log('Text mode activated with scrolling:', displayText);
                }
                break;

            case 'camera':
                const camEl = document.getElementById('view-camera');
                if (camEl) {
                    camEl.classList.remove('hidden-mode');
                    camEl.classList.add('active-mode');
                    this.startCamera(camEl);
                }
                break;

            case 'slides':
                const slideEl = document.getElementById('view-slides');
                if (slideEl) {
                    slideEl.classList.remove('hidden-mode');
                    slideEl.classList.add('active-mode');

                    // If source is provided (clicked file), just show that.
                    // If source is empty, or we want playlist, start slideshow.
                    // For now, if source is explicitly passed, maybe pause slideshow?
                    // User request: "rotate to other image smoothly" implies slideshow.
                    // Let's assume 'slides' mode generally implies slideshow unless overridden.

                    if (source) {
                        // Single image override
                        slideEl.style.backgroundImage = `url('${source}')`;
                        slideEl.style.backgroundSize = 'cover';
                        slideEl.style.backgroundPosition = 'center';
                    } else {
                        // Start Playlist
                        this.startSlideshow();
                    }
                }
                break;
        }

        this.currentMode = mode;
    }

    startCamera(videoElement) {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    videoElement.srcObject = stream;
                    this.cameraStream = stream;
                })
                .catch(err => {
                    console.error("Camera Error:", err);
                    alert("Camera access denied or unavailable.");
                });
        }
    }

    stopCamera() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
    }

    // --- Personal Media Logic ---
    handleUpload(input) {
        if (input.files && input.files[0]) {
            const formData = new FormData();
            formData.append('mediaFile', input.files[0]);

            fetch('php/upload_media.php', {
                method: 'POST',
                body: formData
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        alert("Upload Successful!");
                        this.refreshMediaList();
                    } else {
                        alert("Upload Failed: " + data.message);
                    }
                })
                .catch(err => console.error(err));
        }
    }

    refreshMediaList() {
        const container = document.getElementById('media-list');
        container.innerHTML = '<div style="color:#888;">Loading...</div>';

        fetch('php/upload_media.php')
            .then(res => res.json())
            .then(data => {
                container.innerHTML = '';
                if (data.success && data.files.length > 0) {
                    data.files.forEach(file => {
                        const div = document.createElement('div');
                        div.className = 'media-item';
                        div.style.cssText = 'background: #222; padding: 5px; border-radius: 4px; cursor: pointer; border: 1px solid #444; overflow: hidden; font-size: 0.8rem; text-align: center;';
                        div.textContent = file.name;
                        div.onclick = () => this.playMedia(file.path, file.name);
                        container.appendChild(div);
                    });
                } else {
                    container.innerHTML = '<div style="color: #666; font-size: 0.9rem;">No media found.</div>';
                }
            });
    }

    playMedia(path, name) {
        // Determine type by extension
        const ext = name.split('.').pop().toLowerCase();

        if (['mp4', 'webm'].includes(ext)) {
            // It's a video
            const videoEl = document.getElementById('view-video');
            videoEl.querySelector('source').src = path;
            videoEl.load();
            this.setMode('video');
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
            // It's an image -> Use Slides Container or a new Image container?
            // Re-using slides container for single image for now
            const slideEl = document.getElementById('view-slides');
            slideEl.style.backgroundImage = `url('${path}')`;
            this.setMode('slides'); // Need to ensure 'slides' case exists in setMode
        } else {
            alert("Preview not supported for this file type yet.");
        }
        this.toggleControlPanel();
    }

    // --- Generic Content List Logic ---

    // Initialize all lists on load
    initLists() {
        ['header', 'banner', 'ticker', 'text', 'notice'].forEach(type => this.renderList(type));
    }

    // Add simple text item (Header, Banner, Ticker, Text Mode)
    addItem(type) {
        let inputId = `edit-${type}`;
        if (type === 'text') inputId = 'new-quick-text';

        const input = document.getElementById(inputId);
        const val = input.value.trim();
        if (!val) return;

        const listKey = `mds_list_${type}`;
        const items = JSON.parse(localStorage.getItem(listKey) || '[]');
        items.push(val);
        localStorage.setItem(listKey, JSON.stringify(items));

        input.value = '';
        this.renderList(type);
    }

    // Add complex Notice item
    addNoticeItem() {
        const titleInput = document.getElementById('edit-notice-title');
        const bodyInput = document.getElementById('edit-notice-body');
        const title = titleInput.value.trim();
        const body = bodyInput.value.trim();

        if (!title || !body) return;

        const items = JSON.parse(localStorage.getItem('mds_list_notice') || '[]');
        items.push({ title, body });
        localStorage.setItem('mds_list_notice', JSON.stringify(items));

        titleInput.value = '';
        bodyInput.value = '';
        this.renderList('notice');
    }

    deleteItem(type, index) {
        const listKey = `mds_list_${type}`;
        const items = JSON.parse(localStorage.getItem(listKey) || '[]');
        items.splice(index, 1);
        localStorage.setItem(listKey, JSON.stringify(items));
        this.renderList(type);
    }

    // Apply the item to the live display
    applyItem(type, value) {
        const val = (typeof value === 'object') ? value : String(value);

        switch (type) {
            case 'header':
                document.getElementById('header-logo').textContent = val;
                break;
            case 'banner':
                const banner = document.getElementById('banner-zone');
                // Check if it looks like HTML (grad) or plain text
                if (val.includes('<') && val.includes('>')) {
                    banner.innerHTML = val;
                } else {
                    banner.innerHTML = `<h2 style="color: var(--text-secondary);">${val}</h2>`;
                }
                break;
            case 'ticker':
                document.getElementById('ticker-content').innerHTML = `<span class="ticker-item">${val}</span>`;
                break;
            case 'text':
                this.setMode('text', val);
                break;
            case 'notice':
                // value is { title, body }
                const container = document.getElementById('notice-scroll-wrap');
                if (container) {
                    // 1. Recover Unique List from potentially doubled DOM
                    const existing = Array.from(container.querySelectorAll('.notice-item'));
                    let uniqueItems = [];

                    // Check if perfectly doubled (heuristic for our scroller)
                    const half = existing.length / 2;
                    let isDoubled = false;
                    if (existing.length > 0 && existing.length % 2 === 0) {
                        isDoubled = true;
                        for (let i = 0; i < half; i++) { // Check content equality
                            if (existing[i].innerHTML !== existing[i + half].innerHTML) {
                                isDoubled = false;
                                break;
                            }
                        }
                    }

                    if (isDoubled) {
                        uniqueItems = existing.slice(0, half);
                    } else {
                        uniqueItems = existing;
                    }

                    // 2. Create New Item
                    const newDiv = document.createElement('div');
                    newDiv.className = 'notice-item';
                    newDiv.innerHTML = `
                        <div class="notice-title" style="white-space: pre-wrap;">${val.title}</div>
                        <div class="notice-body" style="white-space: pre-wrap;">${val.body}</div>
                     `;

                    // 3. Add to top
                    // We need to work with nodes or HTML strings. Using clones is safer.
                    // But 'newDiv' is a node. 'uniqueItems' are nodes.
                    // Let's modify uniqueItems array.
                    uniqueItems.unshift(newDiv);

                    // 4. Re-render Doubled List
                    container.innerHTML = '';

                    // Set A
                    uniqueItems.forEach(node => {
                        container.appendChild(node.cloneNode(true));
                    });
                    // Set B (Clone)
                    uniqueItems.forEach(node => {
                        container.appendChild(node.cloneNode(true));
                    });
                }
                alert('Notice Pushed to Screen!');
                this.renderActiveNotices(); // Refresh admin list
                break;
            case 'footer':
                if (window.userRole !== 'admin') return;
                document.getElementById('copyright-display').innerHTML = `&copy; ${new Date().getFullYear()} ${val}`;
                break;
        }

    }

    editItem(type, index) {
        const listKey = `mds_list_${type}`;
        const items = JSON.parse(localStorage.getItem(listKey) || '[]');
        const item = items[index];

        if (!item) return;

        // Populate Input
        if (type === 'notice') {
            document.getElementById('edit-notice-title').value = item.title;
            document.getElementById('edit-notice-body').value = item.body;
        } else if (type === 'text') {
            document.getElementById('new-quick-text').value = item;
        } else {
            document.getElementById(`edit-${type}`).value = item;
        }

        // Remove from list (User must click 'Add' to save changes)
        // Check if user wants to keep original? usually 'Edit' implies modification.
        // Let's remove it so they don't get duplicates.
        items.splice(index, 1);
        localStorage.setItem(listKey, JSON.stringify(items));
        this.renderList(type);

        // Feedback
        // alert(`Loaded '${type}' for editing.`);
    }

    renderList(type) {
        const container = document.getElementById(`list-${type}`);
        if (!container) return;

        const listKey = `mds_list_${type}`;
        const items = JSON.parse(localStorage.getItem(listKey) || '[]');

        if (items.length === 0) {
            container.innerHTML = '<div style="color:#666; font-size:0.8rem;">No saved items</div>';
            return;
        }

        container.innerHTML = items.map((item, idx) => {
            // Visualize item differently if object (Notice)
            let displayLabel = item;
            let valString = JSON.stringify(item).replace(/"/g, '&quot;');

            if (type === 'notice') {
                displayLabel = `<b>${item.title}</b>: ${item.body}`;
            }

            return `
            <div style="background:rgba(255,255,255,0.1); padding:8px; border-radius:4px; display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                <span style="font-size:0.9rem; margin-right:10px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:200px;">
                    ${displayLabel}
                </span>
                <div style="display:flex; gap:5px;">
                    <button class="btn-action" style="padding:2px 8px; font-size:0.7rem; background:#2980b9;" 
                        onclick='mds.applyItem("${type}", ${valString})' title="Show on Screen">Show</button>
                    <button class="btn-action" style="padding:2px 8px; font-size:0.7rem; background:#f39c12;" 
                        onclick="mds.editItem('${type}', ${idx})" title="Edit">✎</button>
                    <button class="btn-action" style="padding:2px 8px; font-size:0.7rem; background:#c0392b;" 
                        onclick="mds.deleteItem('${type}', ${idx})" title="Delete">×</button>
                </div>
            </div>`;
        }).join('');
    }

    // Kept for backward compatibility if needed, but mainly replaced
    updateContent(target) {
        // Fallback for Footer or other direct edits
        const val = document.getElementById(`edit-${target}`)?.value;
        if (val) this.applyItem(target, val);
    }

    // Edit existing notice - populate control panel inputs
    editNotice(buttonElement) {
        const noticeItem = buttonElement.closest('.notice-item');
        const title = noticeItem.querySelector('.notice-title').textContent;
        const body = noticeItem.querySelector('.notice-body').textContent;

        // Open control panel if not already open
        const panel = document.getElementById('control-panel');
        if (panel.classList.contains('hidden')) {
            this.toggleControlPanel();
        }

        // Switch to Edit Content tab
        this.switchTab('content');

        // Populate inputs
        document.getElementById('edit-notice-title').value = title;
        document.getElementById('edit-notice-body').value = body;

        // Remove the old notice
        noticeItem.remove();

        alert('Notice loaded into editor. Edit and click "Add Notice" to update.');
    }

    // Delete notice from sidebar
    deleteNoticeElement(buttonElement) {
        if (confirm('Delete this notice?')) {
            const noticeItem = buttonElement.closest('.notice-item');
            noticeItem.remove();
        }
    }

    initNoticeScroller() {
        const zone = document.getElementById('sidebar-notices');
        if (!zone) return;

        // Wrap existing notices in the scroll container if not already
        let container = zone.querySelector('.notice-scroll-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notice-scroll-container';
            container.id = 'notice-scroll-wrap';

            // Move children
            while (zone.firstChild) {
                container.appendChild(zone.firstChild);
            }
            zone.appendChild(container);

            container.innerHTML += container.innerHTML;
        }
    }

    // --- Bulk Import / Export Logic ---
    downloadTemplate() {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Type,Content,Extra(Body for Notices)\n"
            + "header,Example Header Title,\n"
            + "banner,Example Banner Text,\n"
            + "ticker,Example News Ticker Message,\n"
            + "text,Example Quick Announcement,\n"
            + "notice,Example Notice Title,This is the body of the notice.\n";

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "mds_content_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    importContent() {
        const fileInput = document.getElementById('import-file');
        const file = fileInput.files[0];

        if (!file) {
            alert("Please select a CSV file first.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const rows = text.split('\n');
            let count = 0;

            rows.forEach((row, index) => {
                if (index === 0) return; // Skip header

                // Simple CSV parsing (assuming no commas in content for now, or use Regex)
                // Better regex for CSV: /,(?=(?:(?:[^"]*"){2})*[^"]*$)/
                const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, ''));

                if (cols.length < 2) return;

                const type = cols[0].toLowerCase();
                const content = cols[1];
                const extra = cols[2] || '';

                if (!content) return;

                if (['header', 'banner', 'ticker', 'text'].includes(type)) {
                    const listKey = `mds_list_${type}`;
                    const items = JSON.parse(localStorage.getItem(listKey) || '[]');
                    items.push(content);
                    localStorage.setItem(listKey, JSON.stringify(items));
                    count++;
                }
                else if (type === 'notice') {
                    const items = JSON.parse(localStorage.getItem('mds_list_notice') || '[]');
                    items.push({ title: content, body: extra });
                    localStorage.setItem('mds_list_notice', JSON.stringify(items));
                    count++;
                }
            });

            this.initLists(); // Refresh UI
            alert(`Successfully imported ${count} items!`);
            fileInput.value = ''; // Reset input
        };
        reader.readAsText(file);
    }

    // --- Active Notice Management (Live DOM) ---

    renderActiveNotices() {
        const container = document.getElementById('list-active-notices');
        const noticeWrap = document.getElementById('notice-scroll-wrap') || document.getElementById('sidebar-notices');

        if (!container || !noticeWrap) return;

        // Get all notices (including clones from scrolling logic)
        const notices = Array.from(noticeWrap.querySelectorAll('.notice-item'));

        // Deduplicate for display
        const uniqueNotices = [];
        const signatures = new Set();

        notices.forEach(n => {
            const title = n.querySelector('.notice-title')?.textContent || '';
            const body = n.querySelector('.notice-body')?.textContent || '';
            const sig = title + '|' + body;

            if (!signatures.has(sig)) {
                signatures.add(sig);
                uniqueNotices.push({ title, body });
            }
        });

        if (uniqueNotices.length === 0) {
            container.innerHTML = '<div style="color:#666; font-size:0.8rem;">No active notices</div>';
            return;
        }

        container.innerHTML = uniqueNotices.map((item, idx) => {
            const shortBody = item.body.length > 30 ? item.body.substring(0, 30) + '...' : item.body;
            // Use idx (which corresponds to unique list) for actions
            return `
            <div style="background:rgba(76, 209, 55, 0.1); padding:8px; border-radius:4px; display:flex; justify-content:space-between; align-items:center; border:1px solid rgba(76, 209, 55, 0.2);">
                <div style="font-size:0.85rem; color:#ddd; overflow:hidden;">
                    <div style="font-weight:bold; color:#4cd137;">${item.title}</div>
                    <div style="font-size:0.75rem; color:#aaa;">${shortBody}</div>
                </div>
                <div style="display:flex; gap:5px;">
                    <button class="btn-action" style="padding:2px 8px; font-size:0.7rem; background:#2980b9;" 
                        onclick="mds.editActiveNotice(${idx})">✎</button>
                    <button class="btn-action" style="padding:2px 8px; font-size:0.7rem; background:#c0392b;" 
                        onclick="mds.deleteActiveNotice(${idx})">×</button>
                </div>
            </div>`;
        }).join('');
    }

    deleteActiveNotice(uniqueIndex) {
        const noticeWrap = document.getElementById('notice-scroll-wrap') || document.getElementById('sidebar-notices');
        if (!noticeWrap) return;

        // Re-construct unique list to identify target
        const notices = Array.from(noticeWrap.querySelectorAll('.notice-item'));
        const uniqueNotices = [];
        const signatures = new Set();

        notices.forEach(n => {
            const title = n.querySelector('.notice-title')?.textContent || '';
            const body = n.querySelector('.notice-body')?.textContent || '';
            const sig = title + '|' + body;
            if (!signatures.has(sig)) {
                signatures.add(sig);
                uniqueNotices.push({ title, body });
            }
        });

        const target = uniqueNotices[uniqueIndex];
        if (!target) return;

        if (confirm("Remove this live notice?")) {
            // Remove ALL instances (original + clones) matching the target
            let removedCount = 0;
            notices.forEach(n => {
                const title = n.querySelector('.notice-title')?.textContent || '';
                const body = n.querySelector('.notice-body')?.textContent || '';
                if (title === target.title && body === target.body) {
                    n.remove();
                    removedCount++;
                }
            });
            this.renderActiveNotices(); // Refresh list
        }
    }

    editActiveNotice(uniqueIndex) {
        const noticeWrap = document.getElementById('notice-scroll-wrap') || document.getElementById('sidebar-notices');
        if (!noticeWrap) return;

        // Re-construct unique list
        const notices = Array.from(noticeWrap.querySelectorAll('.notice-item'));
        const uniqueNotices = [];
        const signatures = new Set();

        notices.forEach(n => {
            const title = n.querySelector('.notice-title')?.textContent || '';
            const body = n.querySelector('.notice-body')?.textContent || '';
            const sig = title + '|' + body;
            if (!signatures.has(sig)) {
                signatures.add(sig);
                uniqueNotices.push({ title, body });
            }
        });

        const target = uniqueNotices[uniqueIndex];
        if (target) {
            document.getElementById('edit-notice-title').value = target.title;
            document.getElementById('edit-notice-body').value = target.body;

            // Remove ALL instances from live (like cut & paste)
            notices.forEach(n => {
                const title = n.querySelector('.notice-title')?.textContent || '';
                const body = n.querySelector('.notice-body')?.textContent || '';
                if (title === target.title && body === target.body) {
                    n.remove();
                }
            });

            this.renderActiveNotices(); // Refresh list
            alert("Notice loaded into editor. Make changes and click 'Add Notice' to repost.");
        }
    }

    // Switch Sub-Pages in Content Tab
    switchContentPage(pageId) {
        // Toggle Buttons
        document.querySelectorAll('.subtab-btn').forEach(btn => btn.classList.remove('active'));
        // Find button with specific onclick - simplistically found by text or rebuild properly
        // Actually, we can just query by attribute if we added one, or loop to match onclick text.
        // Easier: add 'data-target' to buttons in PHP and select by that.
        // For now, let's just select by index? No, order might change.
        // Let's rely on the onclick updating the class 'active' on 'this' if we passed 'this'.
        // But we didn't pass 'this'. 
        // Let's iterate buttons in order: Header, Banner, Ticker, Notice, Text
        const map = ['header', 'banner', 'ticker', 'notice', 'text'];
        const btnIndex = map.indexOf(pageId);
        const buttons = document.querySelectorAll('.subtab-btn');
        if (buttons[btnIndex]) buttons[btnIndex].classList.add('active');

        // Toggle Pages
        document.querySelectorAll('.content-page').forEach(page => page.classList.remove('active'));
        document.querySelectorAll('.content-page').forEach(page => page.classList.add('hidden')); // ensure hidden

        const target = document.getElementById(`page-${pageId}`);
        if (target) {
            target.classList.remove('hidden');
            target.classList.add('active');
        }

        // Refresh specific things if needed
        if (pageId === 'notice') {
            this.renderActiveNotices();
        }
    }

    // Override switchTab to refresh active notices when entering content tab
    switchTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

        document.getElementById(`tab-${tabName}`).classList.add('active');

        // Find visible tab button and set active (simple approximation)
        // In real app, 'this' would be cleaner.
        // Let's iterate tabs to set visual state
        const tabs = ['modes', 'content', 'media', 'presets', 'system'];
        const tabBtns = document.querySelectorAll('.panel-tabs .tab-btn');
        const idx = tabs.indexOf(tabName);
        if (tabBtns[idx]) tabBtns[idx].classList.add('active');

        if (tabName === 'content') {
            // Default to header if no active sub-page, or keep last?
            // Let's default to 'header' for clean state
            this.switchContentPage('header');
        }
    }

    // --- Preset Logic ---
    savePreset(slot) {
        // Collect comprehensive state
        const state = {
            mode: this.currentMode,
            header: document.getElementById('header-logo').textContent,
            banner: document.querySelector('#banner-zone h2')?.textContent || '',
            ticker: document.getElementById('ticker-content').innerHTML,
            footer: document.getElementById('copyright-display').textContent,
            // Save content based on current mode
            textContent: document.getElementById('view-text')?.textContent || '',
            websiteUrl: document.getElementById('view-website')?.src || '',
            videoSrc: document.getElementById('view-video')?.src || ''
        };

        // Store in localStorage
        localStorage.setItem(`mds_preset_${slot}`, JSON.stringify(state));
        console.log("Saving State to Preset", slot, state);
        alert(`✓ Layout saved to Preset ${slot}`);
    }

    loadPreset(slot) {
        // Retrieve from localStorage
        const saved = localStorage.getItem(`mds_preset_${slot}`);

        if (!saved) {
            alert(`⚠ Preset ${slot} is empty. Save a layout first.`);
            return;
        }

        try {
            const state = JSON.parse(saved);
            console.log("Loading Preset", slot, state);

            // Restore header/banner/ticker/footer
            document.getElementById('header-logo').textContent = state.header || 'MDS';
            const banner = document.getElementById('banner-zone');
            if (state.banner) {
                banner.innerHTML = `<h2 style="color: var(--text-secondary);">${state.banner}</h2>`;
            }
            document.getElementById('ticker-content').innerHTML = state.ticker || '';

            // Restore footer (only if admin - frontend check)
            if (window.userRole === 'admin' && state.footer) {
                document.getElementById('copyright-display').innerHTML = state.footer;
            }

            // Restore mode with appropriate content
            let content = '';
            if (state.mode === 'text') {
                content = state.textContent;
            } else if (state.mode === 'website') {
                content = state.websiteUrl;
            } else if (state.mode === 'video') {
                content = state.videoSrc;
            }

            this.setMode(state.mode, content);
            alert(`✓ Preset ${slot} loaded`);

        } catch (e) {
            console.error('Error loading preset:', e);
            alert(`✗ Error loading Preset ${slot}`);
        }
    }
}

// Start when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.mds = new MDSDisplay();
});
