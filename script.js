document.addEventListener('DOMContentLoaded', () => {
    // ===== State =====
    const state = {
        idea: '',
        answers: {},
        currentStep: 0,
        complete: false
    };

    // ===== Question Engine =====
    // Each question: { id, question, type, options?, multi?, suggestion?, specSection, specRender }
    const QUESTIONS = [
        {
            id: 'platform',
            question: 'What kind of app is this?',
            type: 'chips',
            options: ['Web App', 'Mobile App', 'Desktop App', 'API / Backend', 'Chrome Extension'],
            suggestion: 'Pick the primary platform. You can note secondary ones later.',
            specSection: 'Platform',
            specRender: v => `<span class="spec-tag spec-tag-accent">${v}</span>`
        },
        {
            id: 'audience',
            question: 'Who is this for?',
            type: 'text',
            placeholder: 'e.g. indie developers, busy parents, small business owners...',
            suggestion: 'Be specific. "Everyone" is too broad for a good prompt.',
            specSection: 'Target Audience',
            specRender: v => v
        },
        {
            id: 'vibe',
            question: 'What\'s the design vibe?',
            type: 'chips',
            options: ['Minimal & Clean', 'Playful & Colorful', 'Dark & Techy', 'Corporate & Professional', 'Retro / Nostalgic'],
            specSection: 'Design',
            specRender: v => `<span class="spec-tag spec-tag-green">${v}</span>`
        },
        {
            id: 'features',
            question: 'What are the key features? Pick all that apply.',
            type: 'chips',
            multi: true,
            options: ['User Accounts', 'Dashboard', 'Payments / Billing', 'Social Features', 'Search', 'Notifications', 'File Upload', 'Chat / Messaging', 'Analytics', 'Admin Panel', 'AI Integration'],
            suggestion: 'Select the ones that matter most. You can add custom ones next.',
            specSection: 'Core Features',
            specRender: v => {
                const items = Array.isArray(v) ? v : [v];
                return '<ul>' + items.map(i => `<li>${i}</li>`).join('') + '</ul>';
            }
        },
        {
            id: 'features_custom',
            question: 'Any other features specific to your app?',
            type: 'text',
            placeholder: 'e.g. recipe import from URL, calorie tracking, meal plan generator...',
            suggestion: 'Describe features unique to your idea. Skip if covered above.',
            specSection: 'Custom Features',
            specRender: v => v
        },
        {
            id: 'auth',
            question: 'How should users sign in?',
            type: 'chips',
            options: ['Email & Password', 'Google / Social Login', 'Magic Link', 'No Auth Needed'],
            specSection: 'Authentication',
            specRender: v => `<span class="spec-tag spec-tag-accent">${v}</span>`
        },
        {
            id: 'stack',
            question: 'Any tech stack preference?',
            type: 'chips',
            options: ['React + Node', 'Next.js + Supabase', 'Vue + Firebase', 'Python + Django', 'Swift / Kotlin Native', 'Let AI Decide'],
            suggestion: 'If you\'re not sure, "Let AI Decide" is a great choice.',
            specSection: 'Tech Stack',
            specRender: v => `<span class="spec-tag spec-tag-orange">${v}</span>`
        },
        {
            id: 'data',
            question: 'What data does the app manage?',
            type: 'text',
            placeholder: 'e.g. user profiles, workout logs, recipes, transactions...',
            suggestion: 'List the main types of data users will create or view.',
            specSection: 'Data Model',
            specRender: v => v
        },
        {
            id: 'scope',
            question: 'What\'s the scope for the first version?',
            type: 'chips',
            options: ['Quick Prototype (1-2 days)', 'MVP (1-2 weeks)', 'Full Product (1-3 months)', 'Just Exploring'],
            specSection: 'Scope',
            specRender: v => `<span class="spec-tag spec-tag-green">${v}</span>`
        },
        {
            id: 'extras',
            question: 'Anything else the AI should know?',
            type: 'text',
            placeholder: 'e.g. must work offline, needs dark mode, should look like Linear...',
            suggestion: 'Final details, inspirations, or constraints. Skip if nothing comes to mind.',
            specSection: 'Additional Notes',
            specRender: v => v
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
        state.answers = {};
        state.currentStep = 0;
        state.complete = false;
        convMessages.innerHTML = '';
        convInputArea.innerHTML = '';
        specBody.innerHTML = '<div class="spec-empty"><p>Your spec will build here as you answer questions...</p></div>';
        specFooter.classList.add('hidden');
        updateProgress();
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
        state.currentStep = 0;
        state.complete = false;

        // Opening message
        addBotMessage(`Great idea! Let me help you shape "${state.idea}" into a buildable spec. I'll ask a few quick questions.`);

        // Update spec with the idea
        updateSpecSection('Idea', `<strong>${escapeHtml(state.idea)}</strong>`);

        setTimeout(() => askCurrentQuestion(), 600);
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
        addBotMessage(q.question);
        renderInput(q);
        updateProgress();
    }

    function renderInput(q) {
        convInputArea.innerHTML = '';

        if (q.type === 'chips') {
            const wrapper = document.createElement('div');

            if (q.multi) {
                // Multi-select chips
                const chipsDiv = document.createElement('div');
                chipsDiv.className = 'input-chips';
                const selected = new Set();

                q.options.forEach(opt => {
                    const chip = document.createElement('button');
                    chip.className = 'chip';
                    chip.textContent = opt;
                    chip.addEventListener('click', () => {
                        if (selected.has(opt)) {
                            selected.delete(opt);
                            chip.classList.remove('selected');
                        } else {
                            selected.add(opt);
                            chip.classList.add('selected');
                        }
                        confirmBtn.disabled = selected.size === 0;
                    });
                    chipsDiv.appendChild(chip);
                });

                // Skip chip
                const skipChip = document.createElement('button');
                skipChip.className = 'chip chip-skip';
                skipChip.textContent = 'Skip';
                skipChip.addEventListener('click', () => handleSkip(q));
                chipsDiv.appendChild(skipChip);

                wrapper.appendChild(chipsDiv);

                // Confirm button
                const controls = document.createElement('div');
                controls.className = 'multi-controls';
                const confirmBtn = document.createElement('button');
                confirmBtn.className = 'btn-confirm';
                confirmBtn.textContent = 'Confirm selection';
                confirmBtn.disabled = true;
                confirmBtn.addEventListener('click', () => {
                    handleAnswer(q, Array.from(selected));
                });
                controls.appendChild(confirmBtn);
                wrapper.appendChild(controls);
            } else {
                // Single-select chips
                const chipsDiv = document.createElement('div');
                chipsDiv.className = 'input-chips';

                q.options.forEach(opt => {
                    const chip = document.createElement('button');
                    chip.className = 'chip';
                    chip.textContent = opt;
                    chip.addEventListener('click', () => handleAnswer(q, opt));
                    chipsDiv.appendChild(chip);
                });

                // Skip chip
                const skipChip = document.createElement('button');
                skipChip.className = 'chip chip-skip';
                skipChip.textContent = 'Skip';
                skipChip.addEventListener('click', () => handleSkip(q));
                chipsDiv.appendChild(skipChip);

                wrapper.appendChild(chipsDiv);
            }

            if (q.suggestion) {
                const hint = document.createElement('div');
                hint.className = 'input-suggestion';
                hint.innerHTML = q.suggestion;
                wrapper.appendChild(hint);
            }

            convInputArea.appendChild(wrapper);
        } else if (q.type === 'text') {
            const wrapper = document.createElement('div');

            const inputRow = document.createElement('div');
            inputRow.className = 'conv-text-input';

            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = q.placeholder || 'Type your answer...';
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter' && input.value.trim()) {
                    handleAnswer(q, input.value.trim());
                }
            });

            const sendBtn = document.createElement('button');
            sendBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
            sendBtn.addEventListener('click', () => {
                if (input.value.trim()) handleAnswer(q, input.value.trim());
            });

            inputRow.appendChild(input);
            inputRow.appendChild(sendBtn);
            wrapper.appendChild(inputRow);

            // Skip link
            const skipRow = document.createElement('div');
            skipRow.className = 'input-suggestion';
            skipRow.innerHTML = `<button class="chip chip-skip" style="font-size:0.78rem;padding:0.25rem 0.65rem;margin-top:0.25rem">Skip</button>`;
            skipRow.querySelector('button').addEventListener('click', () => handleSkip(q));
            if (q.suggestion) {
                skipRow.innerHTML += ` &middot; ${q.suggestion}`;
            }
            wrapper.appendChild(skipRow);

            convInputArea.appendChild(wrapper);
            input.focus();
        }
    }

    // ===== Handle Answer =====
    function handleAnswer(q, value) {
        state.answers[q.id] = value;
        const display = Array.isArray(value) ? value.join(', ') : value;
        addUserMessage(display);
        convInputArea.innerHTML = '';

        // Update spec
        updateSpecSection(q.specSection, q.specRender(value));

        state.currentStep++;
        setTimeout(() => askCurrentQuestion(), 400);
    }

    function handleSkip(q) {
        addUserMessage('Skipped');
        addBotMessage('', 'No problem, the AI will decide this.');
        state.answers[q.id] = null;
        convInputArea.innerHTML = '';

        // Add "AI will decide" to spec
        updateSpecSection(q.specSection, '<span class="spec-tag spec-tag-orange">AI will decide</span>');

        state.currentStep++;
        setTimeout(() => askCurrentQuestion(), 400);
    }

    // ===== Progress =====
    function updateProgress() {
        const total = QUESTIONS.length;
        const pct = Math.round((state.currentStep / total) * 100);
        ringFill.setAttribute('stroke-dasharray', `${pct}, 100`);
        ringText.textContent = `${pct}%`;
    }

    // ===== Spec Panel =====
    function updateSpecSection(title, contentHtml) {
        // Remove empty state
        const empty = specBody.querySelector('.spec-empty');
        if (empty) empty.remove();

        // Check if section exists, update it
        let section = specBody.querySelector(`[data-spec-section="${title}"]`);
        if (section) {
            section.querySelector('.spec-section-content').innerHTML = contentHtml;
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

        addBotMessage(
            `Your spec is ready! Use the export buttons on the right to copy a prompt tailored for your favorite AI tool.` +
            `<br><br>You can also <strong>Save</strong> this plan to revisit later.`
        );

        specFooter.classList.remove('hidden');
    }

    // ===== Prompt Generators =====
    function buildSpec() {
        const s = state.answers;
        const lines = [];
        lines.push(`## App Idea\n${state.idea}\n`);

        QUESTIONS.forEach(q => {
            const val = s[q.id];
            if (val === null || val === undefined) {
                lines.push(`## ${q.specSection}\nUse your best judgment.\n`);
            } else {
                const display = Array.isArray(val) ? val.join(', ') : val;
                lines.push(`## ${q.specSection}\n${display}\n`);
            }
        });

        return lines.join('\n');
    }

    function generatePrompt(target) {
        const spec = buildSpec();

        if (target === 'claude') {
            return `I want you to build the following application. Here's my complete spec:\n\n${spec}\n` +
                `Please start by designing the database schema, then build the backend API, then the frontend UI. ` +
                `Use clean, modern patterns. Build this step by step, starting with the project setup.`;
        }

        if (target === 'cursor') {
            return `Build this application from scratch:\n\n${spec}\n` +
                `Requirements:\n` +
                `- Set up the project with proper folder structure\n` +
                `- Implement all features listed above\n` +
                `- Use TypeScript where possible\n` +
                `- Include proper error handling\n` +
                `- Make the UI responsive and accessible\n` +
                `- Write clean, well-organized code`;
        }

        if (target === 'v0') {
            // v0 is UI-focused
            const vibe = state.answers.vibe || 'clean and modern';
            const features = state.answers.features;
            const featureStr = features ? (Array.isArray(features) ? features.join(', ') : features) : 'standard features';
            return `Create a ${vibe} UI for: ${state.idea}\n\n` +
                `Key features to include in the interface: ${featureStr}\n` +
                (state.answers.features_custom ? `Additional features: ${state.answers.features_custom}\n` : '') +
                `\nMake it responsive with a polished, production-ready feel. Use shadcn/ui components.`;
        }

        // markdown
        return spec;
    }

    // Export buttons
    document.querySelectorAll('.btn-export').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            const text = generatePrompt(target);
            navigator.clipboard.writeText(text).then(() => {
                btn.classList.add('copied');
                const original = btn.innerHTML;
                const label = btn.textContent.trim();
                btn.innerHTML = btn.querySelector('svg').outerHTML + ' Copied!';
                showToast(`${label} prompt copied to clipboard`);
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
                    <div class="history-item-date">${date}</div>
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
        state.answers = { ...plan.answers };
        state.currentStep = QUESTIONS.length;
        state.complete = true;

        landing.classList.add('hidden');
        planner.classList.remove('hidden');
        ideaDisplay.textContent = state.idea;

        // Rebuild conversation and spec
        convMessages.innerHTML = '';
        specBody.innerHTML = '';

        addBotMessage(`Loaded your plan for "${state.idea}".`);
        updateSpecSection('Idea', `<strong>${escapeHtml(state.idea)}</strong>`);

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
        // Remove duplicate by idea text
        const filtered = plans.filter(p => p.idea !== state.idea);
        filtered.unshift({
            idea: state.idea,
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
