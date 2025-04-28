// Function to create or update a tracking cookie
function setTrackingCookie() {
    // Check if the visitor already has our tracking cookie
    const existingCookie = getCookie('visitor_id');
    
    if (!existingCookie) {
      // If no cookie exists, create a new unique ID
      const visitorId = generateUniqueId();
      
      // Set cookie with a 1-year expiration
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      
      // Set the cookie
      document.cookie = `visitor_id=${visitorId}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
      
      // Send this new visitor to your API
      sendVisitorToAPI(visitorId, true);
      
      return visitorId;
    } else {
      // This is a returning visitor, just log the visit
      sendVisitorToAPI(existingCookie, false);
      
      return existingCookie;
    }
  }
  
  // Helper function to generate a unique ID
  function generateUniqueId() {
    // Simple implementation using timestamp and random numbers
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
  
  // Helper function to get a cookie by name
  function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name + '=')) {
        return cookie.substring(name.length + 1);
      }
    }
    return null;
  }
  
  // Function to send visitor data to your API
  function sendVisitorToAPI(visitorId, isNewVisitor) {
    const data = {
      visitor_id: visitorId,
      is_new: isNewVisitor,
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      referrer: document.referrer || 'direct'
    };
    
    fetch('https://api.ultravidz.com/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .catch(error => console.error('Error sending tracking data:', error));
  }
  
  // Function to subscribe a user's email
  function subscribeUser(email, name = '') {
    // Basic email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return Promise.reject("Invalid email format");
    }
  
    // Get visitor ID from cookie
    const visitorId = getCookie('visitor_id') || setTrackingCookie();
    
    const data = {
      email: email,
      name: name,
      visitor_id: visitorId,
      source_page: window.location.href
    };
    
    return fetch('https://api.ultravidz.com/subscribe', {
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
    });
  }
  
  // Example usage for a subscription form
  function setupSubscriptionForm() {
    const form = document.getElementById('newsletter-form');
    
    if (form) {
      form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const emailInput = document.getElementById('email');
        const nameInput = document.getElementById('name');
        const statusElement = document.getElementById('subscription-status');
        
        if (emailInput) {
          subscribeUser(emailInput.value, nameInput ? nameInput.value : '')
            .then(data => {
              if (statusElement) {
                statusElement.textContent = data.message || 'Subscription successful!';
                statusElement.className = 'success';
              }
              form.reset();
            })
            .catch(error => {
              if (statusElement) {
                statusElement.textContent = error.message || 'Subscription failed. Please try again.';
                statusElement.className = 'error';
              }
              console.error('Subscription error:', error);
            });
        }
      });
    }
  }
  
  // Run the tracking function when the page loads
  document.addEventListener('DOMContentLoaded', () => {
    setTrackingCookie();
    setupSubscriptionForm();
  });