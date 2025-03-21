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
        });
    }
    
    // Check if returning user with saved progress
    const checkSavedProgress = () => {
        // We no longer want to pre-fill the project name on the landing page
        // This function now only checks if we have saved data for UI decisions
        const savedData = localStorage.getItem('app-planner-form-data');
        if (savedData) {
            try {
                // We're not setting the project name input anymore
                // Let the user start with an empty field each time
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
                
                // Don't navigate if we've clicked on an edit button in the review section
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
        
        // Don't navigate if the click came from an edit button in the review section
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
            if (link.getAttribute('href') === `#${sectionId}`) {
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
        // Make progress steps clickable
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
                    navigateToSection(document.getElementById(targetSectionId));
                }
            });
        });
    }
    
    // Update progress indicator based on current section
    function updateProgressIndicator(sectionId) {
        // Map section IDs to step numbers
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
        
        // Update step indicators
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
        
        // Update labels
        progressLabels.forEach((label, index) => {
            label.classList.remove('active');
            if (index + 1 === currentStep) {
                label.classList.add('active');
            }
        });
    }
    
    // Form validation
    function setupFormValidation() {
        // Add event listeners to required fields
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            field.addEventListener('blur', function() {
                validateField(this);
            });
            
            field.addEventListener('input', function() {
                // Clear validation message when user starts typing
                const validationMessage = this.nextElementSibling;
                if (validationMessage && validationMessage.classList.contains('validation-message')) {
                    validationMessage.textContent = '';
                }
            });
        });
    }
    
    // Validate a specific field
    function validateField(field) {
        // If the "AI decision" checkbox is checked for this field, skip validation
        const fieldName = field.getAttribute('id') || field.getAttribute('name');
        const upToYouCheckbox = form.querySelector(`.up-to-you[data-field="${fieldName}"]`);
        
        if (upToYouCheckbox && upToYouCheckbox.checked) {
            return true; // Skip validation if "AI decision" is checked
        }
        
        const validationMessage = form.querySelector(`#${fieldName} + .validation-message`) || 
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
    
    // Validate all fields in a section
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
            // Set initial state
            if (checkbox.checked) {
                toggleInputState(checkbox);
            }
            
            // Add change event listener
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
                    // Get all checkboxes in this section
                    const checkboxes = section.querySelectorAll('.up-to-you');
                    
                    // Check all "AI decision" checkboxes in this section
                    checkboxes.forEach(checkbox => {
                        checkbox.checked = true;
                        // Trigger change event to apply disabled styling
                        checkbox.dispatchEvent(new Event('change'));
                    });
                    
                    // Move to next section
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
            // Validate the current section
            const currentSection = this.closest('.form-section');
            if (validateSection(currentSection)) {
                // Generate review content
                generateReviewContent();
                
                // Navigate to review section
                const reviewSection = document.getElementById('review-section');
                navigateToSection(reviewSection);
            }
        });
    }
    
    // Generate review content
    function generateReviewContent() {
        const reviewContent = document.getElementById('review-content');
        reviewContent.innerHTML = ''; // Clear previous content
        
        // Section titles
        const sectionTitles = {
            'project-overview': '1. Project Overview',
            'platform-tech': '2. Platform & Technical Requirements',
            'design-visuals': '3. Design & Visuals',
            'user-interaction': '4. User Interaction & Experience',
            'content-data': '5. Content & Data Management',
            'performance': '6. Performance & Compatibility',
            'additional-features': '7. Additional Features'
        };
        
        // Loop through each section to create review content
        Object.keys(sectionTitles).forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (!section) return;
            
            // Create section container
            const sectionReview = document.createElement('div');
            sectionReview.className = 'review-section-item';
            sectionReview.setAttribute('data-section-id', sectionId);
            
            // Create section header
            const sectionHeader = document.createElement('div');
            sectionHeader.className = 'review-section-header';
            
            const title = document.createElement('h3');
            title.textContent = sectionTitles[sectionId];
            
            const editButton = document.createElement('button');
            editButton.className = 'edit-section-btn';
            editButton.textContent = 'Edit';
            editButton.setAttribute('data-section', sectionId);
            
            // Modified edit button behavior to toggle edit mode
            editButton.addEventListener('click', function(e) {
                // Prevent any default behavior
                e.preventDefault();
                e.stopPropagation();
                
                // Get the section container
                const sectionContainer = this.closest('.review-section-item');
                
                // Toggle edit mode
                toggleEditMode(sectionContainer);
                
                // Prevent navigation to the original section
                return false;
            });
            
            sectionHeader.appendChild(title);
            sectionHeader.appendChild(editButton);
            sectionReview.appendChild(sectionHeader);
            
            // Create content container
            const sectionContent = document.createElement('div');
            sectionContent.className = 'review-section-content';
            
            // Add all fields from this section
            const fields = getFieldsFromSection(section);
            
            fields.forEach(field => {
                // Create field container
                const fieldElement = document.createElement('div');
                fieldElement.className = 'review-field';
                fieldElement.setAttribute('data-field-id', field.id);
                fieldElement.setAttribute('data-field-type', field.type || 'text');
                
                // Create field label
                const label = document.createElement('span');
                label.className = 'review-field-label';
                label.textContent = field.label + ': ';
                
                // Create field value display
                const valueDisplay = document.createElement('span');
                valueDisplay.className = 'review-field-value';
                
                if (field.isAIDecision) {
                    valueDisplay.classList.add('review-ai-decision');
                    valueDisplay.textContent = 'AI decision';
                } else {
                    valueDisplay.textContent = field.value || 'Not specified';
                }
                
                // Add checkbox for AI decision
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
                
                // Create hidden input field for editing (will be shown in edit mode)
                const inputContainer = document.createElement('div');
                inputContainer.className = 'review-field-edit hidden';
                
                let inputElement;
                
                // Create appropriate input element based on field type
                if (field.type === 'textarea') {
                    inputElement = document.createElement('textarea');
                    inputElement.rows = 3;
                } else if (field.type === 'select') {
                    inputElement = document.createElement('select');
                    
                    // Add appropriate options based on field ID
                    if (field.id === 'app-type') {
                        const options = ['', 'Web Application', 'Mobile App', 'Desktop Application', 'API/Service', 'Other'];
                        options.forEach(option => {
                            const optionEl = document.createElement('option');
                            optionEl.value = option;
                            optionEl.textContent = option || 'Select application type';
                            if (field.value === option) optionEl.selected = true;
                            inputElement.appendChild(optionEl);
                        });
                    } else if (field.id === 'security-level') {
                        const options = ['', 'Basic', 'Medium', 'High', 'Enterprise'];
                        options.forEach(option => {
                            const optionEl = document.createElement('option');
                            optionEl.value = option;
                            optionEl.textContent = option || 'Select security level';
                            if (field.value === option) optionEl.selected = true;
                            inputElement.appendChild(optionEl);
                        });
                    } else if (field.id === 'project-scope') {
                        const options = ['', 'MVP', 'Prototype', 'Full Product', 'Feature Addition'];
                        options.forEach(option => {
                            const optionEl = document.createElement('option');
                            optionEl.value = option;
                            optionEl.textContent = option || 'Select project scope';
                            if (field.value === option) optionEl.selected = true;
                            inputElement.appendChild(optionEl);
                        });
                    } else if (field.id === 'timeline') {
                        const options = ['', 'Under 1 month', '1-3 months', '3-6 months', '6-12 months', 'Over 12 months'];
                        options.forEach(option => {
                            const optionEl = document.createElement('option');
                            optionEl.value = option;
                            optionEl.textContent = option || 'Select expected timeline';
                            if (field.value === option) optionEl.selected = true;
                            inputElement.appendChild(optionEl);
                        });
                    } else if (field.id === 'budget-constraints') {
                        const options = ['', 'Low', 'Medium', 'High', 'Enterprise'];
                        options.forEach(option => {
                            const optionEl = document.createElement('option');
                            optionEl.value = option;
                            optionEl.textContent = option || 'Select budget range';
                            if (field.value === option) optionEl.selected = true;
                            inputElement.appendChild(optionEl);
                        });
                    }
                } else if (field.type === 'checkbox-group' || field.type === 'radio-group' || field.type === 'color-picker') {
                    // For complex field types, don't create edit fields here
                    // Show a message instead
                    inputElement = document.createElement('div');
                    inputElement.className = 'complex-field-message';
                    inputElement.textContent = `For ${field.label.toLowerCase()}, please edit in the original form section.`;
                } else {
                    // Default to text input
                    inputElement = document.createElement('input');
                    inputElement.type = 'text';
                }
                
                if (inputElement.tagName !== 'DIV') {
                    // Set common properties for input elements
                    inputElement.className = 'review-input';
                    inputElement.name = field.id;
                    inputElement.value = field.value || '';
                    inputElement.setAttribute('data-field-id', field.id);
                    
                    // If the field is required in the original form, mark it as required here too
                    if (field.required) {
                        inputElement.required = true;
                    }
                    
                    // Update the original input when this field changes
                    inputElement.addEventListener('input', function() {
                        updateOriginalField(field.id, this.value);
                    });
                    
                    // Update display value when input loses focus
                    inputElement.addEventListener('blur', function() {
                        valueDisplay.textContent = this.value || 'Not specified';
                    });
                }
                
                inputContainer.appendChild(inputElement);
                
                // Handle AI decision checkbox changes
                aiCheckbox.addEventListener('change', function() {
                    const originalCheckbox = document.querySelector(`.up-to-you[data-field="${field.id}"]`);
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
                
                // Assemble the field element
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
    
    // Function to toggle editing mode for a section in the review page
    function toggleEditMode(sectionContainer) {
        // If sectionContainer is not already in edit mode
        if (!sectionContainer.classList.contains('editing')) {
            // Close any currently editing section
            const currentlyEditing = document.querySelector('.review-section-item.editing');
            if (currentlyEditing && currentlyEditing !== sectionContainer) {
                toggleEditMode(currentlyEditing);
            }
        }
        
        // Toggle the editing class
        sectionContainer.classList.toggle('editing');
        
        // Get the button
        const button = sectionContainer.querySelector('.edit-section-btn');
        
        // Toggle button text
        if (sectionContainer.classList.contains('editing')) {
            button.textContent = 'Done';
            
            // Show all edit fields
            const fields = sectionContainer.querySelectorAll('.review-field');
            fields.forEach(field => {
                const fieldId = field.getAttribute('data-field-id');
                const fieldType = field.getAttribute('data-field-type');
                const fieldValue = field.querySelector('.review-field-value');
                const fieldEdit = field.querySelector('.review-field-edit');
                const aiCheckbox = field.parentNode.querySelector(`.review-ai-checkbox [data-field-id="${fieldId}"]`);
                
                // Show the edit field
                if (fieldEdit) {
                    fieldEdit.classList.remove('hidden');
                }
                
                // Show the AI decision checkbox
                const aiCheckboxContainer = field.parentNode.querySelector('.review-ai-checkbox');
                if (aiCheckboxContainer) {
                    aiCheckboxContainer.style.display = 'block';
                }
            });
        } else {
            button.textContent = 'Edit';
            
            // Hide all edit fields and AI decision checkboxes
            const fields = sectionContainer.querySelectorAll('.review-field');
            fields.forEach(field => {
                const fieldEdit = field.querySelector('.review-field-edit');
                
                // Update the original field with the edited value
                const fieldId = field.getAttribute('data-field-id');
                const input = fieldEdit.querySelector('input, textarea, select');
                if (input) {
                    updateOriginalField(fieldId, input.value);
                    
                    // Update the display value
                    const fieldValue = field.querySelector('.review-field-value');
                    if (fieldValue) {
                        const isAIDecision = field.parentNode.querySelector(`.review-ai-checkbox input[data-field-id="${fieldId}"]`)?.checked;
                        
                        if (isAIDecision) {
                            fieldValue.textContent = 'AI decision';
                            fieldValue.classList.add('review-ai-decision');
                        } else {
                            fieldValue.textContent = input.value || 'Not specified';
                            fieldValue.classList.remove('review-ai-decision');
                        }
                    }
                }
                
                // Hide the edit field
                if (fieldEdit) {
                    fieldEdit.classList.add('hidden');
                }
                
                // Hide the AI decision checkbox
                const aiCheckboxContainer = field.parentNode.querySelector('.review-ai-checkbox');
                if (aiCheckboxContainer) {
                    aiCheckboxContainer.style.display = 'none';
                }
            });
        }
    }
    
    // Helper function to create a field object
    function createFieldObject(id, label, type = 'text') {
        const field = document.getElementById(id);
        if (!field) return null;
        
        return {
            id: id,
            label: label,
            value: field.value.trim(),
            isAIDecision: document.querySelector(`.up-to-you[data-field="${id}"]`)?.checked || false,
            type: type,
            required: field.hasAttribute('required')
        };
    }
    
    // Function to update the original form field with edited value
    function updateOriginalField(fieldId, value) {
        // Find the original field
        const field = document.getElementById(fieldId);
        if (field) {
            field.value = value;
        }
    }
    
    // Get all fields from a section for review
    function getFieldsFromSection(section) {
        const fields = [];
        const sectionId = section.getAttribute('id');
        
        // Project Overview section
        if (sectionId === 'project-overview') {
            fields.push(createFieldObject('project-name', 'Project Name'));
            fields.push(createFieldObject('project-goal', 'Goal'));
            fields.push(createFieldObject('project-description', 'Description', 'textarea'));
            fields.push(createFieldObject('target-audience', 'Target Audience', 'textarea'));
            fields.push(createFieldObject('project-scope', 'Project Scope', 'select'));
        }
        
        // Platform & Technical Requirements section
        else if (sectionId === 'platform-tech') {
            fields.push(createFieldObject('app-type', 'Application Type', 'select'));
            
            // Platform checkboxes
            const platformCheckboxes = section.querySelectorAll('input[name="platform"]:checked');
            const platformValues = Array.from(platformCheckboxes).map(cb => cb.value);
            const platformField = {
                id: 'platform',
                label: 'Target Platforms',
                value: platformValues.join(', '),
                isAIDecision: document.querySelector('.up-to-you[data-field="platform"]').checked,
                type: 'checkboxGroup'
            };
            fields.push(platformField);
            
            fields.push(createFieldObject('frontend', 'Frontend'));
            fields.push(createFieldObject('backend', 'Backend'));
            fields.push(createFieldObject('database', 'Database'));
            fields.push(createFieldObject('hosting', 'Hosting'));
            fields.push(createFieldObject('apis', 'APIs'));
            fields.push(createFieldObject('timeline', 'Project Timeline', 'select'));
            fields.push(createFieldObject('technical-constraints', 'Technical Constraints', 'textarea'));
        }
        
        // Design & Visuals section
        else if (sectionId === 'design-visuals') {
            fields.push(createFieldObject('art-style', 'Art Style'));
            
            // Color pickers
            const primaryColor = document.getElementById('primary-color').value;
            const secondaryColor = document.getElementById('secondary-color').value;
            const colorField = {
                id: 'colors',
                label: 'Colors',
                value: `Primary: ${primaryColor}, Secondary: ${secondaryColor}`,
                isAIDecision: document.querySelector('.up-to-you[data-field="colors"]').checked,
                type: 'colorPickers'
            };
            fields.push(colorField);
            
            fields.push(createFieldObject('typography', 'Typography'));
            fields.push(createFieldObject('visual-references', 'Visual References', 'textarea'));
        }
        
        // User Interaction & Experience section
        else if (sectionId === 'user-interaction') {
            fields.push(createFieldObject('inputs', 'Inputs', 'textarea'));
            fields.push(createFieldObject('outputs', 'Outputs', 'textarea'));
        }
        
        // Content & Data Management section
        else if (sectionId === 'content-data') {
            // Authentication radio buttons
            let authValue = '';
            const authRadios = section.querySelectorAll('input[name="auth"]:checked');
            if (authRadios.length > 0) {
                authValue = authRadios[0].value;
            }
            const authField = {
                id: 'auth',
                label: 'User Authentication',
                value: authValue,
                isAIDecision: document.querySelector('.up-to-you[data-field="auth"]').checked,
                type: 'radio'
            };
            fields.push(authField);
            
            fields.push(createFieldObject('data-storage', 'Data Storage & Privacy', 'textarea'));
            fields.push(createFieldObject('security-level', 'Security Level', 'select'));
            
            // AI Integration checkboxes
            const aiFeatureCheckboxes = section.querySelectorAll('input[name="ai-features"]:checked');
            const aiFeatureValues = Array.from(aiFeatureCheckboxes).map(cb => cb.value);
            const aiFeatureField = {
                id: 'ai-features',
                label: 'AI Integration',
                value: aiFeatureValues.join(', '),
                isAIDecision: document.querySelector('.up-to-you[data-field="ai-features"]').checked,
                type: 'checkboxGroup'
            };
            fields.push(aiFeatureField);
        }
        
        // Performance & Compatibility section
        else if (sectionId === 'performance') {
            fields.push(createFieldObject('speed', 'Speed & Responsiveness', 'textarea'));
            fields.push(createFieldObject('seo', 'SEO & Accessibility', 'textarea'));
            
            // Browser checkboxes
            const browserCheckboxes = section.querySelectorAll('input[name="browser"]:checked');
            const browserValues = Array.from(browserCheckboxes).map(cb => cb.value);
            const browserField = {
                id: 'browser',
                label: 'Browser Compatibility',
                value: browserValues.join(', '),
                isAIDecision: document.querySelector('.up-to-you[data-field="browser"]').checked,
                type: 'checkboxGroup'
            };
            fields.push(browserField);
        }
        
        // Additional Features section
        else if (sectionId === 'additional-features') {
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
        
        // Add format selection before the generate button
        if (generateBtn && !document.querySelector('.format-selector')) {
            const formatSelector = document.createElement('div');
            formatSelector.className = 'format-selector';
            formatSelector.innerHTML = `
                <label>Export Format:</label>
                <select id="export-format">
                    <option value="pdf">PDF</option>
                    <option value="txt">TXT</option>
                </select>
            `;
            
            generateBtn.parentNode.insertBefore(formatSelector, generateBtn);
            
            // Update the button text while keeping its original styling
            generateBtn.textContent = 'Generate Brief';
        }
        
        generateBtn.addEventListener('click', function() {
            // Validate all required fields before generating brief
            const allRequiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            allRequiredFields.forEach(field => {
                // Skip validation for fields with "AI decision" checked
                const fieldName = field.getAttribute('id') || field.getAttribute('name');
                const upToYouCheckbox = form.querySelector(`.up-to-you[data-field="${fieldName}"]`);
                
                if (upToYouCheckbox && upToYouCheckbox.checked) {
                    return; // Skip this field
                }
                
                if (!validateField(field)) {
                    isValid = false;
                    // Navigate to the section with invalid fields
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
            } else {
                alert('Please fill in all required fields before generating the brief.');
            }
        });
    }
    
    // Generate TXT file with form data
    function generateTXT() {
        // Get project name for the filename
        const projectNameField = document.getElementById('project-name');
        const projectName = projectNameField.value.trim() || 'Project Brief';
        const isProjectNameUpToYou = document.querySelector('.up-to-you[data-field="project-name"]').checked;
        const titleText = isProjectNameUpToYou ? "Project Brief (Name: AI decision)" : projectName + " Brief";
        
        // Create text content
        let content = titleText + "\n";
        content += "=".repeat(titleText.length) + "\n\n";
        
        // Add current date
        const date = new Date();
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        content += `Generated: ${formattedDate}\n\n`;
        
        // Function to add a section heading
        function addSectionHeading(text) {
            content += "\n" + text + "\n";
            content += "-".repeat(text.length) + "\n\n";
        }
        
        // Function to add field with value
        function addField(label, value, isUpToYou = false) {
            if (isUpToYou) {
                value = "AI decision";
            } else if (!value || value.trim() === '') {
                value = 'Not specified';
            }
            
            content += `${label}: ${value}\n`;
        }
        
        // Helper function to check if "AI decision" is checked for a field
        function isUpToYou(fieldName) {
            const checkbox = document.querySelector(`.up-to-you[data-field="${fieldName}"]`);
            return checkbox && checkbox.checked;
        }
        
        // 1. Project Overview
        addSectionHeading('1. Project Overview');
        addField('Name', projectNameField.value, isUpToYou('project-name'));
        addField('Goal', document.getElementById('project-goal').value, isUpToYou('project-goal'));
        addField('Description', document.getElementById('project-description').value, isUpToYou('project-description'));
        addField('Target Audience', document.getElementById('target-audience').value, isUpToYou('target-audience'));
        addField('Project Scope', document.getElementById('project-scope').value, isUpToYou('project-scope'));
        
        // 2. Platform & Technical Requirements
        addSectionHeading('2. Platform & Technical Requirements');
        addField('Application Type', document.getElementById('app-type').value, isUpToYou('app-type'));
        
        // Get selected platforms
        const platforms = [];
        document.querySelectorAll('input[name="platform"]:checked').forEach(checkbox => {
            platforms.push(checkbox.value);
        });
        addField('Target Platforms', platforms.join(', '), isUpToYou('platform'));
        
        // Add preferred technologies
        addField('Frontend', document.getElementById('frontend').value, isUpToYou('frontend'));
        addField('Backend', document.getElementById('backend').value, isUpToYou('backend'));
        addField('Database', document.getElementById('database').value, isUpToYou('database'));
        addField('Hosting', document.getElementById('hosting').value, isUpToYou('hosting'));
        addField('APIs', document.getElementById('apis').value, isUpToYou('apis'));
        addField('Project Timeline', document.getElementById('timeline').value, isUpToYou('timeline'));
        addField('Technical Constraints', document.getElementById('technical-constraints').value, isUpToYou('technical-constraints'));
        
        // 3. Design & Visuals
        addSectionHeading('3. Design & Visuals');
        addField('Art Style', document.getElementById('art-style').value, isUpToYou('art-style'));
        
        // Convert color values to readable format
        const primaryColor = document.getElementById('primary-color').value;
        const secondaryColor = document.getElementById('secondary-color').value;
        addField('Colors', `Primary: ${primaryColor}, Secondary: ${secondaryColor}`, isUpToYou('colors'));
        
        addField('Typography', document.getElementById('typography').value, isUpToYou('typography'));
        addField('Visual References', document.getElementById('visual-references').value, isUpToYou('visual-references'));
        
        // 4. User Interaction & Experience
        addSectionHeading('4. User Interaction & Experience');
        addField('Inputs', document.getElementById('inputs').value, isUpToYou('inputs'));
        addField('Outputs', document.getElementById('outputs').value, isUpToYou('outputs'));
        
        // 5. Content & Data Management
        addSectionHeading('5. Content & Data Management');
        
        // Get selected authentication method
        let authMethod = 'None';
        document.querySelectorAll('input[name="auth"]').forEach(radio => {
            if (radio.checked) {
                authMethod = radio.value;
            }
        });
        addField('User Authentication', authMethod, isUpToYou('auth'));
        
        addField('Data Storage & Privacy', document.getElementById('data-storage').value, isUpToYou('data-storage'));
        addField('Security Level', document.getElementById('security-level').value, isUpToYou('security-level'));
        
        // Get selected AI features
        const aiFeatures = [];
        document.querySelectorAll('input[name="ai-features"]:checked').forEach(checkbox => {
            aiFeatures.push(checkbox.value);
        });
        addField('AI Integration', aiFeatures.join(', '), isUpToYou('ai-features'));
        
        // 6. Performance & Compatibility
        addSectionHeading('6. Performance & Compatibility');
        addField('Speed & Responsiveness', document.getElementById('speed').value, isUpToYou('speed'));
        addField('SEO & Accessibility', document.getElementById('seo').value, isUpToYou('seo'));
        
        // Get selected browsers
        const browsers = [];
        document.querySelectorAll('input[name="browser"]:checked').forEach(checkbox => {
            browsers.push(checkbox.value);
        });
        addField('Browser Compatibility', browsers.join(', '), isUpToYou('browser'));
        
        // 7. Additional Features
        addSectionHeading('7. Additional Features');
        addField('Features Requested', document.getElementById('features').value, isUpToYou('features'));
        addField('Success Criteria', document.getElementById('success-criteria').value, isUpToYou('success-criteria'));
        addField('Similar Products & Inspiration', document.getElementById('existing-products').value, isUpToYou('existing-products'));
        addField('Budget Constraints', document.getElementById('budget-constraints').value, isUpToYou('budget-constraints'));
        
        // Create a Blob with the text content
        const blob = new Blob([content], { type: 'text/plain' });
        
        // Create a link element to download the file
        const link = document.createElement('a');
        const safeName = projectName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '') || 'Project_Brief';
        link.download = `${safeName}_brief.txt`;
        link.href = window.URL.createObjectURL(blob);
        link.click();
        
        // Clean up
        window.URL.revokeObjectURL(link.href);
    }
    
    // Generate PDF with form data
    function generatePDF() {
        // Import jsPDF
        const { jsPDF } = window.jspdf;
        
        // Create new PDF document
        const doc = new jsPDF();
        
        // Get project name for the title
        const projectNameField = document.getElementById('project-name');
        const projectName = projectNameField.value.trim() || 'Project Brief';
        const isProjectNameUpToYou = document.querySelector('.up-to-you[data-field="project-name"]').checked;
        const titleText = isProjectNameUpToYou ? "Project Brief (Name: AI decision)" : projectName + " Brief";
        
        // Set font size and styles for title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        
        // Add title
        doc.text(titleText, 105, 20, { align: 'center' });
        
        // Start position for content
        let yPos = 35; // Increased starting position to provide more space
        const lineHeight = 8; // Increased line height to avoid overlap
        const leftMargin = 20;
        const pageWidth = 190;
        const labelWidth = 65; // Increased width for labels to accommodate longer field names
        
        // Reset font for content
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        
        // Add current date
        const date = new Date();
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Function to add a section heading
        function addSectionHeading(text) {
            // Add a bit of space before each section heading (except the first)
            if (yPos > 35) {
                yPos += 10; // Increased spacing between sections
            }
            
            // Check if we need a new page
            if (yPos > 260) { // Reduced page height limit to ensure enough space
                doc.addPage();
                yPos = 20;
            }
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.text(text, leftMargin, yPos);
            doc.line(leftMargin, yPos + 1, pageWidth, yPos + 1);
            yPos += lineHeight + 2; // Added extra spacing after heading
            
            // Reset to normal font
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
        }
        
        // Function to add field with value
        function addField(label, value, isUpToYou = false) {
            // Check if we need a new page - account for potential multi-line text
            const estimatedHeight = (typeof value === 'string' && value.length > 60) ? 
                Math.ceil(value.length / 60) * (lineHeight - 2) + 10 : lineHeight;
                
            if (yPos + estimatedHeight > 270) {
                doc.addPage();
                yPos = 20;
            }
            
            if (isUpToYou) {
                value = "AI decision";
            } else if (!value || value.trim() === '') {
                value = 'Not specified';
            }
            
            // For text fields with potential long content, handle wrapping
            if (typeof value === 'string' && value.length > 60) {
                doc.setFont('helvetica', 'bold');
                doc.text(`${label}:`, leftMargin, yPos);
                yPos += lineHeight;
                
                doc.setFont('helvetica', 'normal');
                const splitText = doc.splitTextToSize(value, pageWidth - leftMargin * 2);
                doc.text(splitText, leftMargin + 5, yPos); // Indented text with 5 units
                yPos += (splitText.length * (lineHeight - 2)) + 4; // Added extra spacing after multi-line text
            } else {
                doc.setFont('helvetica', 'bold');
                doc.text(`${label}:`, leftMargin, yPos);
                
                doc.setFont('helvetica', 'normal');
                doc.text(value, leftMargin + labelWidth, yPos);
                yPos += lineHeight;
            }
        }
        
        // Helper function to check if "AI decision" is checked for a field
        function isUpToYou(fieldName) {
            const checkbox = document.querySelector(`.up-to-you[data-field="${fieldName}"]`);
            return checkbox && checkbox.checked;
        }
        
        // 1. Project Overview
        addSectionHeading('1. Project Overview');
        addField('Name', projectNameField.value, isUpToYou('project-name'));
        addField('Goal', document.getElementById('project-goal').value, isUpToYou('project-goal'));
        addField('Description', document.getElementById('project-description').value, isUpToYou('project-description'));
        addField('Target Audience', document.getElementById('target-audience').value, isUpToYou('target-audience'));
        addField('Project Scope', document.getElementById('project-scope').value, isUpToYou('project-scope'));
        
        // 2. Platform & Technical Requirements
        addSectionHeading('2. Platform & Technical Requirements');
        addField('Application Type', document.getElementById('app-type').value, isUpToYou('app-type'));
        
        // Get selected platforms
        const platforms = [];
        document.querySelectorAll('input[name="platform"]:checked').forEach(checkbox => {
            platforms.push(checkbox.value);
        });
        addField('Target Platforms', platforms.join(', '), isUpToYou('platform'));
        
        // Add preferred technologies
        addField('Frontend', document.getElementById('frontend').value, isUpToYou('frontend'));
        addField('Backend', document.getElementById('backend').value, isUpToYou('backend'));
        addField('Database', document.getElementById('database').value, isUpToYou('database'));
        addField('Hosting', document.getElementById('hosting').value, isUpToYou('hosting'));
        addField('APIs', document.getElementById('apis').value, isUpToYou('apis'));
        addField('Project Timeline', document.getElementById('timeline').value, isUpToYou('timeline'));
        addField('Technical Constraints', document.getElementById('technical-constraints').value, isUpToYou('technical-constraints'));
        
        // 3. Design & Visuals
        addSectionHeading('3. Design & Visuals');
        addField('Art Style', document.getElementById('art-style').value, isUpToYou('art-style'));
        
        // Convert color values to readable format
        const primaryColor = document.getElementById('primary-color').value;
        const secondaryColor = document.getElementById('secondary-color').value;
        addField('Colors', `Primary: ${primaryColor}, Secondary: ${secondaryColor}`, isUpToYou('colors'));
        
        addField('Typography', document.getElementById('typography').value, isUpToYou('typography'));
        addField('Visual References', document.getElementById('visual-references').value, isUpToYou('visual-references'));
        
        // 4. User Interaction & Experience
        addSectionHeading('4. User Interaction & Experience');
        addField('Inputs', document.getElementById('inputs').value, isUpToYou('inputs'));
        addField('Outputs', document.getElementById('outputs').value, isUpToYou('outputs'));
        
        // 5. Content & Data Management
        addSectionHeading('5. Content & Data Management');
        
        // Get selected authentication method
        let authMethod = 'None';
        document.querySelectorAll('input[name="auth"]').forEach(radio => {
            if (radio.checked) {
                authMethod = radio.value;
            }
        });
        addField('User Authentication', authMethod, isUpToYou('auth'));
        
        addField('Data Storage & Privacy', document.getElementById('data-storage').value, isUpToYou('data-storage'));
        addField('Security Level', document.getElementById('security-level').value, isUpToYou('security-level'));
        
        // Get selected AI features
        const aiFeatures = [];
        document.querySelectorAll('input[name="ai-features"]:checked').forEach(checkbox => {
            aiFeatures.push(checkbox.value);
        });
        addField('AI Integration', aiFeatures.join(', '), isUpToYou('ai-features'));
        
        // 6. Performance & Compatibility
        addSectionHeading('6. Performance & Compatibility');
        addField('Speed & Responsiveness', document.getElementById('speed').value, isUpToYou('speed'));
        addField('SEO & Accessibility', document.getElementById('seo').value, isUpToYou('seo'));
        
        // Get selected browsers
        const browsers = [];
        document.querySelectorAll('input[name="browser"]:checked').forEach(checkbox => {
            browsers.push(checkbox.value);
        });
        addField('Browser Compatibility', browsers.join(', '), isUpToYou('browser'));
        
        // 7. Additional Features
        addSectionHeading('7. Additional Features');
        addField('Features Requested', document.getElementById('features').value, isUpToYou('features'));
        addField('Success Criteria', document.getElementById('success-criteria').value, isUpToYou('success-criteria'));
        addField('Similar Products & Inspiration', document.getElementById('existing-products').value, isUpToYou('existing-products'));
        addField('Budget Constraints', document.getElementById('budget-constraints').value, isUpToYou('budget-constraints'));
        
        // Add timestamp at the bottom
        yPos += 15;
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Document Prepared On: ${formattedDate}`, leftMargin, yPos);
        
        // Save the PDF
        const safeName = projectName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '') || 'Project_Brief';
        doc.save(`${safeName}_brief.pdf`);
    }
    
    // Set up form persistence
    function setupFormPersistence() {
        const form = document.querySelector('form');
        const projectNameInput = document.getElementById('project-name');
        const projectNameStart = document.getElementById('project-name-start');
        const startPlanningBtn = document.querySelector('.start-planning-btn');
        
        if (form && projectNameInput) {
            // Make sure the landing page project name is empty on first load
            if (projectNameStart) {
                projectNameStart.value = '';
            }
            
            // Load saved data for the form, but not for landing page
            loadFormData();
            
            // Set up saved project name in URL for bookmarking
            projectNameInput.addEventListener('change', function() {
                if (this.value) {
                    history.pushState(null, '', `?project=${encodeURIComponent(this.value)}`);
                } else {
                    history.pushState(null, '', window.location.pathname);
                }
            });
            
            // Handle start button click to copy project name from landing to form
            if (startPlanningBtn && projectNameStart) {
                startPlanningBtn.addEventListener('click', function() {
                    const landingPage = document.getElementById('landing-page');
                    const plannerContent = document.querySelector('.planner-content');
                    
                    // Copy project name from landing to form
                    if (projectNameStart.value) {
                        projectNameInput.value = projectNameStart.value;
                        history.pushState(null, '', `?project=${encodeURIComponent(projectNameStart.value)}`);
                    }
                    
                    // Show planner content
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
        const projectsList = document.querySelector('.projects-list');
        
        // Toggle panel visibility
        if (toggleBtn && panel) {
            toggleBtn.addEventListener('click', function() {
                panel.classList.toggle('expanded');
            });
        }
        
        // Populate recent projects from localStorage
        populateRecentProjects();
        
        // Check if we have any saved projects and expand the panel initially
        let hasSavedProjects = false;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('appPlan_')) {
                hasSavedProjects = true;
                break;
            }
        }
        
        // Automatically expand the panel if there are saved projects
        if (hasSavedProjects && panel) {
            // Add a small delay to ensure smooth animation
            setTimeout(() => {
                panel.classList.add('expanded');
            }, 500);
        }
    }
    
    function populateRecentProjects() {
        const projectsList = document.querySelector('.projects-list');
        if (!projectsList) return;
        
        // Clear existing list
        projectsList.innerHTML = '';
        
        // Get all keys from localStorage that start with 'appPlan_'
        const projectKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('appPlan_')) {
                projectKeys.push(key);
            }
        }
        
        // If no projects, show a message
        if (projectKeys.length === 0) {
            const noProjects = document.createElement('p');
            noProjects.textContent = 'No saved projects found.';
            noProjects.className = 'no-projects-message';
            projectsList.appendChild(noProjects);
            return;
        }
        
        // Sort by last modified date (newest first)
        projectKeys.sort((a, b) => {
            const dataA = JSON.parse(localStorage.getItem(a));
            const dataB = JSON.parse(localStorage.getItem(b));
            return new Date(dataB.lastSaved) - new Date(dataA.lastSaved);
        });
        
        // Create project items
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
                lastSaved.textContent = `Last saved: ${formatDate(data.lastSaved)}`;
                
                projectItem.appendChild(projectName);
                projectItem.appendChild(lastSaved);
                
                // Add click event to load the project
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
            
            // Set project name
            const projectNameInput = document.getElementById('project-name');
            if (projectNameInput && data.projectName) {
                projectNameInput.value = data.projectName;
            }
            
            // Move to planner content
            const landingPage = document.getElementById('landing-page');
            const plannerContent = document.querySelector('.planner-content');
            const saveBtn = document.querySelector('.save-btn');
            
            if (landingPage && plannerContent) {
                landingPage.classList.add('hidden');
                plannerContent.classList.remove('hidden');
                if (saveBtn) saveBtn.style.display = 'flex';
            }
            
            // Load all form data
            loadFormData();
            
            // Update URL with project name
            if (data.projectName) {
                history.pushState(null, '', `?project=${encodeURIComponent(data.projectName)}`);
            }
            
            // Close panel after loading
            const panel = document.querySelector('.recent-projects-panel');
            if (panel) {
                panel.classList.remove('expanded');
            }
        } catch (error) {
            console.error('Error loading saved project:', error);
        }
    }
    
    // Update saveFormData to include last saved timestamp
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
        
        // Save all text/textarea/select/color inputs
        const textInputs = form.querySelectorAll('input[type="text"], input[type="email"], textarea, select, input[type="color"]');
        textInputs.forEach(input => {
            if (input.name) formData.inputs[input.name] = input.value;
        });
        
        // Save all checkboxes
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (checkbox.name) {
                if (checkbox.name.includes('ai-features') || checkbox.name.includes('platform') || checkbox.name.includes('browser')) {
                    // For checkbox groups with same name, create array of values
                    if (!formData.inputs[checkbox.name]) formData.inputs[checkbox.name] = [];
                    if (checkbox.checked) formData.inputs[checkbox.name].push(checkbox.value);
                } else {
                    formData.inputs[checkbox.name] = checkbox.checked;
                }
            }
        });
        
        // Save all radio buttons
        const radioButtons = form.querySelectorAll('input[type="radio"]:checked');
        radioButtons.forEach(radio => {
            if (radio.name) formData.inputs[radio.name] = radio.value;
        });
        
        // Save AI decision checkbox states
        const upToYouCheckboxes = document.querySelectorAll('.up-to-you-checkbox');
        upToYouCheckboxes.forEach(checkbox => {
            const fieldName = checkbox.getAttribute('data-field');
            if (fieldName) formData.inputs[`ai_${fieldName}`] = checkbox.checked;
        });
        
        localStorage.setItem(localStorageKey, JSON.stringify(formData));
        
        // Refresh the recent projects list
        populateRecentProjects();
        
        showSaveConfirmation();
    }
    
    // Update loadFormData to work with new structure
    function loadFormData() {
        const localStorageKey = getLocalStorageKey();
        const savedData = localStorage.getItem(localStorageKey);
        
        if (!savedData) return;
        
        try {
            const formData = JSON.parse(savedData);
            const form = document.querySelector('form');
            
            if (!form || !formData.inputs) return;
            
            // Restore project name
            const projectNameInput = document.getElementById('project-name');
            if (projectNameInput && formData.projectName) {
                projectNameInput.value = formData.projectName;
            }
            
            // Restore text inputs, textareas, selects, and colors
            const textInputs = form.querySelectorAll('input[type="text"], input[type="email"], textarea, select, input[type="color"]');
            textInputs.forEach(input => {
                if (input.name && formData.inputs[input.name] !== undefined) {
                    input.value = formData.inputs[input.name];
                }
            });
            
            // Restore checkboxes
            const checkboxes = form.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                if (checkbox.name) {
                    if (checkbox.name.includes('ai-features') || checkbox.name.includes('platform') || checkbox.name.includes('browser')) {
                        // For checkbox groups, check if value is in array
                        checkbox.checked = formData.inputs[checkbox.name] && 
                                        Array.isArray(formData.inputs[checkbox.name]) && 
                                        formData.inputs[checkbox.name].includes(checkbox.value);
                    } else if (formData.inputs[checkbox.name] !== undefined) {
                        checkbox.checked = formData.inputs[checkbox.name];
                    }
                }
            });
            
            // Restore radio buttons
            const radioButtons = form.querySelectorAll('input[type="radio"]');
            radioButtons.forEach(radio => {
                if (radio.name && formData.inputs[radio.name]) {
                    radio.checked = (radio.value === formData.inputs[radio.name]);
                }
            });
            
            // Restore AI decision checkboxes
            const upToYouCheckboxes = document.querySelectorAll('.up-to-you-checkbox');
            upToYouCheckboxes.forEach(checkbox => {
                const fieldName = checkbox.getAttribute('data-field');
                if (fieldName && formData.inputs[`ai_${fieldName}`] !== undefined) {
                    checkbox.checked = formData.inputs[`ai_${fieldName}`];
                    
                    // Also toggle the related input states
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
            const content = section.querySelector('.collapsible-content');
            
            // Set initial state - first section open by default
            if (section === collapsibleSections[0]) {
                section.classList.add('active');
            }
            
            header.addEventListener('click', () => {
                // Toggle active state
                section.classList.toggle('active');
                
                // Update form height for smoother transitions
                updateFormHeight();
                
                // Save collapsible state to localStorage
                saveFormData();
            });
        });
    }
    
    // Helper function to update form height for smooth transitions
    function updateFormHeight() {
        // Allow time for transitions to complete
        setTimeout(() => {
            window.scrollTo({
                top: window.scrollY,
                behavior: 'smooth'
            });
        }, 300);
    }
    
    // Helper function to toggle input state based on AI decision checkbox
    function toggleInputState(checkbox) {
        const fieldName = checkbox.getAttribute('data-field');
        const isChecked = checkbox.checked;
        
        // Find target input(s) by name
        const targetInputs = document.querySelectorAll(`[name="${fieldName}"]`);
        
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
            
            // Also handle parent containers for grouped inputs
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

    // Add a "Save Progress" button to the page
    function addSaveButton() {
        if (!document.querySelector('.save-btn')) {
            const saveBtn = document.createElement('button');
            saveBtn.type = 'button';
            saveBtn.classList.add('save-btn');
            saveBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg><span>Save Progress</span>';
            document.body.appendChild(saveBtn);
            
            saveBtn.addEventListener('click', saveFormData);
            
            // Initially hide the save button on the landing page
            const landingPage = document.getElementById('landing-page');
            const startPlanningBtn = document.querySelector('.start-planning-btn');
            
            if (landingPage && !landingPage.classList.contains('hidden')) {
                saveBtn.style.display = 'none';
            }
            
            // Show save button when transitioning to planner content
            if (startPlanningBtn) {
                startPlanningBtn.addEventListener('click', function() {
                    saveBtn.style.display = 'flex';
                });
            }
        }
    }

    // Show a confirmation message when progress is saved
    function showSaveConfirmation() {
        const existingConfirmation = document.querySelector('.save-confirmation');
        
        if (existingConfirmation) {
            // Reset animation by removing and re-adding the class
            existingConfirmation.classList.remove('show');
            setTimeout(() => {
                existingConfirmation.classList.add('show');
            }, 10);
            
            // Remove after animation
            clearTimeout(window.saveConfirmationTimeout);
            window.saveConfirmationTimeout = setTimeout(() => {
                existingConfirmation.classList.remove('show');
            }, 3000);
        } else {
            // Create new confirmation
            const confirmation = document.createElement('div');
            confirmation.classList.add('save-confirmation');
            confirmation.textContent = 'Progress saved!';
            document.body.appendChild(confirmation);
            
            // Animate in
            setTimeout(() => {
                confirmation.classList.add('show');
            }, 10);
            
            // Remove after animation
            window.saveConfirmationTimeout = setTimeout(() => {
                confirmation.classList.remove('show');
            }, 3000);
        }
    }

    // Get localStorage key based on project name
    function getLocalStorageKey() {
        const projectName = document.getElementById('project-name').value || 'default';
        return `appPlan_${projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
    }
}); 