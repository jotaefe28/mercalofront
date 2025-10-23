/**
 * Security utilities for MercaloPOS authentication system
 */

// CSRF Token management
export class CSRFService {
  private static readonly CSRF_TOKEN_KEY = 'mercalo_csrf_token';
  private static readonly CSRF_HEADER = 'X-CSRF-Token';

  static generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  static setCSRFToken(token: string): void {
    sessionStorage.setItem(this.CSRF_TOKEN_KEY, token);
  }

  static getCSRFToken(): string | null {
    return sessionStorage.getItem(this.CSRF_TOKEN_KEY);
  }

  static removeCSRFToken(): void {
    sessionStorage.removeItem(this.CSRF_TOKEN_KEY);
  }

  static getCSRFHeaders(): Record<string, string> {
    const token = this.getCSRFToken();
    return token ? { [this.CSRF_HEADER]: token } : {};
  }
}

// Security headers validation
export class SecurityHeadersService {
  static validateSecurityHeaders(headers: Record<string, string>): boolean {
    const requiredHeaders = [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'X-XSS-Protection',
      'Strict-Transport-Security'
    ];

    return requiredHeaders.every(header => 
      headers[header] || headers[header.toLowerCase()]
    );
  }

  static getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.mercalopos.com;"
    };
  }
}

// Input sanitization
export class SanitizationService {
  static sanitizeHtml(input: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };
    
    return input.replace(/[&<>"'/]/g, (s) => map[s]);
  }

  static sanitizeEmail(email: string): string {
    // Remove potentially dangerous characters
    return email.replace(/[<>'"&]/g, '').toLowerCase().trim();
  }

  static sanitizeInput(input: string): string {
    // Remove script tags and potentially dangerous content
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }
}

// Security logging
export class SecurityLogger {
  private static logs: SecurityLog[] = [];
  private static readonly MAX_LOGS = 1000;

  static log(event: SecurityEvent): void {
    const logEntry: SecurityLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      event,
      userAgent: navigator.userAgent,
      ip: 'client-side', // In a real app, this would come from the server
    };

    this.logs.unshift(logEntry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS);
    }

    // Send critical events to server
    if (event.severity === 'high') {
      this.sendLogToServer(logEntry);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.warn('Security Event:', logEntry);
    }
  }

  static getLogs(): SecurityLog[] {
    return [...this.logs];
  }

  static getLogsByType(type: SecurityEventType): SecurityLog[] {
    return this.logs.filter(log => log.event.type === type);
  }

  private static async sendLogToServer(log: SecurityLog): Promise<void> {
    try {
      await fetch('/api/security/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...SecurityHeadersService.getSecurityHeaders(),
          ...CSRFService.getCSRFHeaders(),
        },
        body: JSON.stringify(log),
      });
    } catch (error) {
      console.error('Failed to send security log to server:', error);
    }
  }
}

// Session security
export class SessionSecurityService {
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private static readonly ACTIVITY_CHECK_INTERVAL = 60 * 1000; // 1 minute
  private static lastActivity = Date.now();
  private static activityTimer: number | null = null;
  private static warningTimer: number | null = null;

  static initializeSessionSecurity(): void {
    this.updateLastActivity();
    this.startActivityMonitoring();
    this.bindActivityEvents();
  }

  static updateLastActivity(): void {
    this.lastActivity = Date.now();
  }

  static isSessionExpired(): boolean {
    return Date.now() - this.lastActivity > this.SESSION_TIMEOUT;
  }

  static getRemainingTime(): number {
    return Math.max(0, this.SESSION_TIMEOUT - (Date.now() - this.lastActivity));
  }

  static extendSession(): void {
    this.updateLastActivity();
    if (this.warningTimer) {
      window.clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
  }

  static destroySession(): void {
    if (this.activityTimer) {
      window.clearInterval(this.activityTimer);
      this.activityTimer = null;
    }
    if (this.warningTimer) {
      window.clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
  }

  private static startActivityMonitoring(): void {
    this.activityTimer = window.setInterval(() => {
      if (this.isSessionExpired()) {
        this.handleSessionExpiry();
      } else if (this.getRemainingTime() < 5 * 60 * 1000 && !this.warningTimer) {
        // Show warning 5 minutes before expiry
        this.showSessionWarning();
      }
    }, this.ACTIVITY_CHECK_INTERVAL);
  }

  private static bindActivityEvents(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.updateLastActivity();
      }, { passive: true });
    });
  }

  private static handleSessionExpiry(): void {
    SecurityLogger.log({
      type: 'session_expired',
      severity: 'medium',
      message: 'User session has expired',
      details: {
        lastActivity: new Date(this.lastActivity).toISOString(),
        timeoutDuration: this.SESSION_TIMEOUT,
      },
    });

    // Force logout
    window.dispatchEvent(new CustomEvent('session-expired'));
  }

  private static showSessionWarning(): void {
    this.warningTimer = window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent('session-warning', {
        detail: { remainingTime: this.getRemainingTime() }
      }));
    }, 1000);
  }
}

// Types
export interface SecurityEvent {
  type: SecurityEventType;
  severity: 'low' | 'medium' | 'high';
  message: string;
  details?: Record<string, any>;
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEvent;
  userAgent: string;
  ip: string;
}

export type SecurityEventType = 
  | 'login_attempt'
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'token_refresh'
  | 'token_expired'
  | 'session_expired'
  | 'csrf_violation'
  | 'rate_limit_exceeded'
  | 'suspicious_activity'
  | 'security_header_missing'
  | 'xss_attempt'
  | 'sql_injection_attempt';

// Rate limiting with exponential backoff
export class RateLimitService {
  private static attempts = new Map<string, RateLimitData>();
  
  static checkRateLimit(
    key: string, 
    maxAttempts: number = 5, 
    windowMs: number = 15 * 60 * 1000,
    enableBackoff: boolean = true
  ): RateLimitResult {
    const now = Date.now();
    const data = this.attempts.get(key);
    
    if (!data || now > data.resetTime) {
      this.attempts.set(key, {
        count: 1,
        resetTime: now + windowMs,
        backoffMultiplier: 1,
      });
      return { allowed: true, retryAfter: 0, remainingAttempts: maxAttempts - 1 };
    }
    
    if (data.count >= maxAttempts) {
      const backoffTime = enableBackoff 
        ? windowMs * Math.pow(2, data.backoffMultiplier - 1)
        : windowMs;
      
      return {
        allowed: false,
        retryAfter: Math.max(0, data.resetTime - now),
        remainingAttempts: 0,
        backoffTime,
      };
    }
    
    data.count++;
    return {
      allowed: true,
      retryAfter: 0,
      remainingAttempts: maxAttempts - data.count,
    };
  }
  
  static incrementBackoff(key: string): void {
    const data = this.attempts.get(key);
    if (data) {
      data.backoffMultiplier = Math.min(data.backoffMultiplier + 1, 5);
    }
  }
  
  static resetRateLimit(key: string): void {
    this.attempts.delete(key);
  }
}

interface RateLimitData {
  count: number;
  resetTime: number;
  backoffMultiplier: number;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfter: number;
  remainingAttempts: number;
  backoffTime?: number;
}