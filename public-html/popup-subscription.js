// Popup Subscription Module
const PopupSubscription = {
    // CSS for the popup
    cssContent: `
      .subscription-popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s, visibility 0.3s;
      }
      
      .subscription-popup-overlay.active {
        opacity: 1;
        visibility: visible;
      }
      
      .subscription-popup {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        padding: 25px;
        max-width: 400px;
        width: 90%;
        position: relative;
        transform: translateY(20px);
        opacity: 0;
        transition: transform 0.3s, opacity 0.3s;
      }
      
      .subscription-popup-overlay.active .subscription-popup {
        transform: translateY(0);
        opacity: 1;
      }
      
      .subscription-popup-close {
        position: absolute;
        top: 10px;
        right: 10px;
        font-size: 22px;
        color: #999;
        background: none;
        border: none;
        padding: 0;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .subscription-popup-close:hover {
        background-color: #f1f1f1;
        color: #333;
      }
      
      .subscription-popup h2 {
        margin-top: 0;
        color: #333;
        font-size: 22px;
      }
      
      .subscription-popup p {
        color: #666;
        margin-bottom: 20px;
      }
      
      .subscription-form {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      
      .subscription-form label {
        font-weight: bold;
        color: #555;
        margin-bottom: 5px;
        display: block;
      }
      
      .subscription-form input {
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
        width: 100%;
        box-sizing: border-box;
      }
      
      .subscription-form input:focus {
        border-color: #4CAF50;
        outline: none;
        box-shadow: 0 0 3px rgba(76, 175, 80, 0.3);
      }
      
      .subscription-form button {
        background-color: #4CAF50;
        color: white;
        border: none;
        padding: 12px;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .subscription-form button:hover {
        background-color: #45a049;
      }
      
      .subscription-status {
        margin-top: 15px;
        padding: 10px;
        border-radius: 4px;
        display: none;
      }
      
      .subscription-status.success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
        display: block;
      }
      
      .subscription-status.error {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
        display: block;
      }
      
      @media (max-width: 480px) {
        .subscription-popup {
          width: 85%;
          padding: 20px;
        }
      }
    `,
  
    // HTML template for the popup
    template: `
      <div class="subscription-popup-overlay" id="subscription-popup-overlay">
        <div class="subscription-popup">
          <button class="subscription-popup-close" id="subscription-popup-close">&times;</button>
          <h2>Stay Updated</h2>
          <p>Subscribe to our newsletter for the latest updates and offers.</p>
          <form class="subscription-form" id="subscription-popup-form">
            <div>
              <label for="subscription-name">Name (optional)</label>
              <input type="text" id="subscription-name" placeholder="Your name">
            </div>
            <div>
              <label for="subscription-email">Email Address</label>
              <input type="email" id="subscription-email" placeholder="your@email.com" required>
            </div>
            <button type="submit">Subscribe</button>
          </form>
          <div class="subscription-status" id="subscription-status"></div>
        </div>
      </div>
    `,
  
    // Configuration options with defaults
    defaultConfig: {
      apiEndpoint: 'https://api.ultravidz.com/subscribe',
      delay: 3000,  // Show popup after 3 seconds
      showOnce: true,  // Show only once per session
      cookieExpiry: 7,  // Days before showing again
      triggers: {
        onExit: true,  // Show when user tries to exit
        afterScroll: 50,  // Show after scrolling 50% of page
        afterTime: true  // Show after delay time
      },
      text: {
        heading: 'Stay Updated',
        description: 'Subscribe to our newsletter for the latest updates and offers.',
        buttonText: 'Subscribe',
        successMessage: 'Thank you for subscribing!',
        errorMessage: 'There was an error. Please try again.'
      }
    },
  
    // Initialize the module
    init: function(userConfig = {}) {
      // Merge user configuration with defaults
      this.config = { ...this.defaultConfig, ...userConfig };
      if (userConfig.triggers) {
        this.config.triggers = { ...this.defaultConfig.triggers, ...userConfig.triggers };
      }
      if (userConfig.text) {
        this.config.text = { ...this.defaultConfig.text, ...userConfig.text };
      }
      
      // Add CSS to page
      this.injectCSS();
      
      // Add popup HTML to page
      this.injectHTML();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Check if we should show the popup
      if (!this.hasSeenPopup() || !this.config.showOnce) {
        this.setupTriggers();
      }
      
      return this;
    },
  
    // Inject CSS into the page
    injectCSS: function() {
      const styleElement = document.createElement('style');
      styleElement.textContent = this.cssContent;
      document.head.appendChild(styleElement);
    },
  
    // Inject HTML into the page
    injectHTML: function() {
      // Create a container element
      const popupContainer = document.createElement('div');
      popupContainer.innerHTML = this.template;
      
      // Customize text content based on config
      const popupElement = popupContainer.firstElementChild;
      popupElement.querySelector('h2').textContent = this.config.text.heading;
      popupElement.querySelector('p').textContent = this.config.text.description;
      popupElement.querySelector('button').textContent = this.config.text.buttonText;
      
      // Append to body
      document.body.appendChild(popupContainer.firstElementChild);
    },
  
    // Set up event listeners
    setupEventListeners: function() {
      // Close button
      document.getElementById('subscription-popup-close').addEventListener('click', () => {
        this.closePopup();
      });
      
      // Click outside to close
      document.getElementById('subscription-popup-overlay').addEventListener('click', (e) => {
        if (e.target === document.getElementById('subscription-popup-overlay')) {
          this.closePopup();
        }
      });
      
      // Form submission
      document.getElementById('subscription-popup-form').addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitForm();
      });
      
      // Escape key to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closePopup();
        }
      });
    },
  
    // Set up trigger conditions
    setupTriggers: function() {
      const { triggers } = this.config;
      
      // Show after delay
      if (triggers.afterTime) {
        setTimeout(() => {
          this.showPopup();
        }, this.config.delay);
      }
      
      // Show on exit intent
      if (triggers.onExit) {
        document.addEventListener('mouseleave', (e) => {
          if (e.clientY < 0) {
            this.showPopup();
          }
        });
      }
      
      // Show after scrolling
      if (triggers.afterScroll) {
        window.addEventListener('scroll', () => {
          const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
          if (scrolled >= triggers.afterScroll) {
            this.showPopup();
            // Remove the scroll listener after triggered
            window.removeEventListener('scroll', this);
          }
        });
      }
    },
  
    // Show the popup
    showPopup: function() {
      const overlay = document.getElementById('subscription-popup-overlay');
      if (overlay && !overlay.classList.contains('active') && !this.hasSeenPopup()) {
        overlay.classList.add('active');
      }
    },
  
    // Close the popup
    closePopup: function() {
      const overlay = document.getElementById('subscription-popup-overlay');
      if (overlay) {
        overlay.classList.remove('active');
        
        // Set cookie to remember that user has seen the popup
        if (this.config.showOnce) {
          this.setPopupCookie();
        }
      }
    },
  
    // Submit the form
    submitForm: function() {
      const emailInput = document.getElementById('subscription-email');
      const nameInput = document.getElementById('subscription-name');
      const statusElement = document.getElementById('subscription-status');
      
      if (!emailInput.value) {
        this.showStatus('Please enter your email address.', 'error');
        return;
      }
      
      // Get visitor ID from cookie or create new one
      const visitorId = this.getVisitorId();
      
      // Prepare data
      const data = {
        email: emailInput.value,
        name: nameInput ? nameInput.value : '',
        visitor_id: visitorId,
        source_page: window.location.href
      };
      
      // Send to API
      fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        this.showStatus(this.config.text.successMessage, 'success');
        emailInput.value = '';
        nameInput.value = '';
        
        // Close popup after success (with delay to show success message)
        setTimeout(() => {
          this.closePopup();
        }, 2000);
      })
      .catch(error => {
        this.showStatus(this.config.text.errorMessage, 'error');
        console.error('Subscription error:', error);
      });
    },
  
    // Show status message
    showStatus: function(message, type) {
      const statusElement = document.getElementById('subscription-status');
      statusElement.textContent = message;
      statusElement.className = `subscription-status ${type}`;
    },
  
    // Check if user has seen popup already
    hasSeenPopup: function() {
      return document.cookie.split(';').some(item => item.trim().startsWith('subscribeSeen='));
    },
  
    // Set cookie to remember popup was shown
    setPopupCookie: function() {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + this.config.cookieExpiry);
      document.cookie = `subscribeSeen=true; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
    },
  
    // Get visitor ID for tracking
    getVisitorId: function() {
      let visitorId = this.getCookie('visitor_id');
      
      if (!visitorId) {
        // Generate a new ID
        visitorId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        
        // Set cookie
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        document.cookie = `visitor_id=${visitorId}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
        
        // If tracking API is available, send this new visitor
        this.trackVisitor(visitorId, true);
      } else {
        // If tracking API is available, log returning visitor
        this.trackVisitor(visitorId, false);
      }
      
      return visitorId;
    },
  
    // Helper function to get a cookie by name
    getCookie: function(name) {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
          return cookie.substring(name.length + 1);
        }
      }
      return null;
    },
  
    // Track visitor if tracking API available
    trackVisitor: function(visitorId, isNewVisitor) {
      const trackingEndpoint = this.config.apiEndpoint.replace('/subscribe', '/track');
      
      const data = {
        visitor_id: visitorId,
        is_new: isNewVisitor,
        timestamp: new Date().toISOString(),
        page_url: window.location.href,
        referrer: document.referrer || 'direct'
      };
      
      fetch(trackingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }).catch(error => console.error('Error sending tracking data:', error));
    }
  };