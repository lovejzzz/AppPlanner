document.addEventListener('DOMContentLoaded', () => {
    // ===== State =====
    const state = {
        idea: '',
        ideaElaborated: '',
        answers: {},
        currentStep: -1, // -1 = elaboration step
        complete: false
    };

    // ===== Templates Library =====
    const TEMPLATES = [
        { cat: 'business', label: 'SaaS Dashboard', idea: 'A SaaS dashboard with team management, billing, and analytics' },
        { cat: 'business', label: 'E-commerce Store', idea: 'An e-commerce store selling handmade crafts with cart and checkout' },
        { cat: 'business', label: 'Invoice Generator', idea: 'An invoice and estimate generator for freelancers with PDF export and payment tracking' },
        { cat: 'business', label: 'CRM Tool', idea: 'A lightweight CRM to track leads, deals, and customer conversations' },
        { cat: 'social', label: 'Social Video App', idea: 'A mobile-first social app for sharing short video clips with friends' },
        { cat: 'social', label: 'Community Forum', idea: 'A community discussion forum with categories, upvotes, and user profiles' },
        { cat: 'social', label: 'Event Platform', idea: 'An event planning platform where users can create, share, and RSVP to local events' },
        { cat: 'creative', label: 'Portfolio Site', idea: 'A personal portfolio site with blog, project gallery, and contact form' },
        { cat: 'creative', label: 'Recipe Book', idea: 'A personal recipe book app where users save, tag, and share their favorite recipes' },
        { cat: 'creative', label: 'Mood Board', idea: 'A visual mood board tool for designers to collect and arrange inspiration images' },
        { cat: 'utility', label: 'Habit Tracker', idea: 'A daily habit tracker with streaks, stats, and gentle reminders' },
        { cat: 'utility', label: 'Budget Planner', idea: 'A personal budget planner that categorizes expenses and shows monthly trends' },
        { cat: 'utility', label: 'Bookmark Manager', idea: 'A bookmark manager with tags, search, and link preview screenshots' },
        { cat: 'utility', label: 'Note Taking App', idea: 'A markdown-based note taking app with folders, tags, and full-text search' },
    ];

    // ===== Auto-save Draft =====
    const DRAFT_KEY = 'app-planner-draft';

    function saveDraft() {
        if (!state.idea) return;
        const draft = {
            idea: state.idea,
            ideaElaborated: state.ideaElaborated,
            answers: { ...state.answers },
            currentStep: state.currentStep,
            complete: state.complete,
            ts: Date.now()
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }

    function loadDraft() {
        try {
            const raw = localStorage.getItem(DRAFT_KEY);
            if (!raw) return null;
            const draft = JSON.parse(raw);
            // Discard drafts older than 24 hours
            if (Date.now() - draft.ts > 24 * 60 * 60 * 1000) {
                clearDraft();
                return null;
            }
            return draft;
        } catch { return null; }
    }

    function clearDraft() {
        localStorage.removeItem(DRAFT_KEY);
    }

    // ===== Context Intelligence =====
    const CONTEXT_HINTS = {
        platform: {
            'web': 'Web App', 'website': 'Web App', 'site': 'Web App', 'browser': 'Web App',
            'mobile': 'Mobile App', 'phone': 'Mobile App', 'ios': 'Mobile App', 'android': 'Mobile App',
            'desktop': 'Desktop App', 'windows': 'Desktop App', 'mac': 'Desktop App',
            'api': 'API / Backend', 'backend': 'API / Backend', 'service': 'API / Backend',
            'extension': 'Chrome Extension', 'chrome': 'Chrome Extension', 'plugin': 'Chrome Extension'
        },
        vibe: {
            'fun': 'Playful & Colorful', 'silly': 'Playful & Colorful', 'game': 'Playful & Colorful',
            'kid': 'Playful & Colorful', 'child': 'Playful & Colorful', 'cartoon': 'Playful & Colorful',
            'playful': 'Playful & Colorful', 'colorful': 'Playful & Colorful',
            'minimal': 'Minimal & Clean', 'clean': 'Minimal & Clean', 'simple': 'Minimal & Clean',
            'dark': 'Dark & Techy', 'hacker': 'Dark & Techy', 'terminal': 'Dark & Techy', 'dev': 'Dark & Techy',
            'business': 'Corporate & Professional', 'corporate': 'Corporate & Professional', 'enterprise': 'Corporate & Professional',
            'retro': 'Retro / Nostalgic', 'vintage': 'Retro / Nostalgic', 'pixel': 'Retro / Nostalgic', '90s': 'Retro / Nostalgic'
        },
        auth: {
            'login': 'Email & Password', 'account': 'Email & Password', 'sign': 'Email & Password',
            'social': 'Google / Social Login', 'google': 'Google / Social Login', 'oauth': 'Google / Social Login',
            'no auth': 'No Auth Needed', 'public': 'No Auth Needed', 'anonymous': 'No Auth Needed',
            'simple': 'No Auth Needed', 'static': 'No Auth Needed'
        },
        stack: {
            'react': 'React + Node', 'node': 'React + Node',
            'next': 'Next.js + Supabase', 'supabase': 'Next.js + Supabase', 'vercel': 'Next.js + Supabase',
            'vue': 'Vue + Firebase', 'firebase': 'Vue + Firebase',
            'python': 'Python + Django', 'django': 'Python + Django', 'flask': 'Python + Django',
            'swift': 'Swift / Kotlin Native', 'kotlin': 'Swift / Kotlin Native', 'native': 'Swift / Kotlin Native',
            'html': 'HTML + CSS + JS', 'vanilla': 'HTML + CSS + JS', 'static': 'HTML + CSS + JS'
        }
    };

    function getRecommendation(questionId) {
        const hints = CONTEXT_HINTS[questionId];
        if (!hints) return null;
        const text = (state.idea + ' ' + state.ideaElaborated).toLowerCase();
        for (const [keyword, value] of Object.entries(hints)) {
            if (text.includes(keyword)) return value;
        }
        return null;
    }

    // ===== Question Engine =====
    const QUESTIONS = [
        {
            id: 'platform',
            question: 'What kind of app is this?',
            type: 'chips',
            options: ['Web App', 'Mobile App', 'Desktop App', 'API / Backend', 'Chrome Extension', 'HTML + CSS + JS'],
            suggestion: 'Pick the primary platform.',
            specSection: 'Platform',
            specRender: v => `<span class="spec-tag spec-tag-accent">${escapeHtml(v)}</span>`
        },
        {
            id: 'audience',
            question: 'Who is this for?',
            type: 'chips',
            options: ['Everyone', 'Kids / Teens', 'Students', 'Developers', 'Professionals', 'Small Business Owners', 'Creators / Artists'],
            customOption: true,
            customPlaceholder: 'e.g. busy parents, fitness enthusiasts...',
            suggestion: 'Be specific — it helps the AI tailor the UX.',
            specSection: 'Target Audience',
            specRender: v => escapeHtml(Array.isArray(v) ? v.join(', ') : v)
        },
        {
            id: 'vibe',
            question: 'What\'s the design vibe?',
            type: 'chips',
            options: ['Minimal & Clean', 'Playful & Colorful', 'Dark & Techy', 'Corporate & Professional', 'Retro / Nostalgic'],
            customOption: true,
            customPlaceholder: 'e.g. cozy & warm, futuristic, hand-drawn...',
            specSection: 'Design',
            specRender: v => `<span class="spec-tag spec-tag-green">${escapeHtml(v)}</span>`
        },
        {
            id: 'features',
            question: 'What are the key features? Pick all that apply.',
            type: 'chips',
            multi: true,
            options: ['User Accounts', 'Dashboard', 'Payments / Billing', 'Social Features', 'Search', 'Notifications', 'File Upload', 'Chat / Messaging', 'Analytics', 'Admin Panel', 'AI Integration', 'Animations'],
            suggestion: 'Select the ones that matter most.',
            specSection: 'Core Features',
            specRender: v => {
                const items = Array.isArray(v) ? v : [v];
                return '<ul>' + items.map(i => `<li>${escapeHtml(i)}</li>`).join('') + '</ul>';
            }
        },
        {
            id: 'features_custom',
            question: 'Any app-specific features?',
            type: 'chips',
            options: ['Maps / Location', 'Camera / Photo', 'Calendar / Scheduling', 'Reviews / Ratings', 'Sharing / Invites', 'Import / Export Data', 'Gamification / Points', 'Dark Mode'],
            multi: true,
            customOption: true,
            customPlaceholder: 'e.g. recipe import from URL, meal plan generator...',
            suggestion: 'Pick relevant ones or type your own. Skip if covered above.',
            specSection: 'Custom Features',
            specRender: v => {
                if (Array.isArray(v)) return '<ul>' + v.map(i => `<li>${escapeHtml(i)}</li>`).join('') + '</ul>';
                return escapeHtml(v);
            }
        },
        {
            id: 'auth',
            question: 'How should users sign in?',
            type: 'chips',
            options: ['Email & Password', 'Google / Social Login', 'Magic Link', 'No Auth Needed'],
            specSection: 'Authentication',
            specRender: v => `<span class="spec-tag spec-tag-accent">${escapeHtml(v)}</span>`
        },
        {
            id: 'stack',
            question: 'Any tech stack preference?',
            type: 'chips',
            options: ['React + Node', 'Next.js + Supabase', 'Vue + Firebase', 'Python + Django', 'Swift / Kotlin Native', 'HTML + CSS + JS', 'Let AI Decide'],
            customOption: true,
            customPlaceholder: 'e.g. SvelteKit + PocketBase, Rails, Go...',
            suggestion: 'If unsure, "Let AI Decide" is great.',
            specSection: 'Tech Stack',
            specRender: v => `<span class="spec-tag spec-tag-orange">${escapeHtml(v)}</span>`
        },
        {
            id: 'data',
            question: 'What data does the app manage?',
            type: 'chips',
            options: ['User Profiles', 'Posts / Content', 'Products / Inventory', 'Messages / Chats', 'Files / Media', 'Transactions / Orders', 'Events / Schedules', 'No Data / Minimal'],
            multi: true,
            customOption: true,
            customPlaceholder: 'e.g. workout logs, recipes, sensor data...',
            suggestion: 'Pick the main data types users will create or view.',
            specSection: 'Data Model',
            specRender: v => {
                if (Array.isArray(v)) return v.map(i => `<span class="spec-tag spec-tag-accent">${escapeHtml(i)}</span>`).join(' ');
                return escapeHtml(v);
            }
        },
        {
            id: 'scope',
            question: 'What\'s the scope for the first version?',
            type: 'chips',
            options: ['Quick Prototype (1-2 days)', 'MVP (1-2 weeks)', 'Full Product (1-3 months)', 'Just Exploring'],
            specSection: 'Scope',
            specRender: v => `<span class="spec-tag spec-tag-green">${escapeHtml(v)}</span>`
        },
        {
            id: 'extras',
            question: 'Anything else the AI should know?',
            type: 'chips',
            options: ['Must Work Offline', 'Needs Dark Mode', 'Accessibility Focus', 'Multi-language / i18n', 'Beautiful Animations', 'Fast & Lightweight', 'SEO Friendly'],
            multi: true,
            customOption: true,
            customPlaceholder: 'e.g. should look like Linear, needs to handle 10k users...',
            suggestion: 'Pick constraints or type your own.',
            specSection: 'Additional Notes',
            specRender: v => {
                if (Array.isArray(v)) return v.map(i => `<span class="spec-tag spec-tag-green">${escapeHtml(i)}</span>`).join(' ');
                return escapeHtml(v);
            }
        }
    ];

    // Core questions (after which "Done early" becomes available)
    const CORE_QUESTION_COUNT = 6; // platform, audience, vibe, features, features_custom, auth

    // ===== DOM Refs =====
    const $ = id => document.getElementById(id);
    const landing = $('landing');
    const planner = $('planner');
    const ideaInput = $('idea-input');
    const startBtn = $('start-btn');
    const ideaDisplay = $('idea-display');
    const convMessages = $('conv-messages');
    const convInputArea = $('conv-input-area');
    const specBody = $('spec-body');
    const specFooter = $('spec-footer');
    const specPane = $('spec-pane');
    const ringFill = $('ring-fill');
    const ringText = $('ring-text');
    const toastEl = $('toast');
    const historySection = $('history-section');
    const historyList = $('history-list');
    const mobileSpecToggle = $('mobile-spec-toggle');
    const promptModal = $('prompt-modal');
    const promptModalEditor = $('prompt-modal-editor');
    const promptModalTitle = $('prompt-modal-title');
    const compareModal = $('compare-modal');
    const compareLeft = $('compare-left');
    const compareRight = $('compare-right');
    const compareGrid = $('compare-grid');
    const draftBanner = $('draft-banner');
    const undoBtn = $('undo-btn');
    const kbdModal = $('kbd-modal');
    const specCompleteness = $('spec-completeness');
    const promptCharCount = $('prompt-char-count');
    const promptTokenEst = $('prompt-token-est');
    const confettiCanvas = $('confetti-canvas');
    const templateChipsEl = $('template-chips');
    const historySearchWrap = $('history-search-wrap');
    const historySearchInput = $('history-search');

    // ===== Theme =====
    function initTheme() {
        const saved = localStorage.getItem('app-planner-theme');
        if (saved) document.documentElement.setAttribute('data-theme', saved);
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('app-planner-theme', next);
    }

    initTheme();
    $('theme-toggle').addEventListener('click', toggleTheme);
    $('theme-toggle-2').addEventListener('click', toggleTheme);

    // ===== Render Templates =====
    let activeTemplateCat = 'all';

    function renderTemplates() {
        templateChipsEl.innerHTML = '';
        const filtered = activeTemplateCat === 'all'
            ? TEMPLATES
            : TEMPLATES.filter(t => t.cat === activeTemplateCat);

        filtered.forEach(t => {
            const chip = document.createElement('button');
            chip.className = 'template-chip';
            chip.textContent = t.label;
            chip.addEventListener('click', () => {
                ideaInput.value = t.idea;
                startBtn.disabled = false;
                ideaInput.focus();
            });
            templateChipsEl.appendChild(chip);
        });
    }

    document.querySelectorAll('.template-cat-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.template-cat-chip').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTemplateCat = btn.dataset.cat;
            renderTemplates();
        });
    });

    renderTemplates();

    // ===== Draft Banner =====
    function showDraftBanner() {
        const draft = loadDraft();
        if (draft && draft.idea) {
            draftBanner.classList.remove('hidden');
            draftBanner.querySelector('span').textContent = `Draft: "${draft.idea.substring(0, 40)}${draft.idea.length > 40 ? '...' : ''}" — Resume?`;
        }
    }

    $('draft-resume').addEventListener('click', () => {
        const draft = loadDraft();
        if (!draft) return;
        draftBanner.classList.add('hidden');
        resumeFromDraft(draft);
    });

    $('draft-discard').addEventListener('click', () => {
        clearDraft();
        draftBanner.classList.add('hidden');
    });

    function resumeFromDraft(draft) {
        state.idea = draft.idea;
        state.ideaElaborated = draft.ideaElaborated || '';
        state.answers = draft.answers || {};
        state.currentStep = draft.currentStep || 0;
        state.complete = draft.complete || false;

        landing.classList.add('hidden');
        planner.classList.remove('hidden');
        if (isMobile()) mobileSpecToggle.classList.remove('hidden');
        ideaDisplay.textContent = state.idea;

        convMessages.innerHTML = '';
        specBody.innerHTML = '';

        addBotMessage(`Resuming your draft for "${escapeHtml(state.idea)}".`);

        // Rebuild spec from saved answers
        const fullIdea = state.ideaElaborated
            ? `<strong>${escapeHtml(state.idea)}</strong><br><span style="color:var(--text-secondary)">${escapeHtml(state.ideaElaborated)}</span>`
            : `<strong>${escapeHtml(state.idea)}</strong>`;
        updateSpecSection('Idea', fullIdea);

        QUESTIONS.forEach((q, i) => {
            const val = state.answers[q.id];
            if (val !== null && val !== undefined) {
                updateSpecSection(q.specSection, q.specRender(val));
            }
        });

        updateProgress();
        updateCompleteness();

        if (state.complete) {
            specFooter.classList.remove('hidden');
            addBotMessage('Your spec is restored. Use the export buttons or click spec sections to revise.');
        } else {
            askCurrentQuestion();
        }
    }

    showDraftBanner();

    // ===== Undo Button =====
    undoBtn.addEventListener('click', () => undoLastAnswer());

    function undoLastAnswer() {
        if (state.complete) return;
        const prevStep = state.currentStep - 1;
        if (prevStep < 0) return;
        goBackToQuestion(prevStep);
    }

    // ===== Keyboard Shortcuts Modal =====
    $('keyboard-help-btn').addEventListener('click', () => toggleKbdModal());
    $('kbd-modal-close').addEventListener('click', () => closeKbdModal());
    kbdModal.querySelector('.prompt-modal-backdrop').addEventListener('click', () => closeKbdModal());

    function toggleKbdModal() {
        kbdModal.classList.toggle('hidden');
    }

    function closeKbdModal() {
        kbdModal.classList.add('hidden');
    }

    // ===== Spec Completeness Indicator =====
    function updateCompleteness() {
        specCompleteness.innerHTML = '';
        QUESTIONS.forEach((q, i) => {
            const dot = document.createElement('div');
            dot.className = 'completeness-dot';
            dot.title = q.specSection;
            const val = state.answers[q.id];
            if (i === state.currentStep && !state.complete) {
                dot.classList.add('current');
            } else if (val !== undefined && val !== null) {
                dot.classList.add('answered');
            } else if (val === null) {
                dot.classList.add('skipped');
            }
            specCompleteness.appendChild(dot);
        });
    }

    // ===== Confetti =====
    function fireConfetti() {
        const ctx = confettiCanvas.getContext('2d');
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;

        const particles = [];
        const colors = ['#7c6bf5', '#34d399', '#fb923c', '#f87171', '#60a5fa', '#fbbf24'];

        for (let i = 0; i < 80; i++) {
            particles.push({
                x: Math.random() * confettiCanvas.width,
                y: -20 - Math.random() * 100,
                w: 6 + Math.random() * 6,
                h: 4 + Math.random() * 4,
                vx: (Math.random() - 0.5) * 4,
                vy: 2 + Math.random() * 4,
                rot: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.15,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1
            });
        }

        let frame = 0;
        function animate() {
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            let alive = false;

            particles.forEach(p => {
                if (p.life <= 0) return;
                alive = true;
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.08;
                p.rot += p.rotSpeed;
                p.life -= 0.008;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();
            });

            frame++;
            if (alive && frame < 180) {
                requestAnimationFrame(animate);
            } else {
                ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            }
        }

        animate();
    }

    // ===== Toast =====
    let toastTimer;
    function showToast(msg) {
        clearTimeout(toastTimer);
        toastEl.textContent = msg;
        toastEl.classList.add('show');
        toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2500);
    }

    // ===== Landing =====
    ideaInput.addEventListener('input', () => {
        startBtn.disabled = ideaInput.value.trim().length < 3;
    });

    ideaInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!startBtn.disabled) startPlanning();
        }
    });

    startBtn.addEventListener('click', startPlanning);

    // History search
    historySearchInput.addEventListener('input', () => {
        renderHistory(historySearchInput.value);
    });

    // Back button
    $('back-btn').addEventListener('click', () => {
        planner.classList.add('hidden');
        landing.classList.remove('hidden');
        mobileSpecToggle.classList.add('hidden');
        specPane.classList.remove('mobile-visible');
        resetState();
    });

    function resetState() {
        state.idea = '';
        state.ideaElaborated = '';
        state.answers = {};
        state.currentStep = -1;
        state.complete = false;
        convMessages.innerHTML = '';
        convInputArea.innerHTML = '';
        specBody.innerHTML = '<div class="spec-empty"><p>Your spec will build here as you answer questions...</p></div>';
        specFooter.classList.add('hidden');
        specCompleteness.innerHTML = '';
        updateProgress();
        clearDraft();
    }

    // ===== Mobile Spec Toggle (#6) =====
    function isMobile() {
        return window.matchMedia('(max-width: 768px)').matches;
    }

    mobileSpecToggle.addEventListener('click', () => {
        specPane.classList.toggle('mobile-visible');
        const isOpen = specPane.classList.contains('mobile-visible');
        mobileSpecToggle.querySelector('span').textContent = isOpen ? 'Chat' : 'Spec';
    });

    // ===== Typing Indicator =====
    function showTypingIndicator() {
        const div = document.createElement('div');
        div.className = 'msg msg-bot msg-typing';
        div.setAttribute('role', 'status');
        div.setAttribute('aria-label', 'Planner is typing');
        div.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;
        convMessages.appendChild(div);
        scrollConv();
        return div;
    }

    function removeTypingIndicator(el) {
        if (el && el.parentNode) el.parentNode.removeChild(el);
    }

    // ===== Delayed Bot Message with typing =====
    function addBotMessageWithTyping(text, skipNote) {
        return new Promise(resolve => {
            const typing = showTypingIndicator();
            const delay = 300 + Math.min(text.length * 2, 700);
            setTimeout(() => {
                removeTypingIndicator(typing);
                addBotMessage(text, skipNote);
                resolve();
            }, delay);
        });
    }

    // ===== Start Planning =====
    function startPlanning() {
        state.idea = ideaInput.value.trim();
        if (!state.idea) return;

        landing.classList.add('hidden');
        planner.classList.remove('hidden');
        if (isMobile()) mobileSpecToggle.classList.remove('hidden');
        ideaDisplay.textContent = state.idea;

        // Clear previous
        convMessages.innerHTML = '';
        specBody.innerHTML = '<div class="spec-empty"><p>Your spec will build here as you answer questions...</p></div>';
        specFooter.classList.add('hidden');
        state.answers = {};
        state.ideaElaborated = '';
        state.complete = false;

        // Decide if we need elaboration
        const wordCount = state.idea.split(/\s+/).length;
        const isShort = wordCount < 6 || state.idea.length < 30;

        if (isShort) {
            state.currentStep = -1;
            addBotMessageWithTyping(
                `Love it! "${escapeHtml(state.idea)}" sounds fun. Can you tell me a bit more? What should it do?`
            ).then(() => {
                renderElaborationInput();
                updateProgress();
            });
        } else {
            state.currentStep = 0;
            state.ideaElaborated = state.idea;
            addBotMessageWithTyping(
                `Great idea! Let me help you turn this into a buildable spec. I'll ask a few quick questions.`
            ).then(() => {
                updateSpecSection('Idea', `<strong>${escapeHtml(state.idea)}</strong>`);
                setTimeout(() => askCurrentQuestion(), 300);
            });
        }
    }

    // ===== Elaboration Step =====
    function renderElaborationInput() {
        convInputArea.innerHTML = '';
        const wrapper = document.createElement('div');

        const inputRow = document.createElement('div');
        inputRow.className = 'conv-text-input';

        const input = document.createElement('textarea');
        input.rows = 2;
        input.placeholder = 'e.g. A cat character that does random silly animations when you tap it...';
        input.setAttribute('aria-label', 'Elaborate on your idea');
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey && input.value.trim()) {
                e.preventDefault();
                handleElaboration(input.value.trim());
            }
        });

        const sendBtn = document.createElement('button');
        sendBtn.setAttribute('aria-label', 'Send');
        sendBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
        sendBtn.addEventListener('click', () => {
            if (input.value.trim()) handleElaboration(input.value.trim());
        });

        inputRow.appendChild(input);
        inputRow.appendChild(sendBtn);
        wrapper.appendChild(inputRow);

        const hint = document.createElement('div');
        hint.className = 'input-suggestion';
        hint.innerHTML = 'The more detail you give, the better the AI prompt will be.';
        wrapper.appendChild(hint);

        convInputArea.appendChild(wrapper);
        input.focus();
    }

    function handleElaboration(text) {
        state.ideaElaborated = text;
        addUserMessage(text);
        convInputArea.innerHTML = '';

        const fullIdea = `<strong>${escapeHtml(state.idea)}</strong><br><span style="color:var(--text-secondary)">${escapeHtml(text)}</span>`;
        updateSpecSection('Idea', fullIdea);

        state.currentStep = 0;
        addBotMessageWithTyping('Got it! Now let me ask a few questions to shape the spec.').then(() => {
            setTimeout(() => askCurrentQuestion(), 300);
        });
    }

    // ===== Conversation =====
    function addBotMessage(text, skipNote) {
        const div = document.createElement('div');
        div.className = 'msg msg-bot msg-entering';
        div.setAttribute('role', 'status');
        let html = `<div class="msg-label">Planner</div>${text}`;
        if (skipNote) html += `<div class="msg-skip-note">${skipNote}</div>`;
        div.innerHTML = html;
        convMessages.appendChild(div);
        scrollConv();
    }

    function addUserMessage(text) {
        const div = document.createElement('div');
        div.className = 'msg msg-user msg-entering';
        div.textContent = text;
        convMessages.appendChild(div);
        scrollConv();
    }

    function scrollConv() {
        requestAnimationFrame(() => {
            convMessages.scrollTop = convMessages.scrollHeight;
        });
    }

    // ===== Ask Question =====
    function askCurrentQuestion() {
        if (state.currentStep >= QUESTIONS.length) {
            finishPlanning();
            return;
        }

        const q = QUESTIONS[state.currentStep];
        const typing = showTypingIndicator();
        const delay = 300 + Math.min(q.question.length * 2, 500);

        setTimeout(() => {
            removeTypingIndicator(typing);
            addBotMessage(q.question);
            renderInput(q);
            updateProgress();
            updateCompleteness();
        }, delay);
    }

    function renderInput(q) {
        convInputArea.innerHTML = '';
        const recommendation = getRecommendation(q.id);
        const wrapper = document.createElement('div');

        const chipsDiv = document.createElement('div');
        chipsDiv.className = 'input-chips';
        chipsDiv.setAttribute('role', 'group');
        chipsDiv.setAttribute('aria-label', q.question);

        if (q.multi) {
            // ---- Multi-select ----
            const selected = new Set();
            let customText = '';

            q.options.forEach((opt, idx) => {
                const chip = document.createElement('button');
                chip.className = 'chip';
                chip.textContent = opt;
                chip.setAttribute('data-key', idx + 1 <= 9 ? idx + 1 : '');
                chip.setAttribute('aria-pressed', 'false');
                chip.addEventListener('click', () => {
                    if (selected.has(opt)) {
                        selected.delete(opt);
                        chip.classList.remove('selected');
                        chip.setAttribute('aria-pressed', 'false');
                    } else {
                        selected.add(opt);
                        chip.classList.add('selected');
                        chip.setAttribute('aria-pressed', 'true');
                    }
                    updateConfirmState();
                });
                chipsDiv.appendChild(chip);
            });

            if (q.customOption) {
                const customChip = document.createElement('button');
                customChip.className = 'chip chip-custom';
                customChip.textContent = 'Type my own';
                customChip.addEventListener('click', () => {
                    customRow.classList.toggle('hidden');
                    if (!customRow.classList.contains('hidden')) {
                        customInput.focus();
                    }
                });
                chipsDiv.appendChild(customChip);
            }

            const skipChip = document.createElement('button');
            skipChip.className = 'chip chip-skip';
            skipChip.textContent = 'Skip';
            skipChip.addEventListener('click', () => handleSkip(q));
            chipsDiv.appendChild(skipChip);

            wrapper.appendChild(chipsDiv);

            let customInput;
            const customRow = document.createElement('div');
            customRow.className = 'custom-input-row hidden';
            if (q.customOption) {
                customInput = document.createElement('input');
                customInput.type = 'text';
                customInput.placeholder = q.customPlaceholder || 'Type your own...';
                customInput.className = 'custom-text-input';
                customInput.setAttribute('aria-label', 'Custom answer');
                customInput.addEventListener('input', () => {
                    customText = customInput.value.trim();
                    updateConfirmState();
                });
                customInput.addEventListener('keydown', e => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        submitMulti();
                    }
                });
                customRow.appendChild(customInput);
                wrapper.appendChild(customRow);
            }

            const controls = document.createElement('div');
            controls.className = 'multi-controls';
            const confirmBtn = document.createElement('button');
            confirmBtn.className = 'btn-confirm';
            confirmBtn.textContent = 'Confirm selection';
            confirmBtn.disabled = true;

            function updateConfirmState() {
                confirmBtn.disabled = selected.size === 0 && !customText;
            }

            function submitMulti() {
                const result = Array.from(selected);
                if (customText) {
                    customText.split(',').map(s => s.trim()).filter(Boolean).forEach(s => result.push(s));
                }
                if (result.length > 0) handleAnswer(q, result);
            }

            confirmBtn.addEventListener('click', submitMulti);
            controls.appendChild(confirmBtn);

            // #8 Done early button
            if (state.currentStep >= CORE_QUESTION_COUNT) {
                const doneBtn = document.createElement('button');
                doneBtn.className = 'btn-done-early';
                doneBtn.textContent = 'That\'s enough, generate!';
                doneBtn.addEventListener('click', () => {
                    cleanupKeyHandlers();
                    convInputArea.innerHTML = '';
                    addUserMessage('Done early — generate my spec!');
                    state.currentStep = QUESTIONS.length;
                    finishPlanning();
                });
                controls.appendChild(doneBtn);
            }

            wrapper.appendChild(controls);

            wrapper._keyHandler = e => {
                if (document.activeElement === customInput) return;
                if (e.key === 'Enter' && (selected.size > 0 || customText)) {
                    submitMulti();
                }
                const num = parseInt(e.key);
                if (num >= 1 && num <= q.options.length) {
                    const opt = q.options[num - 1];
                    const chip = chipsDiv.children[num - 1];
                    if (selected.has(opt)) {
                        selected.delete(opt);
                        chip.classList.remove('selected');
                        chip.setAttribute('aria-pressed', 'false');
                    } else {
                        selected.add(opt);
                        chip.classList.add('selected');
                        chip.setAttribute('aria-pressed', 'true');
                    }
                    updateConfirmState();
                }
            };
            document.addEventListener('keydown', wrapper._keyHandler);

        } else {
            // ---- Single-select ----
            q.options.forEach((opt, idx) => {
                const chip = document.createElement('button');
                chip.className = 'chip';
                if (recommendation && opt === recommendation) {
                    chip.classList.add('recommended');
                }
                chip.textContent = opt;
                chip.setAttribute('data-key', idx + 1 <= 9 ? idx + 1 : '');
                chip.addEventListener('click', () => handleAnswer(q, opt));
                chipsDiv.appendChild(chip);
            });

            let customInput;
            if (q.customOption) {
                const customChip = document.createElement('button');
                customChip.className = 'chip chip-custom';
                customChip.textContent = 'Type my own';
                customChip.addEventListener('click', () => {
                    customRow.classList.toggle('hidden');
                    if (!customRow.classList.contains('hidden')) {
                        customInput.focus();
                    }
                });
                chipsDiv.appendChild(customChip);
            }

            const skipChip = document.createElement('button');
            skipChip.className = 'chip chip-skip';
            skipChip.textContent = 'Skip';
            skipChip.addEventListener('click', () => handleSkip(q));
            chipsDiv.appendChild(skipChip);

            wrapper.appendChild(chipsDiv);

            const customRow = document.createElement('div');
            customRow.className = 'custom-input-row hidden';
            if (q.customOption) {
                const inputRow = document.createElement('div');
                inputRow.className = 'conv-text-input';
                customInput = document.createElement('input');
                customInput.type = 'text';
                customInput.placeholder = q.customPlaceholder || 'Type your own...';
                customInput.setAttribute('aria-label', 'Custom answer');
                customInput.addEventListener('keydown', e => {
                    if (e.key === 'Enter' && customInput.value.trim()) {
                        handleAnswer(q, customInput.value.trim());
                    }
                });
                const sendBtn = document.createElement('button');
                sendBtn.setAttribute('aria-label', 'Send');
                sendBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
                sendBtn.addEventListener('click', () => {
                    if (customInput.value.trim()) handleAnswer(q, customInput.value.trim());
                });
                inputRow.appendChild(customInput);
                inputRow.appendChild(sendBtn);
                customRow.appendChild(inputRow);
                wrapper.appendChild(customRow);
            }

            // #8 Done early button for single-select
            if (state.currentStep >= CORE_QUESTION_COUNT) {
                const doneRow = document.createElement('div');
                doneRow.className = 'multi-controls';
                const doneBtn = document.createElement('button');
                doneBtn.className = 'btn-done-early';
                doneBtn.textContent = 'That\'s enough, generate!';
                doneBtn.addEventListener('click', () => {
                    cleanupKeyHandlers();
                    convInputArea.innerHTML = '';
                    addUserMessage('Done early — generate my spec!');
                    state.currentStep = QUESTIONS.length;
                    finishPlanning();
                });
                doneRow.appendChild(doneBtn);
                wrapper.appendChild(doneRow);
            }

            wrapper._keyHandler = e => {
                if (document.activeElement === customInput) return;
                const num = parseInt(e.key);
                if (num >= 1 && num <= q.options.length) {
                    handleAnswer(q, q.options[num - 1]);
                }
            };
            document.addEventListener('keydown', wrapper._keyHandler);
        }

        // Hint row
        const hint = document.createElement('div');
        hint.className = 'input-suggestion';
        let hintText = '';
        if (recommendation && !q.multi) {
            hintText = `Based on your idea, <strong>${recommendation}</strong> might be a good fit. `;
        }
        if (q.suggestion) hintText += q.suggestion;
        hintText += ' <span class="kbd-hint">Press 1-9 to quick-pick.</span>';
        hint.innerHTML = hintText;
        wrapper.appendChild(hint);

        convInputArea.appendChild(wrapper);
    }

    // ===== Cleanup keyboard handlers =====
    function cleanupKeyHandlers() {
        const wrapper = convInputArea.firstElementChild;
        if (wrapper && wrapper._keyHandler) {
            document.removeEventListener('keydown', wrapper._keyHandler);
        }
    }

    // ===== Handle Answer =====
    function handleAnswer(q, value) {
        cleanupKeyHandlers();
        state.answers[q.id] = value;
        const display = Array.isArray(value) ? value.join(', ') : value;
        addUserMessage(display);
        convInputArea.innerHTML = '';

        updateSpecSection(q.specSection, q.specRender(value));
        highlightSpecSection(q.specSection);

        state.currentStep++;
        updateCompleteness();
        saveDraft();
        setTimeout(() => askCurrentQuestion(), 200);
    }

    function handleSkip(q) {
        cleanupKeyHandlers();
        addUserMessage('Skipped');
        state.answers[q.id] = null;
        convInputArea.innerHTML = '';

        updateSpecSection(q.specSection, '<span class="spec-tag spec-tag-orange">AI will decide</span>');

        state.currentStep++;
        updateCompleteness();
        saveDraft();
        addBotMessageWithTyping('No worries, the AI will figure this out.').then(() => {
            setTimeout(() => askCurrentQuestion(), 200);
        });
    }

    // ===== Auto-scroll + highlight spec section =====
    function highlightSpecSection(sectionTitle) {
        const section = specBody.querySelector(`[data-spec-section="${CSS.escape(sectionTitle)}"]`);
        if (!section) return;
        section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        section.classList.remove('spec-section-highlight');
        void section.offsetWidth;
        section.classList.add('spec-section-highlight');
    }

    // ===== #2 Go-back / Undo =====
    function goBackToQuestion(questionIndex) {
        if (questionIndex < 0 || questionIndex >= QUESTIONS.length) return;

        cleanupKeyHandlers();
        const q = QUESTIONS[questionIndex];

        // Clear the answer
        state.answers[q.id] = undefined;
        state.currentStep = questionIndex;
        state.complete = false;
        specFooter.classList.add('hidden');

        // Re-render spec (remove the section)
        const section = specBody.querySelector(`[data-spec-section="${CSS.escape(q.specSection)}"]`);
        if (section) section.remove();

        addBotMessageWithTyping(`Let's redo: ${q.question}`).then(() => {
            renderInput(q);
            updateProgress();
        });
    }

    // ===== Progress =====
    function updateProgress() {
        const total = QUESTIONS.length;
        const current = Math.max(0, state.currentStep);
        const pct = Math.round((current / total) * 100);
        ringFill.setAttribute('stroke-dasharray', `${pct}, 100`);
        ringText.textContent = `${pct}%`;
    }

    // ===== Spec Panel =====
    function updateSpecSection(title, contentHtml) {
        const empty = specBody.querySelector('.spec-empty');
        if (empty) empty.remove();

        let section = specBody.querySelector(`[data-spec-section="${CSS.escape(title)}"]`);
        if (section) {
            section.querySelector('.spec-section-content').innerHTML = contentHtml;
            section.classList.remove('spec-updated');
            void section.offsetWidth;
            section.classList.add('spec-updated');
        } else {
            section = document.createElement('div');
            section.className = 'spec-section';
            section.setAttribute('data-spec-section', title);
            section.setAttribute('role', 'button');
            section.setAttribute('tabindex', '0');
            section.setAttribute('aria-label', `Edit ${title}`);
            section.innerHTML = `
                <div class="spec-section-title">${escapeHtml(title)}<span class="spec-edit-hint">click to edit</span></div>
                <div class="spec-section-content">${contentHtml}</div>
            `;

            // #1 Editable spec — click to jump back to that question
            section.addEventListener('click', () => {
                const qIdx = QUESTIONS.findIndex(q => q.specSection === title);
                if (qIdx !== -1) {
                    goBackToQuestion(qIdx);
                }
            });
            section.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const qIdx = QUESTIONS.findIndex(q => q.specSection === title);
                    if (qIdx !== -1) goBackToQuestion(qIdx);
                }
            });

            specBody.appendChild(section);
        }

        specBody.scrollTop = specBody.scrollHeight;
    }

    // ===== Finish =====
    function finishPlanning() {
        state.complete = true;
        updateProgress();
        convInputArea.innerHTML = '';

        const preview = generatePrompt('claude');
        const previewShort = preview.length > 300 ? preview.substring(0, 300) + '...' : preview;

        addBotMessageWithTyping(
            `Your spec is ready! Here's a preview of what you'll get:` +
            `<div class="prompt-preview">${escapeHtml(previewShort)}</div>` +
            `Use the export buttons on the right panel to copy a prompt tailored for <strong>Claude</strong>, <strong>Cursor</strong>, <strong>v0</strong>, or raw <strong>Markdown</strong>.` +
            `<br>You can also <strong>download</strong> as .md or .txt, or <strong>share</strong> a link.` +
            `<br><br>Hit <strong>Save Plan</strong> to revisit this later.`
        ).then(() => {
            specFooter.classList.remove('hidden');
            updateCompleteness();
            clearDraft();

            // Celebration
            ringFill.style.stroke = 'var(--green)';
            setTimeout(() => { ringFill.style.stroke = ''; }, 2000);
            fireConfetti();
        });
    }

    // ===== Prompt Generators =====
    function inferStack() {
        const s = state.answers;
        const features = Array.isArray(s.features) ? s.features : [];
        const hasChat = features.includes('Chat / Messaging');
        const hasPayments = features.includes('Payments / Billing');
        const hasAI = features.includes('AI Integration');
        const hasAnalytics = features.includes('Analytics');
        const platform = s.platform || '';

        if (platform === 'HTML + CSS + JS') return 'HTML + CSS + JS (vanilla, no build tools)';
        if (platform === 'Mobile App') return 'React Native with Expo + Supabase';
        if (hasChat || hasPayments || hasAI || hasAnalytics) return 'Next.js + Supabase + Tailwind CSS';
        if (features.includes('Social Features')) return 'Next.js + Supabase + Tailwind CSS';
        if (platform === 'Chrome Extension') return 'Vanilla JS/HTML extension with Chrome APIs';
        return 'Next.js + Tailwind CSS';
    }

    function getIdeaSummary() {
        const parts = [];
        parts.push(state.idea);
        if (state.ideaElaborated && state.ideaElaborated !== state.idea) {
            parts.push(state.ideaElaborated);
        }
        return parts.join(' — ');
    }

    function buildSummary() {
        const s = state.answers;
        const idea = getIdeaSummary();
        const platform = s.platform || 'web application';
        const audience = s.audience || null;
        const vibe = s.vibe || null;
        const features = Array.isArray(s.features) ? s.features : [];
        const custom = s.features_custom || null;
        const auth = s.auth || null;

        let summary = `Build a ${platform.toLowerCase()}`;
        summary += `: ${idea}.`;

        if (audience) {
            const aud = Array.isArray(audience) ? audience.join(', ') : audience;
            summary += ` Target users: ${aud}.`;
        }
        if (vibe) summary += ` The design should feel ${vibe.toLowerCase()}.`;
        if (features.length > 0) summary += ` Core features include: ${features.join(', ').toLowerCase()}.`;
        if (custom) {
            const c = Array.isArray(custom) ? custom.join(', ') : custom;
            summary += ` Also: ${c}.`;
        }
        if (auth && auth !== 'No Auth Needed') summary += ` Authentication via ${auth.toLowerCase()}.`;
        if (auth === 'No Auth Needed') summary += ` No authentication needed.`;

        return summary;
    }

    function buildSpec() {
        const s = state.answers;
        const lines = [];
        lines.push(`## App Idea\n${getIdeaSummary()}\n`);

        QUESTIONS.forEach(q => {
            const val = s[q.id];
            if (val === null || val === undefined) return;
            const display = Array.isArray(val) ? val.join(', ') : val;
            lines.push(`## ${q.specSection}\n${display}\n`);
        });

        if (!s.stack || s.stack === 'Let AI Decide') {
            lines.push(`## Suggested Tech Stack\n${inferStack()} (choose the best fit if you disagree)\n`);
        }

        return lines.join('\n');
    }

    function generatePrompt(target) {
        const s = state.answers;
        const spec = buildSpec();
        const summary = buildSummary();
        const stack = (s.stack && s.stack !== 'Let AI Decide') ? s.stack : inferStack();
        const scope = s.scope || 'MVP';
        const isExploring = scope.includes('Exploring');
        const isPrototype = scope.includes('Prototype');
        const extras = s.extras;
        const extrasStr = Array.isArray(extras) ? extras.join(', ') : extras;

        if (target === 'claude') {
            let prompt = `${summary}\n\n`;
            prompt += `---\n\n`;
            prompt += spec + '\n';
            prompt += `## Build Instructions\n`;

            if (isExploring || isPrototype) {
                prompt += `- This is a ${isExploring ? 'exploration / proof of concept' : 'quick prototype'}. Focus on getting a working demo fast, skip perfectionism\n`;
                prompt += `- Use ${stack}. Keep the architecture simple — no over-engineering\n`;
                prompt += `- Get something visible and interactive as quickly as possible\n`;
            } else if (s.platform === 'HTML + CSS + JS' || stack.includes('vanilla')) {
                prompt += `- Build this as a single HTML/CSS/JS file (no build tools, no frameworks)\n`;
                prompt += `- It should work by opening the HTML file directly in a browser\n`;
            } else if (s.platform === 'Mobile App') {
                prompt += `- Use ${stack}\n`;
                prompt += `- Start with the data models and core logic, then build screens and navigation\n`;
            } else {
                prompt += `- Use ${stack}\n`;
                prompt += `- Start with the database schema, then the API layer, then the frontend\n`;
            }

            if (s.vibe) prompt += `- Design: ${s.vibe} aesthetic. Every screen should match this vibe\n`;
            if (extrasStr) prompt += `- Important: ${extrasStr}\n`;
            prompt += `- Write clean, modern code. Explain key decisions as you build\n`;

            return prompt;
        }

        if (target === 'cursor') {
            let prompt = `${summary}\n\n`;
            prompt += `---\n\n`;
            prompt += spec + '\n';
            prompt += `## Requirements\n`;
            prompt += `- Tech stack: ${stack}\n`;
            prompt += `- Set up proper project structure from the start\n`;

            if (isExploring || isPrototype) {
                prompt += `- This is a ${isExploring ? 'proof of concept' : 'prototype'} — prioritize speed over polish\n`;
            } else {
                prompt += `- Write production-quality, well-organized code\n`;
                prompt += `- Use TypeScript where possible\n`;
                prompt += `- Include proper error handling and input validation\n`;
            }

            prompt += `- Make the UI responsive and accessible\n`;
            if (s.vibe) prompt += `- Design: ${s.vibe} aesthetic throughout\n`;
            if (extrasStr) prompt += `- Note: ${extrasStr}\n`;

            return prompt;
        }

        if (target === 'v0') {
            const vibe = s.vibe || 'clean and modern';
            const features = Array.isArray(s.features) ? s.features : [];

            let prompt = `Create a ${vibe.toLowerCase()} UI for: ${getIdeaSummary()}\n\n`;

            if (features.length > 0) {
                prompt += `Key screens/features to design:\n`;
                features.forEach(f => { prompt += `- ${f}\n`; });
            }

            if (s.features_custom) {
                const c = Array.isArray(s.features_custom) ? s.features_custom : [s.features_custom];
                c.forEach(f => { prompt += `- ${f}\n`; });
            }

            prompt += `\nDesign:\n`;
            prompt += `- ${vibe} aesthetic\n`;
            prompt += `- Responsive (mobile + desktop)\n`;
            prompt += `- Use shadcn/ui components\n`;
            prompt += `- Include realistic placeholder content and data\n`;

            if (s.audience) {
                const aud = Array.isArray(s.audience) ? s.audience.join(', ') : s.audience;
                prompt += `- Optimized for: ${aud}\n`;
            }
            if (s.auth && s.auth !== 'No Auth Needed') prompt += `- Include sign-in flow (${s.auth})\n`;
            if (extrasStr) prompt += `- ${extrasStr}\n`;

            return prompt;
        }

        // json
        if (target === 'json') {
            const jsonObj = {
                idea: state.idea,
                elaboration: state.ideaElaborated || undefined,
                spec: {}
            };
            QUESTIONS.forEach(q => {
                const val = state.answers[q.id];
                if (val !== null && val !== undefined) {
                    jsonObj.spec[q.id] = val;
                }
            });
            if (!state.answers.stack || state.answers.stack === 'Let AI Decide') {
                jsonObj.spec.suggestedStack = inferStack();
            }
            return JSON.stringify(jsonObj, null, 2);
        }

        // markdown
        return `# ${state.idea}\n\n${summary}\n\n---\n\n${spec}`;
    }

    // ===== #9 Prompt Preview Modal =====
    let currentExportTarget = null;

    function openPromptModal(target) {
        const label = target.charAt(0).toUpperCase() + target.slice(1);
        currentExportTarget = target;
        promptModalTitle.textContent = `${label} Prompt — Preview & Edit`;
        const content = generatePrompt(target);
        promptModalEditor.value = content;
        updatePromptMeta(content);
        promptModal.classList.remove('hidden');
        promptModalEditor.focus();
    }

    function updatePromptMeta(text) {
        const chars = text.length;
        const tokens = Math.ceil(chars / 4);
        promptCharCount.textContent = `${chars.toLocaleString()} chars`;
        promptTokenEst.textContent = `~${tokens.toLocaleString()} tokens`;
    }

    promptModalEditor.addEventListener('input', () => {
        updatePromptMeta(promptModalEditor.value);
    });

    function closePromptModal() {
        promptModal.classList.add('hidden');
        currentExportTarget = null;
    }

    $('prompt-modal-close').addEventListener('click', closePromptModal);
    promptModal.querySelector('.prompt-modal-backdrop').addEventListener('click', closePromptModal);

    $('prompt-modal-copy').addEventListener('click', () => {
        navigator.clipboard.writeText(promptModalEditor.value).then(() => {
            showToast('Prompt copied to clipboard');
            closePromptModal();
        });
    });

    $('prompt-modal-download').addEventListener('click', () => {
        const ext = currentExportTarget === 'markdown' ? 'md' : 'txt';
        downloadFile(`app-plan-${currentExportTarget}.${ext}`, promptModalEditor.value);
        closePromptModal();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            if (!promptModal.classList.contains('hidden')) closePromptModal();
            if (!compareModal.classList.contains('hidden')) closeCompareModal();
            if (!kbdModal.classList.contains('hidden')) closeKbdModal();
        }
        // ? key for keyboard help (only when not typing in an input)
        if (e.key === '?' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
            toggleKbdModal();
        }
        // Ctrl+Z for undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
            e.preventDefault();
            undoLastAnswer();
        }
    });

    // Export buttons — now open preview modal instead of direct copy
    document.querySelectorAll('.btn-export').forEach(btn => {
        const target = btn.dataset.target;
        if (!target) return;

        // #3 File downloads
        if (target === 'download-md') {
            btn.addEventListener('click', () => {
                downloadFile('app-plan.md', generatePrompt('markdown'));
                showToast('Downloaded app-plan.md');
            });
            return;
        }
        if (target === 'download-txt') {
            btn.addEventListener('click', () => {
                downloadFile('app-plan.txt', generatePrompt('claude'));
                showToast('Downloaded app-plan.txt');
            });
            return;
        }

        // #4 Share URL
        if (target === 'share') {
            btn.addEventListener('click', () => {
                const shareData = {
                    idea: state.idea,
                    elab: state.ideaElaborated,
                    a: state.answers
                };
                const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(shareData))));
                const url = window.location.origin + window.location.pathname + '#plan=' + encoded;
                navigator.clipboard.writeText(url).then(() => {
                    showToast('Shareable link copied to clipboard');
                });
            });
            return;
        }

        // JSON export
        if (target === 'json') {
            btn.addEventListener('click', () => {
                openPromptModal('json');
            });
            return;
        }

        // Regular export targets open the preview modal
        btn.addEventListener('click', () => {
            openPromptModal(target);
        });
    });

    // ===== #3 File Download Helper =====
    function downloadFile(filename, content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ===== #4 Load from URL hash =====
    function loadFromHash() {
        const hash = window.location.hash;
        if (!hash.startsWith('#plan=')) return;
        try {
            const encoded = hash.substring(6);
            const json = decodeURIComponent(escape(atob(encoded)));
            const data = JSON.parse(json);
            if (data.idea) {
                // Load into state and start the completed view
                state.idea = data.idea;
                state.ideaElaborated = data.elab || '';
                state.answers = data.a || {};
                state.currentStep = QUESTIONS.length;
                state.complete = true;

                landing.classList.add('hidden');
                planner.classList.remove('hidden');
                if (isMobile()) mobileSpecToggle.classList.remove('hidden');
                ideaDisplay.textContent = state.idea;

                convMessages.innerHTML = '';
                specBody.innerHTML = '';

                addBotMessage(`Loaded shared plan for "${escapeHtml(state.idea)}".`);

                const fullIdea = state.ideaElaborated
                    ? `<strong>${escapeHtml(state.idea)}</strong><br><span style="color:var(--text-secondary)">${escapeHtml(state.ideaElaborated)}</span>`
                    : `<strong>${escapeHtml(state.idea)}</strong>`;
                updateSpecSection('Idea', fullIdea);

                QUESTIONS.forEach(q => {
                    const val = state.answers[q.id];
                    if (val !== null && val !== undefined) {
                        updateSpecSection(q.specSection, q.specRender(val));
                    } else {
                        updateSpecSection(q.specSection, '<span class="spec-tag spec-tag-orange">AI will decide</span>');
                    }
                });

                updateProgress();
                specFooter.classList.remove('hidden');
                convInputArea.innerHTML = '';
                addBotMessage('This plan was shared via link. Use the export buttons to copy a prompt.');

                // Clear hash so it doesn't reload on refresh
                history.replaceState(null, '', window.location.pathname);
            }
        } catch (e) {
            // Invalid hash, ignore
        }
    }

    // ===== Save / History =====
    const STORAGE_KEY = 'app-planner-history';

    function loadHistory() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch { return []; }
    }

    function saveHistory(plans) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(plans.slice(0, 20)));
    }

    function renderHistory(searchQuery) {
        const plans = loadHistory();
        if (plans.length === 0) {
            historySection.classList.add('hidden');
            historySearchWrap.classList.add('hidden');
            return;
        }

        historySection.classList.remove('hidden');
        historyList.innerHTML = '';

        // Show search when 4+ plans
        if (plans.length >= 4) {
            historySearchWrap.classList.remove('hidden');
        } else {
            historySearchWrap.classList.add('hidden');
        }

        // Compare button in header
        const h3 = historySection.querySelector('h3');
        h3.innerHTML = 'Recent plans';
        if (plans.length >= 2) {
            const compareBtn = document.createElement('button');
            compareBtn.className = 'btn-compare';
            compareBtn.textContent = 'Compare';
            compareBtn.addEventListener('click', e => {
                e.stopPropagation();
                openCompareModal();
            });
            h3.appendChild(compareBtn);
        }

        // Filter by search
        const query = (searchQuery || '').toLowerCase().trim();
        const filtered = query
            ? plans.filter(p => p.idea.toLowerCase().includes(query) || (p.ideaElaborated || '').toLowerCase().includes(query))
            : plans;

        if (filtered.length === 0) {
            historyList.innerHTML = '<div style="color:var(--text-muted);font-size:0.85rem;padding:0.5rem 0">No matching plans.</div>';
            return;
        }

        filtered.forEach((plan, i) => {
            const realIdx = plans.indexOf(plan);
            const item = document.createElement('div');
            item.className = 'history-item';
            const date = new Date(plan.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            item.innerHTML = `
                <div class="history-item-text">
                    <div class="history-item-idea">${escapeHtml(plan.idea)}</div>
                    <div class="history-item-date">${date}${plan.ideaElaborated ? ' &middot; ' + escapeHtml(plan.ideaElaborated).substring(0, 40) + '...' : ''}</div>
                </div>
                <button class="history-item-delete" data-index="${i}" aria-label="Delete plan">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            `;

            item.querySelector('.history-item-text').addEventListener('click', () => {
                loadPlan(plan);
            });

            item.querySelector('.history-item-delete').addEventListener('click', e => {
                e.stopPropagation();
                const updated = loadHistory();
                updated.splice(realIdx, 1);
                saveHistory(updated);
                renderHistory(historySearchInput.value);
                showToast('Plan deleted');
            });

            historyList.appendChild(item);
        });
    }

    function loadPlan(plan) {
        state.idea = plan.idea;
        state.ideaElaborated = plan.ideaElaborated || '';
        state.answers = { ...plan.answers };
        state.currentStep = QUESTIONS.length;
        state.complete = true;

        landing.classList.add('hidden');
        planner.classList.remove('hidden');
        if (isMobile()) mobileSpecToggle.classList.remove('hidden');
        ideaDisplay.textContent = state.idea;

        convMessages.innerHTML = '';
        specBody.innerHTML = '';

        addBotMessage(`Loaded your plan for "${escapeHtml(state.idea)}".`);

        const fullIdea = state.ideaElaborated
            ? `<strong>${escapeHtml(state.idea)}</strong><br><span style="color:var(--text-secondary)">${escapeHtml(state.ideaElaborated)}</span>`
            : `<strong>${escapeHtml(state.idea)}</strong>`;
        updateSpecSection('Idea', fullIdea);

        QUESTIONS.forEach(q => {
            const val = state.answers[q.id];
            if (val !== null && val !== undefined) {
                updateSpecSection(q.specSection, q.specRender(val));
            } else {
                updateSpecSection(q.specSection, '<span class="spec-tag spec-tag-orange">AI will decide</span>');
            }
        });

        updateProgress();
        specFooter.classList.remove('hidden');
        convInputArea.innerHTML = '';
        addBotMessage('Your spec is restored. Use the export buttons to copy a prompt, or click any spec section to revise it.');
    }

    $('save-plan').addEventListener('click', () => {
        const plans = loadHistory();
        const filtered = plans.filter(p => p.idea !== state.idea);
        filtered.unshift({
            idea: state.idea,
            ideaElaborated: state.ideaElaborated,
            answers: { ...state.answers },
            date: Date.now()
        });
        saveHistory(filtered);
        renderHistory();
        showToast('Plan saved!');
    });

    // ===== #10 Compare Modal =====
    function openCompareModal() {
        const plans = loadHistory();
        if (plans.length < 2) {
            showToast('Need at least 2 saved plans to compare');
            return;
        }

        // Populate selectors
        compareLeft.innerHTML = '<option value="">Pick plan A...</option>';
        compareRight.innerHTML = '<option value="">Pick plan B...</option>';

        plans.forEach((plan, i) => {
            const label = plan.idea.substring(0, 50) + (plan.idea.length > 50 ? '...' : '');
            compareLeft.innerHTML += `<option value="${i}">${escapeHtml(label)}</option>`;
            compareRight.innerHTML += `<option value="${i}">${escapeHtml(label)}</option>`;
        });

        compareGrid.classList.add('hidden');
        compareGrid.innerHTML = '';
        compareModal.classList.remove('hidden');

        function onSelectChange() {
            const a = compareLeft.value;
            const b = compareRight.value;
            if (a === '' || b === '' || a === b) {
                compareGrid.classList.add('hidden');
                return;
            }
            renderComparison(plans[parseInt(a)], plans[parseInt(b)]);
        }

        compareLeft.onchange = onSelectChange;
        compareRight.onchange = onSelectChange;
    }

    function renderComparison(planA, planB) {
        compareGrid.innerHTML = '';
        compareGrid.classList.remove('hidden');

        // Idea row
        addCompareRow('Idea', planA.idea, planB.idea);

        // Each question
        QUESTIONS.forEach(q => {
            const valA = planA.answers[q.id];
            const valB = planB.answers[q.id];
            const dispA = valA == null ? '(skipped)' : (Array.isArray(valA) ? valA.join(', ') : valA);
            const dispB = valB == null ? '(skipped)' : (Array.isArray(valB) ? valB.join(', ') : valB);
            addCompareRow(q.specSection, dispA, dispB);
        });
    }

    function addCompareRow(label, valA, valB) {
        const same = valA === valB;
        const diffClass = same ? 'compare-cell-same' : 'compare-cell-diff';

        const labelCell = document.createElement('div');
        labelCell.className = 'compare-cell compare-cell-label';
        labelCell.textContent = label;

        const cellA = document.createElement('div');
        cellA.className = `compare-cell compare-cell-a ${diffClass}`;
        cellA.textContent = valA;

        const cellB = document.createElement('div');
        cellB.className = `compare-cell compare-cell-b ${diffClass}`;
        cellB.textContent = valB;

        compareGrid.appendChild(labelCell);
        compareGrid.appendChild(cellA);
        compareGrid.appendChild(cellB);
    }

    function closeCompareModal() {
        compareModal.classList.add('hidden');
    }

    $('compare-modal-close').addEventListener('click', closeCompareModal);
    compareModal.querySelector('.prompt-modal-backdrop').addEventListener('click', closeCompareModal);

    // ===== Init =====
    renderHistory();
    loadFromHash();

    // ===== Utility =====
    function escapeHtml(str) {
        if (str == null) return '';
        const div = document.createElement('div');
        div.textContent = String(str);
        return div.innerHTML;
    }
});
