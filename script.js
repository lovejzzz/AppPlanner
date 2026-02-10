document.addEventListener('DOMContentLoaded', () => {
    // ===== State =====
    const state = {
        idea: '',
        ideaElaborated: '',
        answers: {},
        currentStep: -1, // -1 = elaboration step
        complete: false
    };

    // ===== Context Intelligence =====
    // Keyword -> recommended options mapping
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
    // All questions are chip-based. Questions with customOption: true show a
    // "Type my own" chip that reveals a text input inline.
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
            specRender: v => escapeHtml(v)
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
    const ringFill = $('ring-fill');
    const ringText = $('ring-text');
    const toastEl = $('toast');
    const historySection = $('history-section');
    const historyList = $('history-list');

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

    // Template chips
    document.querySelectorAll('.template-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            ideaInput.value = chip.dataset.idea;
            startBtn.disabled = false;
            ideaInput.focus();
        });
    });

    // Back button
    $('back-btn').addEventListener('click', () => {
        planner.classList.add('hidden');
        landing.classList.remove('hidden');
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
        updateProgress();
    }

    // ===== Typing Indicator =====
    function showTypingIndicator() {
        const div = document.createElement('div');
        div.className = 'msg msg-bot msg-typing';
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
            state.currentStep = -1; // elaboration step
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
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey && input.value.trim()) {
                e.preventDefault();
                handleElaboration(input.value.trim());
            }
        });

        const sendBtn = document.createElement('button');
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

        // Update the spec idea section with full description
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
        div.className = 'msg msg-bot';
        let html = `<div class="msg-label">Planner</div>${text}`;
        if (skipNote) html += `<div class="msg-skip-note">${skipNote}</div>`;
        div.innerHTML = html;
        convMessages.appendChild(div);
        scrollConv();
    }

    function addUserMessage(text) {
        const div = document.createElement('div');
        div.className = 'msg msg-user';
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
        }, delay);
    }

    function renderInput(q) {
        convInputArea.innerHTML = '';
        const recommendation = getRecommendation(q.id);
        const wrapper = document.createElement('div');

        // All questions are now chip-based
        const chipsDiv = document.createElement('div');
        chipsDiv.className = 'input-chips';

        if (q.multi) {
            // ---- Multi-select ----
            const selected = new Set();
            let customText = '';

            q.options.forEach((opt, idx) => {
                const chip = document.createElement('button');
                chip.className = 'chip';
                chip.textContent = opt;
                chip.setAttribute('data-key', idx + 1 <= 9 ? idx + 1 : '');
                chip.addEventListener('click', () => {
                    if (selected.has(opt)) {
                        selected.delete(opt);
                        chip.classList.remove('selected');
                    } else {
                        selected.add(opt);
                        chip.classList.add('selected');
                    }
                    updateConfirmState();
                });
                chipsDiv.appendChild(chip);
            });

            // "Type my own" chip for custom input
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

            // Skip chip
            const skipChip = document.createElement('button');
            skipChip.className = 'chip chip-skip';
            skipChip.textContent = 'Skip';
            skipChip.addEventListener('click', () => handleSkip(q));
            chipsDiv.appendChild(skipChip);

            wrapper.appendChild(chipsDiv);

            // Custom text input row (hidden by default)
            let customInput;
            const customRow = document.createElement('div');
            customRow.className = 'custom-input-row hidden';
            if (q.customOption) {
                customInput = document.createElement('input');
                customInput.type = 'text';
                customInput.placeholder = q.customPlaceholder || 'Type your own...';
                customInput.className = 'custom-text-input';
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

            // Confirm button
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
                    // Split by commas to allow multiple custom entries
                    customText.split(',').map(s => s.trim()).filter(Boolean).forEach(s => result.push(s));
                }
                if (result.length > 0) handleAnswer(q, result);
            }

            confirmBtn.addEventListener('click', submitMulti);
            controls.appendChild(confirmBtn);
            wrapper.appendChild(controls);

            // Keyboard handler
            wrapper._keyHandler = e => {
                // Don't capture keys when typing in custom input
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
                    } else {
                        selected.add(opt);
                        chip.classList.add('selected');
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

            // "Type my own" chip
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

            // Skip chip
            const skipChip = document.createElement('button');
            skipChip.className = 'chip chip-skip';
            skipChip.textContent = 'Skip';
            skipChip.addEventListener('click', () => handleSkip(q));
            chipsDiv.appendChild(skipChip);

            wrapper.appendChild(chipsDiv);

            // Custom text row for single-select
            const customRow = document.createElement('div');
            customRow.className = 'custom-input-row hidden';
            if (q.customOption) {
                const inputRow = document.createElement('div');
                inputRow.className = 'conv-text-input';
                customInput = document.createElement('input');
                customInput.type = 'text';
                customInput.placeholder = q.customPlaceholder || 'Type your own...';
                customInput.addEventListener('keydown', e => {
                    if (e.key === 'Enter' && customInput.value.trim()) {
                        handleAnswer(q, customInput.value.trim());
                    }
                });
                const sendBtn = document.createElement('button');
                sendBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
                sendBtn.addEventListener('click', () => {
                    if (customInput.value.trim()) handleAnswer(q, customInput.value.trim());
                });
                inputRow.appendChild(customInput);
                inputRow.appendChild(sendBtn);
                customRow.appendChild(inputRow);
                wrapper.appendChild(customRow);
            }

            // Keyboard handler
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

        // Update spec
        updateSpecSection(q.specSection, q.specRender(value));

        state.currentStep++;
        setTimeout(() => askCurrentQuestion(), 200);
    }

    function handleSkip(q) {
        cleanupKeyHandlers();
        addUserMessage('Skipped');
        state.answers[q.id] = null;
        convInputArea.innerHTML = '';

        // Add "AI will decide" to spec
        updateSpecSection(q.specSection, '<span class="spec-tag spec-tag-orange">AI will decide</span>');

        state.currentStep++;
        addBotMessageWithTyping('No worries, the AI will figure this out.').then(() => {
            setTimeout(() => askCurrentQuestion(), 200);
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
        // Remove empty state
        const empty = specBody.querySelector('.spec-empty');
        if (empty) empty.remove();

        // Check if section exists, update it
        let section = specBody.querySelector(`[data-spec-section="${CSS.escape(title)}"]`);
        if (section) {
            section.querySelector('.spec-section-content').innerHTML = contentHtml;
            // Flash animation on update
            section.classList.remove('spec-updated');
            void section.offsetWidth;
            section.classList.add('spec-updated');
        } else {
            section = document.createElement('div');
            section.className = 'spec-section';
            section.setAttribute('data-spec-section', title);
            section.innerHTML = `
                <div class="spec-section-title">${escapeHtml(title)}</div>
                <div class="spec-section-content">${contentHtml}</div>
            `;
            specBody.appendChild(section);
        }

        // Scroll spec
        specBody.scrollTop = specBody.scrollHeight;
    }

    // ===== Finish =====
    function finishPlanning() {
        state.complete = true;
        updateProgress();
        convInputArea.innerHTML = '';

        // Generate preview of Claude prompt
        const preview = generatePrompt('claude');
        const previewShort = preview.length > 300 ? preview.substring(0, 300) + '...' : preview;

        addBotMessageWithTyping(
            `Your spec is ready! Here's a preview of what you'll get:` +
            `<div class="prompt-preview">${escapeHtml(previewShort)}</div>` +
            `Use the export buttons on the right panel to copy a prompt tailored for <strong>Claude</strong>, <strong>Cursor</strong>, <strong>v0</strong>, or raw <strong>Markdown</strong>.` +
            `<br><br>Hit <strong>Save Plan</strong> to revisit this later.`
        ).then(() => {
            specFooter.classList.remove('hidden');

            // Celebration animation on the ring
            ringFill.style.stroke = 'var(--green)';
            setTimeout(() => { ringFill.style.stroke = ''; }, 2000);
        });
    }

    // ===== Prompt Generators =====

    // Infer a sensible stack when user picked "Let AI Decide" or skipped
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
        const s = state.answers;
        const parts = [];
        parts.push(state.idea);
        if (state.ideaElaborated && state.ideaElaborated !== state.idea) {
            parts.push(state.ideaElaborated);
        }
        return parts.join(' — ');
    }

    // Build a natural-language summary paragraph from the answers
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

        if (audience) summary += ` Target users: ${audience}.`;
        if (vibe) summary += ` The design should feel ${vibe.toLowerCase()}.`;
        if (features.length > 0) summary += ` Core features include: ${features.join(', ').toLowerCase()}.`;
        if (custom) summary += ` Also: ${custom}.`;
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
            if (val === null || val === undefined) {
                // Don't output "use your best judgment" for every empty field
                // Only include sections that have real answers
                return;
            }
            const display = Array.isArray(val) ? val.join(', ') : val;
            lines.push(`## ${q.specSection}\n${display}\n`);
        });

        // Add inferred stack if user skipped it
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

        if (target === 'claude') {
            let prompt = `${summary}\n\n`;
            prompt += `---\n\n`;
            prompt += spec + '\n';
            prompt += `## Build Instructions\n`;

            // Adapt to scope
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

            if (s.vibe) {
                prompt += `- Design: ${s.vibe} aesthetic. Every screen should match this vibe\n`;
            }

            if (s.extras) {
                prompt += `- Important: ${s.extras}\n`;
            }

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
            if (s.extras) prompt += `- Note: ${s.extras}\n`;

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

            if (s.features_custom) prompt += `- ${s.features_custom}\n`;

            prompt += `\nDesign:\n`;
            prompt += `- ${vibe} aesthetic\n`;
            prompt += `- Responsive (mobile + desktop)\n`;
            prompt += `- Use shadcn/ui components\n`;
            prompt += `- Include realistic placeholder content and data\n`;

            if (s.audience) prompt += `- Optimized for: ${s.audience}\n`;
            if (s.auth && s.auth !== 'No Auth Needed') prompt += `- Include sign-in flow (${s.auth})\n`;
            if (s.extras) prompt += `- ${s.extras}\n`;

            return prompt;
        }

        // markdown — clean spec only
        return `# ${state.idea}\n\n${summary}\n\n---\n\n${spec}`;
    }

    // Export buttons
    document.querySelectorAll('.btn-export').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            const text = generatePrompt(target);
            navigator.clipboard.writeText(text).then(() => {
                btn.classList.add('copied');
                const svgEl = btn.querySelector('svg');
                const svgHtml = svgEl ? svgEl.outerHTML : '';
                const original = btn.innerHTML;
                btn.innerHTML = svgHtml + ' Copied!';
                showToast(`${target.charAt(0).toUpperCase() + target.slice(1)} prompt copied to clipboard`);
                setTimeout(() => {
                    btn.classList.remove('copied');
                    btn.innerHTML = original;
                }, 2000);
            });
        });
    });

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

    function renderHistory() {
        const plans = loadHistory();
        if (plans.length === 0) {
            historySection.classList.add('hidden');
            return;
        }

        historySection.classList.remove('hidden');
        historyList.innerHTML = '';

        plans.forEach((plan, i) => {
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

            // Click to load
            item.querySelector('.history-item-text').addEventListener('click', () => {
                loadPlan(plan);
            });

            // Delete
            item.querySelector('.history-item-delete').addEventListener('click', e => {
                e.stopPropagation();
                const updated = loadHistory();
                updated.splice(i, 1);
                saveHistory(updated);
                renderHistory();
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
        ideaDisplay.textContent = state.idea;

        // Rebuild spec
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
        addBotMessage('Your spec is restored. Use the export buttons to copy a prompt.');
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

    // Init history on load
    renderHistory();

    // ===== Utility =====
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});
