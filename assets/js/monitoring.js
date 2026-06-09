/**
 * Production-ready Website Monitoring Service
 * Vasni Martin Portfolio
 */

"use strict";

(function () {
  // Reusable analytics service
  const MonitoringService = {
    initialized: false,
    consentState: null, // 'accepted' | 'declined' | null
    isDevelopment: false,
    lastTrackedPath: '',
    config: {
      GA_MEASUREMENT_ID: "",
      CLARITY_PROJECT_ID: "",
      SENTRY_DSN: ""
    },

    /**
     * Entry point of the monitoring system
     */
    init: function () {
      // 1. Detect environment
      const host = window.location.hostname;
      const protocol = window.location.protocol;
      const isLocal = host === 'localhost' || host === '127.0.0.1' || protocol === 'file:';
      
      // Check query parameter override (?enable_analytics=true) or localStorage setting
      const urlParams = new URLSearchParams(window.location.search);
      const isExplicitlyEnabled = urlParams.get('enable_analytics') === 'true' || localStorage.getItem('enable_analytics_override') === 'true';

      if (isLocal) {
        this.isDevelopment = true;
        console.log("[Monitoring SDK] Running in local development mode.");
        if (!isExplicitlyEnabled) {
          console.log("[Monitoring SDK] Live telemetry and consent banner are disabled.");
          console.log("[Monitoring SDK] To test consent flow and event tracking locally, append '?enable_analytics=true' to the URL.");
        }
      }

      // If override is set, cache it in localStorage for consecutive page loads
      if (urlParams.get('enable_analytics') === 'true') {
        localStorage.setItem('enable_analytics_override', 'true');
      }

      // 2. Read environment configuration
      if (window.ENV) {
        this.config = { ...this.config, ...window.ENV };
      }

      // 3. Resolve consent state
      this.consentState = localStorage.getItem('cookie_consent');

      if (this.consentState === 'accepted') {
        if (!isLocal || isExplicitlyEnabled) {
          this.initializeMonitoring();
        }
      } else if (this.consentState === 'declined') {
        if (this.isDevelopment) {
          console.log("[Monitoring SDK] Analytics declined by user.");
        }
      } else {
        // Show consent banner if not in silent local development
        if (!isLocal || isExplicitlyEnabled) {
          this.showConsentBanner();
        }
      }

      // 4. Bind event listeners for custom action tracking
      this.bindUserActionTrackers();
      this.setupNetworkMonitoring();
    },

    /**
     * Show the dynamic glassmorphic privacy consent banner
     */
    showConsentBanner: function () {
      if (document.getElementById('privacy-consent-banner')) return;

      const banner = document.createElement('div');
      banner.id = 'privacy-consent-banner';
      banner.className = 'privacy-consent-banner glass';
      banner.innerHTML = `
        <div class="consent-content">
          <h4 class="consent-title">Privacy & Analytics</h4>
          <p class="consent-text">We use cookies and monitoring scripts (Google Analytics, Clarity, and Sentry) to analyze traffic, record rage clicks/heatmaps, and track frontend crashes. Your input details are masked.</p>
        </div>
        <div class="consent-actions">
          <button id="consent-decline-btn" class="consent-btn outline__btn">Decline</button>
          <button id="consent-accept-btn" class="consent-btn primary__btn">Accept All</button>
        </div>
      `;

      document.body.appendChild(banner);

      // Trigger transition reflow
      setTimeout(() => {
        banner.classList.add('show');
      }, 100);

      // Event handlers
      document.getElementById('consent-accept-btn').addEventListener('click', () => {
        this.setConsent(true);
      });

      document.getElementById('consent-decline-btn').addEventListener('click', () => {
        this.setConsent(false);
      });
    },

    /**
     * Hide privacy banner with smooth fade out
     */
    hideConsentBanner: function () {
      const banner = document.getElementById('privacy-consent-banner');
      if (banner) {
        banner.classList.remove('show');
        setTimeout(() => {
          banner.remove();
        }, 500);
      }
    },

    /**
     * Set user consent option
     */
    setConsent: function (accepted) {
      this.consentState = accepted ? 'accepted' : 'declined';
      localStorage.setItem('cookie_consent', this.consentState);
      this.hideConsentBanner();

      if (accepted) {
        this.initializeMonitoring();
      } else {
        console.log("[Monitoring SDK] Telemetry declined. No scripts will be loaded.");
      }
    },

    /**
     * Initialize Sentry, GA4, and Clarity
     */
    initializeMonitoring: function () {
      if (this.initialized) return;
      this.initialized = true;

      if (this.isDevelopment) {
        console.log("[Monitoring SDK] Initializing tracking libraries in sandbox/development mode.");
      }

      // Initialize GA4
      if (this.config.GA_MEASUREMENT_ID) {
        this.loadGA4(this.config.GA_MEASUREMENT_ID);
      } else {
        console.warn("[Monitoring SDK] Missing GA_MEASUREMENT_ID");
      }

      // Initialize Clarity
      if (this.config.CLARITY_PROJECT_ID) {
        this.loadClarity(this.config.CLARITY_PROJECT_ID);
      } else {
        console.warn("[Monitoring SDK] Missing CLARITY_PROJECT_ID");
      }

      // Initialize Sentry
      if (this.config.SENTRY_DSN) {
        this.loadSentry(this.config.SENTRY_DSN);
      } else {
        console.warn("[Monitoring SDK] Missing Sentry DSN");
      }
    },

    /**
     * Google Analytics 4 Script Loader
     */
    loadGA4: function (measurementId) {
      if (this.isDevelopment) {
        console.log(`[GA4 Mock] Loaded tracking script with ID: ${measurementId}`);
        // Mock gtag
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () {
          window.dataLayer.push(arguments);
          console.log("[GA4 Event Logs]", arguments);
        };
        this.trackPageView(window.location.hash || '#home');
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      script.async = true;
      script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () {
          window.dataLayer.push(arguments);
        };
        window.gtag('js', new Date());
        // Configure GA4 and prevent duplicate page_view on load
        window.gtag('config', measurementId, { send_page_view: false });
        
        // Fire initial manual page view
        this.trackPageView(window.location.hash || '#home');
      };
      document.head.appendChild(script);
    },

    /**
     * Microsoft Clarity Script Loader
     */
    loadClarity: function (projectId) {
      if (this.isDevelopment) {
        console.log(`[Clarity Mock] Loaded script with Project ID: ${projectId}`);
        window.clarity = function () {
          console.log("[Clarity Logs]", arguments);
        };
        return;
      }

      (function (c, l, a, r, i, t, y) {
        c[a] = c[a] || function () {
          (c[a].q = c[a].q || []).push(arguments);
        };
        t = l.createElement(r);
        t.async = 1;
        t.src = "https://www.clarity.ms/tag/" + i;
        y = l.getElementsByTagName(r)[0];
        y.parentNode.insertBefore(t, y);
      })(window, document, "clarity", "script", projectId);
    },

    /**
     * Sentry SDK Loader & Setup
     */
    loadSentry: function (dsn) {
      if (this.isDevelopment) {
        console.log(`[Sentry Mock] Initialized Sentry with DSN: ${dsn}`);
        // Handle local console logs for errors
        window.addEventListener('error', (event) => {
          console.error("[Sentry Mock Error Captured]", event.error || event.message);
        });
        window.addEventListener('unhandledrejection', (event) => {
          console.error("[Sentry Mock Promise Rejection Captured]", event.reason);
        });
        return;
      }

      const script = document.createElement('script');
      script.src = "https://browser.sentry-cdn.com/8.12.0/bundle.min.js";
      script.crossOrigin = "anonymous";
      script.onload = () => {
        if (window.Sentry) {
          window.Sentry.init({
            dsn: dsn,
            tracesSampleRate: 0.2, // capture 20% of traces for performance monitoring
            replaysSessionSampleRate: 0.1, // capture 10% of standard sessions
            replaysOnErrorSampleRate: 1.0, // always capture replays when error occurs
          });
          
          if (this.isDevelopment) {
            console.log("[Monitoring SDK] Sentry initialized successfully.");
          }
        }
      };
      document.head.appendChild(script);
    },

    /**
     * Track page view helper
     */
    trackPageView: function (sectionHash) {
      const path = window.location.pathname + (sectionHash || '#home');
      if (this.lastTrackedPath === path) return; // Prevent duplicates
      this.lastTrackedPath = path;

      const title = document.title + " | Section: " + (sectionHash ? sectionHash.substring(1) : "home");

      if (window.gtag) {
        window.gtag('event', 'page_view', {
          page_path: path,
          page_title: title,
          page_location: window.location.href
        });
      }
      
      if (window.clarity) {
        window.clarity("set", "page_section", sectionHash || "#home");
      }
      
      if (this.isDevelopment) {
        console.log(`[Event Tracked] page_view: path="${path}", title="${title}"`);
      }
    },

    /**
     * Track custom events to GA4 and Sentry
     */
    trackCustomEvent: function (eventName, eventParams = {}) {
      if (!this.consentState || this.consentState !== 'accepted') return;

      if (window.gtag) {
        window.gtag('event', eventName, eventParams);
      }

      if (window.Sentry) {
        window.Sentry.addBreadcrumb({
          category: 'analytics',
          message: `Event: ${eventName}`,
          level: 'info',
          data: eventParams
        });
      }

      if (this.isDevelopment) {
        console.log(`[Event Tracked] ${eventName}:`, eventParams);
      }
    },

    /**
     * Action-specific tracking helpers
     */
    trackNavigationClick: function (menuText, targetHash) {
      this.trackCustomEvent('navigation_clicked', {
        menu_item: menuText,
        target_hash: targetHash
      });
      // Fire manual page view for navigation
      if (targetHash) {
        this.trackPageView(targetHash);
      }
    },

    trackCTAClick: function (ctaLabel, targetUrl = '') {
      this.trackCustomEvent('cta_clicked', {
        cta_label: ctaLabel,
        target_url: targetUrl
      });
    },

    trackContactFormStart: function () {
      this.trackCustomEvent('contact_form_started', {
        form_name: 'contact_form'
      });
    },

    trackContactFormSubmit: function () {
      this.trackCustomEvent('contact_form_submitted', {
        form_name: 'contact_form'
      });
    },

    trackOutboundLinkClick: function (url) {
      this.trackCustomEvent('outbound_link_clicked', {
        destination_url: url
      });
    },

    trackApiRequestFailed: function (url, method, status) {
      this.trackCustomEvent('api_request_failed', {
        request_url: url,
        request_method: method,
        response_status: status
      });

      if (window.Sentry) {
        window.Sentry.captureException(new Error(`API Request Failed: ${method} ${url} - Status ${status}`));
      }
    },

    // Reusable methods for login and signup attempts (strongly typed interface support)
    trackLoginStarted: function (method = 'credentials') {
      this.trackCustomEvent('login_started', { login_method: method });
    },

    trackLoginSucceeded: function (method = 'credentials') {
      this.trackCustomEvent('login_succeeded', { login_method: method });
    },

    trackSignupStarted: function (method = 'credentials') {
      this.trackCustomEvent('signup_started', { signup_method: method });
    },

    trackSignupCompleted: function (method = 'credentials') {
      this.trackCustomEvent('signup_completed', { signup_method: method });
    },

    /**
     * Binds automatic element level listeners (navigation, CTA buttons, form fields)
     */
    bindUserActionTrackers: function () {
      document.addEventListener('DOMContentLoaded', () => {
        // 1. Navigation items tracking (detect both header and mobile menus)
        const navElements = document.querySelectorAll('.header__menu--link, .offcanvas__menu_item, [data-offcanvas]');
        navElements.forEach(navLink => {
          navLink.addEventListener('click', (e) => {
            const label = navLink.textContent.trim();
            const href = navLink.getAttribute('href');
            if (href && href.startsWith('#')) {
              this.trackNavigationClick(label, href);
            }
          });
        });

        // 2. Hashchange listener to catch hash navigation (e.g. scrolling/back button)
        window.addEventListener('hashchange', () => {
          this.trackPageView(window.location.hash || '#home');
        }, { passive: true });

        // 3. Outbound and CTA link tracking
        document.body.addEventListener('click', (e) => {
          const anchor = e.target.closest('a');
          if (!anchor) return;

          const href = anchor.getAttribute('href');
          if (!href) return;

          // Outbound Links
          if (href.startsWith('http') && !href.includes(window.location.hostname)) {
            this.trackOutboundLinkClick(href);
          }

          // CTAs (buttons, key links)
          const isCTA = anchor.classList.contains('primary__btn') || 
                        anchor.classList.contains('outline__btn') || 
                        anchor.classList.contains('download__btn') ||
                        anchor.hasAttribute('data-track-cta');
          
          if (isCTA) {
            this.trackCTAClick(anchor.textContent.trim() || 'CTA', href);
          }
        });

        // 4. Form activity tracking
        const contactForm = document.querySelector('.contact__form');
        if (contactForm) {
          let formStarted = false;

          // Track form input started (only track once per session until submitted/reset)
          const startInputs = contactForm.querySelectorAll('input, textarea');
          startInputs.forEach(input => {
            input.addEventListener('focus', () => {
              if (!formStarted) {
                formStarted = true;
                this.trackContactFormStart();
              }
            }, { once: true });
          });

          // Track form submission
          contactForm.addEventListener('submit', () => {
            this.trackContactFormSubmit();
          });
        }
      });
    },

    /**
     * Intercept XMLHttpRequests and Fetch APIs to catch network failure events
     */
    setupNetworkMonitoring: function () {
      const self = this;

      // Intercept Fetch API
      if (window.fetch) {
        const originalFetch = window.fetch;
        window.fetch = async function (...args) {
          const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '');
          const options = args[1] || {};
          const method = options.method || 'GET';

          try {
            const response = await originalFetch.apply(this, args);
            if (!response.ok) {
              self.trackApiRequestFailed(url, method, response.status);
            }
            return response;
          } catch (error) {
            self.trackApiRequestFailed(url, method, 'Network Error');
            throw error;
          }
        };
      }

      // Intercept XMLHttpRequest
      const originalOpen = XMLHttpRequest.prototype.open;
      const originalSend = XMLHttpRequest.prototype.send;

      XMLHttpRequest.prototype.open = function (method, url, ...args) {
        this._url = url;
        this._method = method;
        return originalOpen.apply(this, [method, url, ...args]);
      };

      XMLHttpRequest.prototype.send = function (...args) {
        this.addEventListener('load', function () {
          if (this.status >= 400) {
            self.trackApiRequestFailed(this._url, this._method, this.status);
          }
        });

        this.addEventListener('error', function () {
          self.trackApiRequestFailed(this._url, this._method, 'Network Error');
        });

        return originalSend.apply(this, args);
      };
    }
  };

  // Expose to window object
  window.MonitoringService = MonitoringService;

  // Auto-init on script load
  MonitoringService.init();
})();
