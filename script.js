document.addEventListener('DOMContentLoaded', function() {
    // Handle landing page and main planner views
    const landingPage = document.getElementById('landing-page');
    const plannerContent = document.getElementById('planner-content');
    const startPlanningBtn = document.querySelector('.start-planning-btn');
    const projectNameInput = document.getElementById('project-name-start');
    const mainProjectNameInput = document.getElementById('project-name');

    // Ensure landing page project name is empty on page load
    if (projectNameInput) {
        projectNameInput.value = '';
    }

    // Set up dark mode toggle
    setupThemeToggle();

    // Set up the start planning button
    if (startPlanningBtn) {
        startPlanningBtn.addEventListener('click', function(e) {
            e.preventDefault();

            // Use default name if empty
            if (!projectNameInput.value.trim()) {
                projectNameInput.value = "My Awesome App";
            }

            // Transfer project name to the main form
            if (mainProjectNameInput) {
                mainProjectNameInput.value = projectNameInput.value;
            }

            // Hide landing page and show main planner
            landingPage.classList.add('hidden');
            plannerContent.classList.remove('hidden');

            // Save the project name to localStorage
            localStorage.setItem('app-planner-project-name', projectNameInput.value);

            // Reflow the layout to ensure proper display
            window.dispatchEvent(new Event('resize'));

            // Update progress
            updateProgressFill(1);
        });
    }

    // Set up template cards
    setupTemplateCards();

    // Check if returning user with saved progress
    const checkSavedProgress = () => {
        const savedData = localStorage.getItem('app-planner-form-data');
        if (savedData) {
            try {
                console.log('Saved data exists, but not pre-filling project name field');
            } catch (e) {
                console.error('Error parsing saved data:', e);
            }
        }
    };

    // Run check for saved progress
    checkSavedProgress();

    // Get all form sections and navigation links
    const formSections = document.querySelectorAll('.form-section');
    const navLinks = document.querySelectorAll('.nav-link');
    const form = document.getElementById('brief-form');

    // Set up navigation
    setupNavigation();

    // Set up form validation
    setupFormValidation();

    // Set up Up to You functionality
    setupUpToYouCheckboxes();

    // Set up Skip buttons
    setupSkipButtons();

    // Set up Review button
    setupReviewButton();

    // Set up PDF generation
    setupPDFGeneration();

    // Set up progress indicator
    setupProgressIndicator();

    // Set up form persistence
    setupFormPersistence();

    // Set up collapsible sections
    setupCollapsibleSections();

    // Set up recent projects panel
    setupRecentProjectsPanel();

    // Add a "Save Progress" button to the page
    addSaveButton();

    // Set up keyboard navigation
    setupKeyboardNavigation();

    // Set up "Let AI Decide All" button
    setupSkipAllButton();

    // Set up copy buttons
    setupCopyButtons();

    // --- Theme Toggle ---
    function setupThemeToggle() {
        const toggle = document.getElementById('theme-toggle');
        const savedTheme = localStorage.getItem('app-planner-theme');

        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        }

        if (toggle) {
            toggle.addEventListener('click', function() {
                const current = document.documentElement.getAttribute('data-theme');
                const next = current === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', next);
                localStorage.setItem('app-planner-theme', next);
            });
        }
    }

    // --- Template Cards ---
    function setupTemplateCards() {
        const templates = {
            saas: {
                'project-scope': 'MVP',
                'app-type': 'Web Application',
                'platform': ['Web'],
                'frontend': 'React',
                'backend': 'Node.js',
                'database': 'PostgreSQL',
                'hosting': 'AWS / Vercel',
                'auth': 'Email/Password',
                'security-level': 'Medium',
                'browser': ['Chrome', 'Firefox', 'Safari', 'Edge']
            },
            mobile: {
                'project-scope': 'MVP',
                'app-type': 'Mobile App',
                'platform': ['iOS', 'Android'],
                'frontend': 'React Native',
                'backend': 'Firebase',
                'database': 'Firestore',
                'hosting': 'Firebase Hosting',
                'auth': 'OAuth',
                'security-level': 'Medium'
            },
            ecommerce: {
                'project-scope': 'Full Product',
                'app-type': 'Web Application',
                'platform': ['Web'],
                'frontend': 'Next.js',
                'backend': 'Node.js',
                'database': 'PostgreSQL',
                'hosting': 'Vercel',
                'auth': 'Email/Password',
                'security-level': 'High',
                'browser': ['Chrome', 'Firefox', 'Safari', 'Edge']
            },
            portfolio: {
                'project-scope': 'Full Product',
                'app-type': 'Web Application',
                'platform': ['Web'],
                'frontend': 'HTML/CSS/JS',
                'hosting': 'Netlify / GitHub Pages',
                'auth': 'None',
                'security-level': 'Basic',
                'browser': ['Chrome', 'Firefox', 'Safari', 'Edge']
            }
        };

        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', function() {
                const templateName = this.getAttribute('data-template');
                const template = templates[templateName];
                if (!template) return;

                // Set project name if empty
                if (!projectNameInput.value.trim()) {
                    const names = {
                        saas: 'My SaaS App',
                        mobile: 'My Mobile App',
                        ecommerce: 'My E-commerce Store',
                        portfolio: 'My Portfolio'
                    };
                    projectNameInput.value = names[templateName] || 'My App';
                }

                // Transfer to main form
                if (mainProjectNameInput) {
                    mainProjectNameInput.value = projectNameInput.value;
                }

                // Hide landing, show planner
                landingPage.classList.add('hidden');
                plannerContent.classList.remove('hidden');

                // Apply template values
                applyTemplate(template);

                // Save
                localStorage.setItem('app-planner-project-name', projectNameInput.value);
                window.dispatchEvent(new Event('resize'));
                updateProgressFill(1);

                showToast('Template applied! Customize as needed.', 'info');
            });
        });
    }

    function applyTemplate(template) {
        Object.keys(template).forEach(key => {
            const value = template[key];

            if (Array.isArray(value)) {
                // Handle checkbox groups
                document.querySelectorAll(`input[name="${key}"]`).forEach(cb => {
                    cb.checked = value.includes(cb.value);
                });
            } else {
                // Handle radio buttons
                const radio = document.querySelector(`input[name="${key}"][value="${value}"]`);
                if (radio) {
                    radio.checked = true;
                    return;
                }

                // Handle regular inputs/selects
                const el = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
                if (el) {
                    el.value = value;
                }
            }
        });
    }

    // --- Toast Notifications ---
    function showToast(message, type) {
        type = type || 'success';
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(function() {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }

    // --- Keyboard Navigation ---
    function setupKeyboardNavigation() {
        document.addEventListener('keydown', function(e) {
            // Only when planner is visible and not typing in an input
            if (plannerContent.classList.contains('hidden')) return;
            const tag = document.activeElement.tagName.toLowerCase();
            if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

            const sectionIds = [
                'project-overview', 'platform-tech', 'design-visuals',
                'user-interaction', 'content-data', 'performance',
                'additional-features', 'review-section'
            ];

            const currentSection = document.querySelector('.form-section.active');
            if (!currentSection) return;
            const currentIndex = sectionIds.indexOf(currentSection.id);

            if (e.key === 'ArrowRight' && currentIndex < sectionIds.length - 1) {
                e.preventDefault();
                const nextSection = document.getElementById(sectionIds[currentIndex + 1]);
                if (currentIndex < sectionIds.length - 2 || currentSection.id === 'additional-features') {
                    // For review section, generate content first
                    if (sectionIds[currentIndex + 1] === 'review-section') {
                        generateReviewContent();
                    }
                    navigateToSection(nextSection);
                }
            } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
                e.preventDefault();
                navigateToSection(document.getElementById(sectionIds[currentIndex - 1]));
            }
        });
    }

    // --- Skip All Button ---
    function setupSkipAllButton() {
        const skipAllBtn = document.getElementById('skip-all-btn');
        if (skipAllBtn) {
            skipAllBtn.addEventListener('click', function() {
                // Check all AI decision checkboxes across all sections
                const allCheckboxes = document.querySelectorAll('.up-to-you');
                allCheckboxes.forEach(function(checkbox) {
                    checkbox.checked = true;
                    checkbox.dispatchEvent(new Event('change'));
                });

                // Generate review and navigate there
                generateReviewContent();
                navigateToSection(document.getElementById('review-section'));

                showToast('All fields set to AI decision', 'info');
            });
        }
    }

    // --- Copy Buttons ---
    function setupCopyButtons() {
        var copyMdBtn = document.getElementById('copy-markdown');
        var copyPromptBtn = document.getElementById('copy-prompt');

        if (copyMdBtn) {
            copyMdBtn.addEventListener('click', function() {
                var markdown = generateMarkdownBrief();
                copyToClipboard(markdown, this);
            });
        }

        if (copyPromptBtn) {
            copyPromptBtn.addEventListener('click', function() {
                var prompt = generateAIPrompt();
                copyToClipboard(prompt, this);
            });
        }
    }

    function copyToClipboard(text, button) {
        navigator.clipboard.writeText(text).then(function() {
            var originalText = button.textContent;
            button.classList.add('copied');
            button.textContent = 'Copied!';
            showToast('Copied to clipboard', 'success');

            setTimeout(function() {
                button.classList.remove('copied');
                button.textContent = originalText;
            }, 2000);
        }).catch(function() {
            // Fallback
            var textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);

            button.classList.add('copied');
            var originalText = button.textContent;
            button.textContent = 'Copied!';
            showToast('Copied to clipboard', 'success');

            setTimeout(function() {
                button.classList.remove('copied');
                button.textContent = originalText;
            }, 2000);
        });
    }

    function generateMarkdownBrief() {
        var projectName = document.getElementById('project-name').value.trim() || 'Untitled Project';
        var md = '# ' + projectName + ' - Project Brief\n\n';

        function isUpToYou(fieldName) {
            var cb = document.querySelector('.up-to-you[data-field="' + fieldName + '"]');
            return cb && cb.checked;
        }

        function fieldVal(id, label) {
            if (isUpToYou(id)) return '- **' + label + ':** _AI to decide_\n';
            var el = document.getElementById(id);
            var val = el ? el.value.trim() : '';
            if (!val) return '- **' + label + ':** Not specified\n';
            return '- **' + label + ':** ' + val + '\n';
        }

        function checkboxGroupVal(name, label) {
            if (isUpToYou(name)) return '- **' + label + ':** _AI to decide_\n';
            var checked = [];
            document.querySelectorAll('input[name="' + name + '"]:checked').forEach(function(cb) {
                checked.push(cb.value);
            });
            return '- **' + label + ':** ' + (checked.length ? checked.join(', ') : 'Not specified') + '\n';
        }

        function radioVal(name, label) {
            if (isUpToYou(name)) return '- **' + label + ':** _AI to decide_\n';
            var selected = document.querySelector('input[name="' + name + '"]:checked');
            return '- **' + label + ':** ' + (selected ? selected.value : 'Not specified') + '\n';
        }

        // Project Overview
        md += '## Project Overview\n';
        md += fieldVal('project-name', 'Name');
        md += fieldVal('project-goal', 'Goal');
        md += fieldVal('project-description', 'Description');
        md += fieldVal('target-audience', 'Target Audience');
        md += fieldVal('project-scope', 'Scope');
        md += '\n';

        // Platform & Tech
        md += '## Platform & Technical Requirements\n';
        md += fieldVal('app-type', 'Application Type');
        md += checkboxGroupVal('platform', 'Target Platforms');
        md += fieldVal('frontend', 'Frontend');
        md += fieldVal('backend', 'Backend');
        md += fieldVal('database', 'Database');
        md += fieldVal('hosting', 'Hosting');
        md += fieldVal('apis', 'APIs');
        md += fieldVal('timeline', 'Timeline');
        md += fieldVal('technical-constraints', 'Constraints');
        md += '\n';

        // Design
        md += '## Design & Visuals\n';
        md += fieldVal('art-style', 'Art Style');
        if (isUpToYou('colors')) {
            md += '- **Colors:** _AI to decide_\n';
        } else {
            var pc = document.getElementById('primary-color').value;
            var sc = document.getElementById('secondary-color').value;
            md += '- **Colors:** Primary: ' + pc + ', Secondary: ' + sc + '\n';
        }
        md += fieldVal('typography', 'Typography');
        md += fieldVal('visual-references', 'Visual References');
        md += '\n';

        // UX
        md += '## User Interaction & Experience\n';
        md += fieldVal('inputs', 'Inputs');
        md += fieldVal('outputs', 'Outputs');
        md += '\n';

        // Content & Data
        md += '## Content & Data Management\n';
        md += radioVal('auth', 'Authentication');
        md += fieldVal('security-level', 'Security Level');
        md += fieldVal('data-storage', 'Data Storage');
        md += checkboxGroupVal('ai-features', 'AI Integration');
        md += '\n';

        // Performance
        md += '## Performance & Compatibility\n';
        md += fieldVal('speed', 'Speed & Responsiveness');
        md += fieldVal('seo', 'SEO & Accessibility');
        md += checkboxGroupVal('browser', 'Browser Compatibility');
        md += '\n';

        // Features
        md += '## Additional Features\n';
        md += fieldVal('features', 'Features Requested');
        md += fieldVal('success-criteria', 'Success Criteria');
        md += fieldVal('existing-products', 'Similar Products');
        md += fieldVal('budget-constraints', 'Budget');

        return md;
    }

    function generateAIPrompt() {
        var brief = generateMarkdownBrief();
        var prompt = 'You are an expert software developer. Build the following application based on this project brief. ';
        prompt += 'For any field marked as "AI to decide", use your best judgment to make appropriate technical decisions.\n\n';
        prompt += '---\n\n';
        prompt += brief;
        prompt += '\n---\n\n';
        prompt += 'Please start by creating the project structure and implementing the core functionality. ';
        prompt += 'Use modern best practices and clean, maintainable code.';
        return prompt;
    }

    // --- Progress Fill Bar ---
    function updateProgressFill(stepNumber) {
        var fill = document.getElementById('progress-fill');
        var pct = document.getElementById('progress-percentage');
        if (!fill || !pct) return;

        var percentage = Math.round(((stepNumber - 1) / 7) * 100);
        fill.style.width = percentage + '%';
        pct.textContent = percentage + '% complete';
    }

    // Navigation functions
    function setupNavigation() {
        // Set up next buttons
        const nextButtons = document.querySelectorAll('.next-btn');
        nextButtons.forEach(button => {
            button.addEventListener('click', function() {
                const currentSection = button.closest('.form-section');
                const nextSection = currentSection.nextElementSibling;

                // Validate current section before proceeding
                if (validateSection(currentSection)) {
                    navigateToSection(nextSection);
                }
            });
        });

        // Set up previous buttons
        const prevButtons = document.querySelectorAll('.prev-btn');
        prevButtons.forEach(button => {
            button.addEventListener('click', function() {
                const currentSection = button.closest('.form-section');
                const prevSection = currentSection.previousElementSibling;
                navigateToSection(prevSection);
            });
        });

        // Set up navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();

                if (e.target.closest('.edit-section-btn')) {
                    return false;
                }

                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                navigateToSection(targetSection);
            });
        });
    }

    // Navigate to a specific section
    function navigateToSection(section) {
        if (!section) return;

        const activeElement = document.activeElement;
        if (activeElement && activeElement.closest('.edit-section-btn')) {
            return false;
        }

        // Update active section
        formSections.forEach(s => s.classList.remove('active'));
        section.classList.add('active');

        // Update active nav link
        const sectionId = section.getAttribute('id');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + sectionId) {
                link.classList.add('active');
            }
        });

        // Update progress indicator
        updateProgressIndicator(sectionId);

        // Scroll to top of the form
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Set up progress indicator
    function setupProgressIndicator() {
        const progressSteps = document.querySelectorAll('.progress-step');
        progressSteps.forEach(step => {
            step.addEventListener('click', function() {
                const targetStep = parseInt(this.getAttribute('data-step'));
                const sectionToStep = {
                    'project-overview': 1,
                    'platform-tech': 2,
                    'design-visuals': 3,
                    'user-interaction': 4,
                    'content-data': 5,
                    'performance': 6,
                    'additional-features': 7,
                    'review-section': 8
                };
                const targetSectionId = Object.keys(sectionToStep).find(key => sectionToStep[key] === targetStep);
                if (targetSectionId) {
                    if (targetSectionId === 'review-section') {
                        generateReviewContent();
                    }
                    navigateToSection(document.getElementById(targetSectionId));
                }
            });
        });
    }

    // Update progress indicator based on current section
    function updateProgressIndicator(sectionId) {
        const sectionToStep = {
            'project-overview': 1,
            'platform-tech': 2,
            'design-visuals': 3,
            'user-interaction': 4,
            'content-data': 5,
            'performance': 6,
            'additional-features': 7,
            'review-section': 8
        };

        const currentStep = sectionToStep[sectionId] || 1;

        const progressSteps = document.querySelectorAll('.progress-step');
        const progressLabels = document.querySelectorAll('.progress-label');

        progressSteps.forEach((step, index) => {
            step.classList.remove('active', 'completed');

            const stepNumber = index + 1;
            if (stepNumber === currentStep) {
                step.classList.add('active');
            } else if (stepNumber < currentStep) {
                step.classList.add('completed');
            }
        });

        progressLabels.forEach((label, index) => {
            label.classList.remove('active');
            if (index + 1 === currentStep) {
                label.classList.add('active');
            }
        });

        // Update progress fill bar
        updateProgressFill(currentStep);
    }

    // Form validation
    function setupFormValidation() {
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            field.addEventListener('blur', function() {
                validateField(this);
            });

            field.addEventListener('input', function() {
                const validationMessage = this.nextElementSibling;
                if (validationMessage && validationMessage.classList.contains('validation-message')) {
                    validationMessage.textContent = '';
                }
            });
        });
    }

    function validateField(field) {
        const fieldName = field.getAttribute('id') || field.getAttribute('name');
        const upToYouCheckbox = form.querySelector('.up-to-you[data-field="' + fieldName + '"]');

        if (upToYouCheckbox && upToYouCheckbox.checked) {
            return true;
        }

        const validationMessage = form.querySelector('#' + fieldName + ' + .validation-message') ||
                                  field.closest('.input-with-uty')?.nextElementSibling;

        if (!validationMessage || !validationMessage.classList.contains('validation-message')) {
            return true;
        }

        if (!field.value.trim()) {
            validationMessage.textContent = 'This field is required';
            return false;
        } else {
            validationMessage.textContent = '';
            return true;
        }
    }

    function validateSection(section) {
        const requiredFields = section.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    // Set up "AI decision" checkboxes
    function setupUpToYouCheckboxes() {
        const upToYouCheckboxes = document.querySelectorAll('.up-to-you');

        upToYouCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                toggleInputState(checkbox);
            }

            checkbox.addEventListener('change', function() {
                toggleInputState(this);
            });
        });
    }

    // Set up Skip buttons
    function setupSkipButtons() {
        const skipButtons = document.querySelectorAll('.skip-btn');

        skipButtons.forEach(button => {
            button.addEventListener('click', function() {
                const sectionId = this.getAttribute('data-section');
                const section = document.getElementById(sectionId);

                if (section) {
                    const checkboxes = section.querySelectorAll('.up-to-you');

                    checkboxes.forEach(checkbox => {
                        checkbox.checked = true;
                        checkbox.dispatchEvent(new Event('change'));
                    });

                    const nextSection = section.nextElementSibling;
                    if (nextSection) {
                        navigateToSection(nextSection);
                    }
                }
            });
        });
    }

    // Set up Review button
    function setupReviewButton() {
        const reviewButton = document.getElementById('review-btn');

        reviewButton.addEventListener('click', function() {
            const currentSection = this.closest('.form-section');
            if (validateSection(currentSection)) {
                generateReviewContent();

                const reviewSection = document.getElementById('review-section');
                navigateToSection(reviewSection);
            }
        });
    }

    // Generate review content
    function generateReviewContent() {
        const reviewContent = document.getElementById('review-content');
        reviewContent.innerHTML = '';

        const sectionTitles = {
            'project-overview': '1. Project Overview',
            'platform-tech': '2. Platform & Technical Requirements',
            'design-visuals': '3. Design & Visuals',
            'user-interaction': '4. User Interaction & Experience',
            'content-data': '5. Content & Data Management',
            'performance': '6. Performance & Compatibility',
            'additional-features': '7. Additional Features'
        };

        Object.keys(sectionTitles).forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (!section) return;

            const sectionReview = document.createElement('div');
            sectionReview.className = 'review-section-item';
            sectionReview.setAttribute('data-section-id', sectionId);

            const sectionHeader = document.createElement('div');
            sectionHeader.className = 'review-section-header';

            const title = document.createElement('h3');
            title.textContent = sectionTitles[sectionId];

            const editButton = document.createElement('button');
            editButton.className = 'edit-section-btn';
            editButton.textContent = 'Edit';
            editButton.setAttribute('data-section', sectionId);

            editButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                const sectionContainer = this.closest('.review-section-item');
                toggleEditMode(sectionContainer);
                return false;
            });

            sectionHeader.appendChild(title);
            sectionHeader.appendChild(editButton);
            sectionReview.appendChild(sectionHeader);

            const sectionContent = document.createElement('div');
            sectionContent.className = 'review-section-content';

            const fields = getFieldsFromSection(section);

            fields.forEach(field => {
                const fieldElement = document.createElement('div');
                fieldElement.className = 'review-field';
                fieldElement.setAttribute('data-field-id', field.id);
                fieldElement.setAttribute('data-field-type', field.type || 'text');

                const label = document.createElement('span');
                label.className = 'review-field-label';
                label.textContent = field.label + ': ';

                const valueDisplay = document.createElement('span');
                valueDisplay.className = 'review-field-value';

                if (field.isAIDecision) {
                    valueDisplay.classList.add('review-ai-decision');
                    valueDisplay.textContent = 'AI decision';
                } else {
                    valueDisplay.textContent = field.value || 'Not specified';
                }

                const aiCheckboxContainer = document.createElement('div');
                aiCheckboxContainer.className = 'review-ai-checkbox';

                const aiCheckbox = document.createElement('input');
                aiCheckbox.type = 'checkbox';
                aiCheckbox.className = 'review-up-to-you';
                aiCheckbox.checked = field.isAIDecision;
                aiCheckbox.setAttribute('data-field-id', field.id);

                const aiCheckboxLabel = document.createElement('label');
                aiCheckboxLabel.textContent = 'AI decision';

                aiCheckboxContainer.appendChild(aiCheckbox);
                aiCheckboxContainer.appendChild(aiCheckboxLabel);

                const inputContainer = document.createElement('div');
                inputContainer.className = 'review-field-edit hidden';

                let inputElement;

                if (field.type === 'textarea') {
                    inputElement = document.createElement('textarea');
                    inputElement.rows = 3;
                } else if (field.type === 'select') {
                    inputElement = document.createElement('select');

                    if (field.id === 'app-type') {
                        ['', 'Web Application', 'Mobile App', 'Desktop Application', 'API/Service', 'Other'].forEach(option => {
                            const optionEl = document.createElement('option');
                            optionEl.value = option;
                            optionEl.textContent = option || 'Select application type';
                            if (field.value === option) optionEl.selected = true;
                            inputElement.appendChild(optionEl);
                        });
                    } else if (field.id === 'security-level') {
                        ['', 'Basic', 'Medium', 'High', 'Enterprise'].forEach(option => {
                            const optionEl = document.createElement('option');
                            optionEl.value = option;
                            optionEl.textContent = option || 'Select security level';
                            if (field.value === option) optionEl.selected = true;
                            inputElement.appendChild(optionEl);
                        });
                    } else if (field.id === 'project-scope') {
                        ['', 'MVP', 'Prototype', 'Full Product', 'Feature Addition'].forEach(option => {
                            const optionEl = document.createElement('option');
                            optionEl.value = option;
                            optionEl.textContent = option || 'Select project scope';
                            if (field.value === option) optionEl.selected = true;
                            inputElement.appendChild(optionEl);
                        });
                    } else if (field.id === 'timeline') {
                        ['', 'Under 1 month', '1-3 months', '3-6 months', '6-12 months', 'Over 12 months'].forEach(option => {
                            const optionEl = document.createElement('option');
                            optionEl.value = option;
                            optionEl.textContent = option || 'Select expected timeline';
                            if (field.value === option) optionEl.selected = true;
                            inputElement.appendChild(optionEl);
                        });
                    } else if (field.id === 'budget-constraints') {
                        ['', 'Low', 'Medium', 'High', 'Enterprise'].forEach(option => {
                            const optionEl = document.createElement('option');
                            optionEl.value = option;
                            optionEl.textContent = option || 'Select budget range';
                            if (field.value === option) optionEl.selected = true;
                            inputElement.appendChild(optionEl);
                        });
                    }
                } else if (field.type === 'checkbox-group' || field.type === 'radio-group' || field.type === 'color-picker') {
                    inputElement = document.createElement('div');
                    inputElement.className = 'complex-field-message';
                    inputElement.textContent = 'For ' + field.label.toLowerCase() + ', please edit in the original form section.';
                } else {
                    inputElement = document.createElement('input');
                    inputElement.type = 'text';
                }

                if (inputElement.tagName !== 'DIV') {
                    inputElement.className = 'review-input';
                    inputElement.name = field.id;
                    inputElement.value = field.value || '';
                    inputElement.setAttribute('data-field-id', field.id);

                    if (field.required) {
                        inputElement.required = true;
                    }

                    inputElement.addEventListener('input', function() {
                        updateOriginalField(field.id, this.value);
                    });

                    inputElement.addEventListener('blur', function() {
                        valueDisplay.textContent = this.value || 'Not specified';
                    });
                }

                inputContainer.appendChild(inputElement);

                aiCheckbox.addEventListener('change', function() {
                    const originalCheckbox = document.querySelector('.up-to-you[data-field="' + field.id + '"]');
                    if (originalCheckbox) {
                        originalCheckbox.checked = this.checked;
                        originalCheckbox.dispatchEvent(new Event('change'));
                    }

                    if (this.checked) {
                        valueDisplay.textContent = 'AI decision';
                        valueDisplay.classList.add('review-ai-decision');
                        if (inputElement.tagName !== 'DIV') {
                            inputElement.disabled = true;
                        }
                    } else {
                        valueDisplay.textContent = inputElement.value || 'Not specified';
                        valueDisplay.classList.remove('review-ai-decision');
                        if (inputElement.tagName !== 'DIV') {
                            inputElement.disabled = false;
                        }
                    }
                });

                fieldElement.appendChild(label);
                fieldElement.appendChild(valueDisplay);
                fieldElement.appendChild(aiCheckboxContainer);
                fieldElement.appendChild(inputContainer);

                sectionContent.appendChild(fieldElement);
            });

            sectionReview.appendChild(sectionContent);
            reviewContent.appendChild(sectionReview);
        });
    }

    function toggleEditMode(sectionContainer) {
        if (!sectionContainer.classList.contains('editing')) {
            const currentlyEditing = document.querySelector('.review-section-item.editing');
            if (currentlyEditing && currentlyEditing !== sectionContainer) {
                toggleEditMode(currentlyEditing);
            }
        }

        sectionContainer.classList.toggle('editing');

        const button = sectionContainer.querySelector('.edit-section-btn');

        if (sectionContainer.classList.contains('editing')) {
            button.textContent = 'Done';

            const fields = sectionContainer.querySelectorAll('.review-field');
            fields.forEach(field => {
                const fieldEdit = field.querySelector('.review-field-edit');
                if (fieldEdit) {
                    fieldEdit.classList.remove('hidden');
                }

                const aiCheckboxContainer = field.parentNode.querySelector('.review-ai-checkbox');
                if (aiCheckboxContainer) {
                    aiCheckboxContainer.style.display = 'block';
                }
            });
        } else {
            button.textContent = 'Edit';

            const fields = sectionContainer.querySelectorAll('.review-field');
            fields.forEach(field => {
                const fieldEdit = field.querySelector('.review-field-edit');
                const fieldId = field.getAttribute('data-field-id');
                const input = fieldEdit.querySelector('input, textarea, select');
                if (input) {
                    updateOriginalField(fieldId, input.value);

                    const fieldValue = field.querySelector('.review-field-value');
                    if (fieldValue) {
                        const isAIDecision = field.parentNode.querySelector('.review-ai-checkbox input[data-field-id="' + fieldId + '"]')?.checked;

                        if (isAIDecision) {
                            fieldValue.textContent = 'AI decision';
                            fieldValue.classList.add('review-ai-decision');
                        } else {
                            fieldValue.textContent = input.value || 'Not specified';
                            fieldValue.classList.remove('review-ai-decision');
                        }
                    }
                }

                if (fieldEdit) {
                    fieldEdit.classList.add('hidden');
                }

                const aiCheckboxContainer = field.parentNode.querySelector('.review-ai-checkbox');
                if (aiCheckboxContainer) {
                    aiCheckboxContainer.style.display = 'none';
                }
            });
        }
    }

    function createFieldObject(id, label, type) {
        type = type || 'text';
        const field = document.getElementById(id);
        if (!field) return null;

        return {
            id: id,
            label: label,
            value: field.value.trim(),
            isAIDecision: document.querySelector('.up-to-you[data-field="' + id + '"]')?.checked || false,
            type: type,
            required: field.hasAttribute('required')
        };
    }

    function updateOriginalField(fieldId, value) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.value = value;
        }
    }

    function getFieldsFromSection(section) {
        const fields = [];
        const sectionId = section.getAttribute('id');

        if (sectionId === 'project-overview') {
            fields.push(createFieldObject('project-name', 'Project Name'));
            fields.push(createFieldObject('project-goal', 'Goal'));
            fields.push(createFieldObject('project-description', 'Description', 'textarea'));
            fields.push(createFieldObject('target-audience', 'Target Audience', 'textarea'));
            fields.push(createFieldObject('project-scope', 'Project Scope', 'select'));
        } else if (sectionId === 'platform-tech') {
            fields.push(createFieldObject('app-type', 'Application Type', 'select'));

            const platformCheckboxes = section.querySelectorAll('input[name="platform"]:checked');
            const platformValues = Array.from(platformCheckboxes).map(cb => cb.value);
            fields.push({
                id: 'platform',
                label: 'Target Platforms',
                value: platformValues.join(', '),
                isAIDecision: document.querySelector('.up-to-you[data-field="platform"]').checked,
                type: 'checkboxGroup'
            });

            fields.push(createFieldObject('frontend', 'Frontend'));
            fields.push(createFieldObject('backend', 'Backend'));
            fields.push(createFieldObject('database', 'Database'));
            fields.push(createFieldObject('hosting', 'Hosting'));
            fields.push(createFieldObject('apis', 'APIs'));
            fields.push(createFieldObject('timeline', 'Project Timeline', 'select'));
            fields.push(createFieldObject('technical-constraints', 'Technical Constraints', 'textarea'));
        } else if (sectionId === 'design-visuals') {
            fields.push(createFieldObject('art-style', 'Art Style'));

            const primaryColor = document.getElementById('primary-color').value;
            const secondaryColor = document.getElementById('secondary-color').value;
            fields.push({
                id: 'colors',
                label: 'Colors',
                value: 'Primary: ' + primaryColor + ', Secondary: ' + secondaryColor,
                isAIDecision: document.querySelector('.up-to-you[data-field="colors"]').checked,
                type: 'colorPickers'
            });

            fields.push(createFieldObject('typography', 'Typography'));
            fields.push(createFieldObject('visual-references', 'Visual References', 'textarea'));
        } else if (sectionId === 'user-interaction') {
            fields.push(createFieldObject('inputs', 'Inputs', 'textarea'));
            fields.push(createFieldObject('outputs', 'Outputs', 'textarea'));
        } else if (sectionId === 'content-data') {
            let authValue = '';
            const authRadios = section.querySelectorAll('input[name="auth"]:checked');
            if (authRadios.length > 0) {
                authValue = authRadios[0].value;
            }
            fields.push({
                id: 'auth',
                label: 'User Authentication',
                value: authValue,
                isAIDecision: document.querySelector('.up-to-you[data-field="auth"]').checked,
                type: 'radio'
            });

            fields.push(createFieldObject('data-storage', 'Data Storage & Privacy', 'textarea'));
            fields.push(createFieldObject('security-level', 'Security Level', 'select'));

            const aiFeatureCheckboxes = section.querySelectorAll('input[name="ai-features"]:checked');
            const aiFeatureValues = Array.from(aiFeatureCheckboxes).map(cb => cb.value);
            fields.push({
                id: 'ai-features',
                label: 'AI Integration',
                value: aiFeatureValues.join(', '),
                isAIDecision: document.querySelector('.up-to-you[data-field="ai-features"]').checked,
                type: 'checkboxGroup'
            });
        } else if (sectionId === 'performance') {
            fields.push(createFieldObject('speed', 'Speed & Responsiveness', 'textarea'));
            fields.push(createFieldObject('seo', 'SEO & Accessibility', 'textarea'));

            const browserCheckboxes = section.querySelectorAll('input[name="browser"]:checked');
            const browserValues = Array.from(browserCheckboxes).map(cb => cb.value);
            fields.push({
                id: 'browser',
                label: 'Browser Compatibility',
                value: browserValues.join(', '),
                isAIDecision: document.querySelector('.up-to-you[data-field="browser"]').checked,
                type: 'checkboxGroup'
            });
        } else if (sectionId === 'additional-features') {
            fields.push(createFieldObject('features', 'Features Requested', 'textarea'));
            fields.push(createFieldObject('success-criteria', 'Success Criteria', 'textarea'));
            fields.push(createFieldObject('existing-products', 'Similar Products & Inspiration', 'textarea'));
            fields.push(createFieldObject('budget-constraints', 'Budget Constraints', 'select'));
        }

        return fields;
    }

    // PDF Generation
    function setupPDFGeneration() {
        const generateBtn = document.getElementById('generate-pdf');

        generateBtn.addEventListener('click', function() {
            const allRequiredFields = form.querySelectorAll('[required]');
            let isValid = true;

            allRequiredFields.forEach(field => {
                const fieldName = field.getAttribute('id') || field.getAttribute('name');
                const upToYouCheckbox = form.querySelector('.up-to-you[data-field="' + fieldName + '"]');

                if (upToYouCheckbox && upToYouCheckbox.checked) {
                    return;
                }

                if (!validateField(field)) {
                    isValid = false;
                    const section = field.closest('.form-section');
                    navigateToSection(section);
                }
            });

            if (isValid) {
                const format = document.getElementById('export-format').value;
                if (format === 'pdf') {
                    generatePDF();
                } else if (format === 'txt') {
                    generateTXT();
                }
                showToast('Brief generated successfully!', 'success');
            } else {
                showToast('Please fill in all required fields.', 'error');
            }
        });
    }

    // Generate TXT file with form data
    function generateTXT() {
        const projectNameField = document.getElementById('project-name');
        const projectName = projectNameField.value.trim() || 'Project Brief';
        const isProjectNameUpToYou = document.querySelector('.up-to-you[data-field="project-name"]').checked;
        const titleText = isProjectNameUpToYou ? "Project Brief (Name: AI decision)" : projectName + " Brief";

        let content = titleText + "\n";
        content += "=".repeat(titleText.length) + "\n\n";

        const date = new Date();
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        content += 'Generated: ' + formattedDate + '\n\n';

        function addSectionHeading(text) {
            content += "\n" + text + "\n";
            content += "-".repeat(text.length) + "\n\n";
        }

        function addField(label, value, isUpToYouVal) {
            if (isUpToYouVal) {
                value = "AI decision";
            } else if (!value || value.trim() === '') {
                value = 'Not specified';
            }
            content += label + ': ' + value + '\n';
        }

        function isUpToYou(fieldName) {
            const checkbox = document.querySelector('.up-to-you[data-field="' + fieldName + '"]');
            return checkbox && checkbox.checked;
        }

        addSectionHeading('1. Project Overview');
        addField('Name', projectNameField.value, isUpToYou('project-name'));
        addField('Goal', document.getElementById('project-goal').value, isUpToYou('project-goal'));
        addField('Description', document.getElementById('project-description').value, isUpToYou('project-description'));
        addField('Target Audience', document.getElementById('target-audience').value, isUpToYou('target-audience'));
        addField('Project Scope', document.getElementById('project-scope').value, isUpToYou('project-scope'));

        addSectionHeading('2. Platform & Technical Requirements');
        addField('Application Type', document.getElementById('app-type').value, isUpToYou('app-type'));

        const platforms = [];
        document.querySelectorAll('input[name="platform"]:checked').forEach(checkbox => {
            platforms.push(checkbox.value);
        });
        addField('Target Platforms', platforms.join(', '), isUpToYou('platform'));

        addField('Frontend', document.getElementById('frontend').value, isUpToYou('frontend'));
        addField('Backend', document.getElementById('backend').value, isUpToYou('backend'));
        addField('Database', document.getElementById('database').value, isUpToYou('database'));
        addField('Hosting', document.getElementById('hosting').value, isUpToYou('hosting'));
        addField('APIs', document.getElementById('apis').value, isUpToYou('apis'));
        addField('Project Timeline', document.getElementById('timeline').value, isUpToYou('timeline'));
        addField('Technical Constraints', document.getElementById('technical-constraints').value, isUpToYou('technical-constraints'));

        addSectionHeading('3. Design & Visuals');
        addField('Art Style', document.getElementById('art-style').value, isUpToYou('art-style'));

        const primaryColor = document.getElementById('primary-color').value;
        const secondaryColor = document.getElementById('secondary-color').value;
        addField('Colors', 'Primary: ' + primaryColor + ', Secondary: ' + secondaryColor, isUpToYou('colors'));

        addField('Typography', document.getElementById('typography').value, isUpToYou('typography'));
        addField('Visual References', document.getElementById('visual-references').value, isUpToYou('visual-references'));

        addSectionHeading('4. User Interaction & Experience');
        addField('Inputs', document.getElementById('inputs').value, isUpToYou('inputs'));
        addField('Outputs', document.getElementById('outputs').value, isUpToYou('outputs'));

        addSectionHeading('5. Content & Data Management');

        let authMethod = 'None';
        document.querySelectorAll('input[name="auth"]').forEach(radio => {
            if (radio.checked) authMethod = radio.value;
        });
        addField('User Authentication', authMethod, isUpToYou('auth'));

        addField('Data Storage & Privacy', document.getElementById('data-storage').value, isUpToYou('data-storage'));
        addField('Security Level', document.getElementById('security-level').value, isUpToYou('security-level'));

        const aiFeatures = [];
        document.querySelectorAll('input[name="ai-features"]:checked').forEach(checkbox => {
            aiFeatures.push(checkbox.value);
        });
        addField('AI Integration', aiFeatures.join(', '), isUpToYou('ai-features'));

        addSectionHeading('6. Performance & Compatibility');
        addField('Speed & Responsiveness', document.getElementById('speed').value, isUpToYou('speed'));
        addField('SEO & Accessibility', document.getElementById('seo').value, isUpToYou('seo'));

        const browsers = [];
        document.querySelectorAll('input[name="browser"]:checked').forEach(checkbox => {
            browsers.push(checkbox.value);
        });
        addField('Browser Compatibility', browsers.join(', '), isUpToYou('browser'));

        addSectionHeading('7. Additional Features');
        addField('Features Requested', document.getElementById('features').value, isUpToYou('features'));
        addField('Success Criteria', document.getElementById('success-criteria').value, isUpToYou('success-criteria'));
        addField('Similar Products & Inspiration', document.getElementById('existing-products').value, isUpToYou('existing-products'));
        addField('Budget Constraints', document.getElementById('budget-constraints').value, isUpToYou('budget-constraints'));

        const blob = new Blob([content], { type: 'text/plain' });
        const link = document.createElement('a');
        const safeName = projectName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '') || 'Project_Brief';
        link.download = safeName + '_brief.txt';
        link.href = window.URL.createObjectURL(blob);
        link.click();
        window.URL.revokeObjectURL(link.href);
    }

    // Generate PDF with form data
    function generatePDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const projectNameField = document.getElementById('project-name');
        const projectName = projectNameField.value.trim() || 'Project Brief';
        const isProjectNameUpToYou = document.querySelector('.up-to-you[data-field="project-name"]').checked;
        const titleText = isProjectNameUpToYou ? "Project Brief (Name: AI decision)" : projectName + " Brief";

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.text(titleText, 105, 20, { align: 'center' });

        let yPos = 35;
        const lineHeight = 8;
        const leftMargin = 20;
        const pageWidth = 190;
        const labelWidth = 65;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);

        const date = new Date();
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        function addSectionHeading(text) {
            if (yPos > 35) yPos += 10;
            if (yPos > 260) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.text(text, leftMargin, yPos);
            doc.line(leftMargin, yPos + 1, pageWidth, yPos + 1);
            yPos += lineHeight + 2;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
        }

        function addField(label, value, isUpToYouVal) {
            const estimatedHeight = (typeof value === 'string' && value.length > 60) ?
                Math.ceil(value.length / 60) * (lineHeight - 2) + 10 : lineHeight;

            if (yPos + estimatedHeight > 270) {
                doc.addPage();
                yPos = 20;
            }

            if (isUpToYouVal) {
                value = "AI decision";
            } else if (!value || value.trim() === '') {
                value = 'Not specified';
            }

            if (typeof value === 'string' && value.length > 60) {
                doc.setFont('helvetica', 'bold');
                doc.text(label + ':', leftMargin, yPos);
                yPos += lineHeight;

                doc.setFont('helvetica', 'normal');
                const splitText = doc.splitTextToSize(value, pageWidth - leftMargin * 2);
                doc.text(splitText, leftMargin + 5, yPos);
                yPos += (splitText.length * (lineHeight - 2)) + 4;
            } else {
                doc.setFont('helvetica', 'bold');
                doc.text(label + ':', leftMargin, yPos);

                doc.setFont('helvetica', 'normal');
                doc.text(value, leftMargin + labelWidth, yPos);
                yPos += lineHeight;
            }
        }

        function isUpToYou(fieldName) {
            const checkbox = document.querySelector('.up-to-you[data-field="' + fieldName + '"]');
            return checkbox && checkbox.checked;
        }

        addSectionHeading('1. Project Overview');
        addField('Name', projectNameField.value, isUpToYou('project-name'));
        addField('Goal', document.getElementById('project-goal').value, isUpToYou('project-goal'));
        addField('Description', document.getElementById('project-description').value, isUpToYou('project-description'));
        addField('Target Audience', document.getElementById('target-audience').value, isUpToYou('target-audience'));
        addField('Project Scope', document.getElementById('project-scope').value, isUpToYou('project-scope'));

        addSectionHeading('2. Platform & Technical Requirements');
        addField('Application Type', document.getElementById('app-type').value, isUpToYou('app-type'));

        const platforms = [];
        document.querySelectorAll('input[name="platform"]:checked').forEach(checkbox => {
            platforms.push(checkbox.value);
        });
        addField('Target Platforms', platforms.join(', '), isUpToYou('platform'));

        addField('Frontend', document.getElementById('frontend').value, isUpToYou('frontend'));
        addField('Backend', document.getElementById('backend').value, isUpToYou('backend'));
        addField('Database', document.getElementById('database').value, isUpToYou('database'));
        addField('Hosting', document.getElementById('hosting').value, isUpToYou('hosting'));
        addField('APIs', document.getElementById('apis').value, isUpToYou('apis'));
        addField('Project Timeline', document.getElementById('timeline').value, isUpToYou('timeline'));
        addField('Technical Constraints', document.getElementById('technical-constraints').value, isUpToYou('technical-constraints'));

        addSectionHeading('3. Design & Visuals');
        addField('Art Style', document.getElementById('art-style').value, isUpToYou('art-style'));

        const primaryColor = document.getElementById('primary-color').value;
        const secondaryColor = document.getElementById('secondary-color').value;
        addField('Colors', 'Primary: ' + primaryColor + ', Secondary: ' + secondaryColor, isUpToYou('colors'));

        addField('Typography', document.getElementById('typography').value, isUpToYou('typography'));
        addField('Visual References', document.getElementById('visual-references').value, isUpToYou('visual-references'));

        addSectionHeading('4. User Interaction & Experience');
        addField('Inputs', document.getElementById('inputs').value, isUpToYou('inputs'));
        addField('Outputs', document.getElementById('outputs').value, isUpToYou('outputs'));

        addSectionHeading('5. Content & Data Management');

        let authMethod = 'None';
        document.querySelectorAll('input[name="auth"]').forEach(radio => {
            if (radio.checked) authMethod = radio.value;
        });
        addField('User Authentication', authMethod, isUpToYou('auth'));

        addField('Data Storage & Privacy', document.getElementById('data-storage').value, isUpToYou('data-storage'));
        addField('Security Level', document.getElementById('security-level').value, isUpToYou('security-level'));

        const aiFeatures = [];
        document.querySelectorAll('input[name="ai-features"]:checked').forEach(checkbox => {
            aiFeatures.push(checkbox.value);
        });
        addField('AI Integration', aiFeatures.join(', '), isUpToYou('ai-features'));

        addSectionHeading('6. Performance & Compatibility');
        addField('Speed & Responsiveness', document.getElementById('speed').value, isUpToYou('speed'));
        addField('SEO & Accessibility', document.getElementById('seo').value, isUpToYou('seo'));

        const browsers = [];
        document.querySelectorAll('input[name="browser"]:checked').forEach(checkbox => {
            browsers.push(checkbox.value);
        });
        addField('Browser Compatibility', browsers.join(', '), isUpToYou('browser'));

        addSectionHeading('7. Additional Features');
        addField('Features Requested', document.getElementById('features').value, isUpToYou('features'));
        addField('Success Criteria', document.getElementById('success-criteria').value, isUpToYou('success-criteria'));
        addField('Similar Products & Inspiration', document.getElementById('existing-products').value, isUpToYou('existing-products'));
        addField('Budget Constraints', document.getElementById('budget-constraints').value, isUpToYou('budget-constraints'));

        yPos += 15;
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Document Prepared On: ' + formattedDate, leftMargin, yPos);

        const safeName = projectName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '') || 'Project_Brief';
        doc.save(safeName + '_brief.pdf');
    }

    // Set up form persistence
    function setupFormPersistence() {
        const form = document.querySelector('form');
        const projectNameInput = document.getElementById('project-name');
        const projectNameStart = document.getElementById('project-name-start');
        const startPlanningBtn = document.querySelector('.start-planning-btn');

        if (form && projectNameInput) {
            if (projectNameStart) {
                projectNameStart.value = '';
            }

            loadFormData();

            projectNameInput.addEventListener('change', function() {
                if (this.value) {
                    history.pushState(null, '', '?project=' + encodeURIComponent(this.value));
                } else {
                    history.pushState(null, '', window.location.pathname);
                }
            });

            if (startPlanningBtn && projectNameStart) {
                startPlanningBtn.addEventListener('click', function() {
                    const landingPage = document.getElementById('landing-page');
                    const plannerContent = document.querySelector('.planner-content');

                    if (projectNameStart.value) {
                        projectNameInput.value = projectNameStart.value;
                        history.pushState(null, '', '?project=' + encodeURIComponent(projectNameStart.value));
                    }

                    if (landingPage && plannerContent) {
                        landingPage.classList.add('hidden');
                        plannerContent.classList.remove('hidden');
                    }
                });
            }
        }
    }

    function setupRecentProjectsPanel() {
        const toggleBtn = document.querySelector('.toggle-recent-btn');
        const panel = document.querySelector('.recent-projects-panel');

        if (toggleBtn && panel) {
            toggleBtn.addEventListener('click', function() {
                panel.classList.toggle('expanded');
            });
        }

        populateRecentProjects();

        let hasSavedProjects = false;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('appPlan_')) {
                hasSavedProjects = true;
                break;
            }
        }

        if (hasSavedProjects && panel) {
            setTimeout(() => {
                panel.classList.add('expanded');
            }, 500);
        }
    }

    function populateRecentProjects() {
        const projectsList = document.querySelector('.projects-list');
        if (!projectsList) return;

        projectsList.innerHTML = '';

        const projectKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('appPlan_')) {
                projectKeys.push(key);
            }
        }

        if (projectKeys.length === 0) {
            const noProjects = document.createElement('p');
            noProjects.textContent = 'No saved projects found.';
            noProjects.className = 'no-projects-message';
            projectsList.appendChild(noProjects);
            return;
        }

        projectKeys.sort((a, b) => {
            const dataA = JSON.parse(localStorage.getItem(a));
            const dataB = JSON.parse(localStorage.getItem(b));
            return new Date(dataB.lastSaved) - new Date(dataA.lastSaved);
        });

        projectKeys.forEach(key => {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                if (!data || !data.projectName) return;

                const projectItem = document.createElement('div');
                projectItem.className = 'project-item';
                projectItem.dataset.projectKey = key;

                const projectName = document.createElement('h4');
                projectName.textContent = data.projectName;

                const lastSaved = document.createElement('p');
                lastSaved.textContent = 'Last saved: ' + formatDate(data.lastSaved);

                projectItem.appendChild(projectName);
                projectItem.appendChild(lastSaved);

                projectItem.addEventListener('click', function() {
                    loadSavedProject(key);
                });

                projectsList.appendChild(projectItem);
            } catch (error) {
                console.error('Error processing saved project:', error);
            }
        });
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString();
    }

    function loadSavedProject(key) {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            if (!data) return;

            const projectNameInput = document.getElementById('project-name');
            if (projectNameInput && data.projectName) {
                projectNameInput.value = data.projectName;
            }

            const landingPage = document.getElementById('landing-page');
            const plannerContent = document.querySelector('.planner-content');
            const saveBtn = document.querySelector('.save-btn');

            if (landingPage && plannerContent) {
                landingPage.classList.add('hidden');
                plannerContent.classList.remove('hidden');
                if (saveBtn) saveBtn.style.display = 'flex';
            }

            loadFormData();

            if (data.projectName) {
                history.pushState(null, '', '?project=' + encodeURIComponent(data.projectName));
            }

            const panel = document.querySelector('.recent-projects-panel');
            if (panel) {
                panel.classList.remove('expanded');
            }

            showToast('Project loaded', 'success');
        } catch (error) {
            console.error('Error loading saved project:', error);
        }
    }

    function saveFormData() {
        const projectName = document.getElementById('project-name').value || 'Untitled Project';
        const localStorageKey = getLocalStorageKey();

        const formData = {
            projectName: projectName,
            lastSaved: new Date().toISOString(),
            inputs: {}
        };

        const form = document.querySelector('form');
        if (!form) return;

        const textInputs = form.querySelectorAll('input[type="text"], input[type="email"], textarea, select, input[type="color"]');
        textInputs.forEach(input => {
            if (input.name) formData.inputs[input.name] = input.value;
        });

        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (checkbox.name) {
                if (checkbox.name.includes('ai-features') || checkbox.name.includes('platform') || checkbox.name.includes('browser')) {
                    if (!formData.inputs[checkbox.name]) formData.inputs[checkbox.name] = [];
                    if (checkbox.checked) formData.inputs[checkbox.name].push(checkbox.value);
                } else {
                    formData.inputs[checkbox.name] = checkbox.checked;
                }
            }
        });

        const radioButtons = form.querySelectorAll('input[type="radio"]:checked');
        radioButtons.forEach(radio => {
            if (radio.name) formData.inputs[radio.name] = radio.value;
        });

        const upToYouCheckboxes = document.querySelectorAll('.up-to-you-checkbox');
        upToYouCheckboxes.forEach(checkbox => {
            const fieldName = checkbox.getAttribute('data-field');
            if (fieldName) formData.inputs['ai_' + fieldName] = checkbox.checked;
        });

        localStorage.setItem(localStorageKey, JSON.stringify(formData));

        populateRecentProjects();

        showToast('Progress saved', 'success');
    }

    function loadFormData() {
        const localStorageKey = getLocalStorageKey();
        const savedData = localStorage.getItem(localStorageKey);

        if (!savedData) return;

        try {
            const formData = JSON.parse(savedData);
            const form = document.querySelector('form');

            if (!form || !formData.inputs) return;

            const projectNameInput = document.getElementById('project-name');
            if (projectNameInput && formData.projectName) {
                projectNameInput.value = formData.projectName;
            }

            const textInputs = form.querySelectorAll('input[type="text"], input[type="email"], textarea, select, input[type="color"]');
            textInputs.forEach(input => {
                if (input.name && formData.inputs[input.name] !== undefined) {
                    input.value = formData.inputs[input.name];
                }
            });

            const checkboxes = form.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                if (checkbox.name) {
                    if (checkbox.name.includes('ai-features') || checkbox.name.includes('platform') || checkbox.name.includes('browser')) {
                        checkbox.checked = formData.inputs[checkbox.name] &&
                                        Array.isArray(formData.inputs[checkbox.name]) &&
                                        formData.inputs[checkbox.name].includes(checkbox.value);
                    } else if (formData.inputs[checkbox.name] !== undefined) {
                        checkbox.checked = formData.inputs[checkbox.name];
                    }
                }
            });

            const radioButtons = form.querySelectorAll('input[type="radio"]');
            radioButtons.forEach(radio => {
                if (radio.name && formData.inputs[radio.name]) {
                    radio.checked = (radio.value === formData.inputs[radio.name]);
                }
            });

            const upToYouCheckboxes = document.querySelectorAll('.up-to-you-checkbox');
            upToYouCheckboxes.forEach(checkbox => {
                const fieldName = checkbox.getAttribute('data-field');
                if (fieldName && formData.inputs['ai_' + fieldName] !== undefined) {
                    checkbox.checked = formData.inputs['ai_' + fieldName];
                    toggleInputState(checkbox);
                }
            });
        } catch (error) {
            console.error('Error loading form data:', error);
        }
    }

    // Set up collapsible sections
    function setupCollapsibleSections() {
        const collapsibleSections = document.querySelectorAll('.collapsible-section');

        collapsibleSections.forEach(section => {
            const header = section.querySelector('.collapsible-header');

            if (section === collapsibleSections[0]) {
                section.classList.add('active');
            }

            header.addEventListener('click', () => {
                section.classList.toggle('active');
                updateFormHeight();
                saveFormData();
            });
        });
    }

    function updateFormHeight() {
        setTimeout(() => {
            window.scrollTo({
                top: window.scrollY,
                behavior: 'smooth'
            });
        }, 300);
    }

    function toggleInputState(checkbox) {
        const fieldName = checkbox.getAttribute('data-field');
        const isChecked = checkbox.checked;

        if (fieldName === 'colors') {
            const primaryColor = document.getElementById('primary-color');
            const secondaryColor = document.getElementById('secondary-color');
            const colorPickers = document.querySelector('.color-pickers');

            if (isChecked) {
                primaryColor.classList.add('input-disabled');
                secondaryColor.classList.add('input-disabled');
                colorPickers.classList.add('input-disabled');
                primaryColor.setAttribute('disabled', true);
                secondaryColor.setAttribute('disabled', true);
            } else {
                primaryColor.classList.remove('input-disabled');
                secondaryColor.classList.remove('input-disabled');
                colorPickers.classList.remove('input-disabled');
                primaryColor.removeAttribute('disabled');
                secondaryColor.removeAttribute('disabled');
            }
            return;
        }

        const targetInputs = document.querySelectorAll('[name="' + fieldName + '"]');

        if (targetInputs.length > 0) {
            targetInputs.forEach(input => {
                if (isChecked) {
                    input.classList.add('input-disabled');
                    if (input.type !== 'checkbox' && input.type !== 'radio') {
                        input.setAttribute('readonly', true);
                    } else {
                        input.setAttribute('disabled', true);
                    }
                } else {
                    input.classList.remove('input-disabled');
                    if (input.type !== 'checkbox' && input.type !== 'radio') {
                        input.removeAttribute('readonly');
                    } else {
                        input.removeAttribute('disabled');
                    }
                }
            });

            const container = targetInputs[0].closest('.checkbox-group, .radio-group, .color-pickers');
            if (container) {
                if (isChecked) {
                    container.classList.add('input-disabled');
                } else {
                    container.classList.remove('input-disabled');
                }
            }
        }
    }

    function addSaveButton() {
        if (!document.querySelector('.save-btn')) {
            const saveBtn = document.createElement('button');
            saveBtn.type = 'button';
            saveBtn.classList.add('save-btn');
            saveBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg><span>Save</span>';
            document.body.appendChild(saveBtn);

            saveBtn.addEventListener('click', saveFormData);

            const landingPage = document.getElementById('landing-page');
            const startPlanningBtn = document.querySelector('.start-planning-btn');

            if (landingPage && !landingPage.classList.contains('hidden')) {
                saveBtn.style.display = 'none';
            }

            if (startPlanningBtn) {
                startPlanningBtn.addEventListener('click', function() {
                    saveBtn.style.display = 'flex';
                });
            }
        }
    }

    function showSaveConfirmation() {
        showToast('Progress saved!', 'success');
    }

    function getLocalStorageKey() {
        const projectName = document.getElementById('project-name').value || 'default';
        return 'appPlan_' + projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    }
});
