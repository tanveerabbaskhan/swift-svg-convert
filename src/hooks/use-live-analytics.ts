import { useEffect, useState } from "react";

interface LiveUser {
  id: string;
  sessionId: string;
  page: string;
  timestamp: number;
  isActive: boolean;
  country?: string;
  referrer?: string;
  userAgent?: string;
}

interface AnalyticsEvent {
  type: 'page_view' | 'conversion' | 'upload' | 'download' | 'error' | 'feature_usage';
  data: any;
  timestamp: number;
}

export function useLiveAnalytics() {
  const [liveUsers, setLiveUsers] = useState<LiveUser[]>([]);
  const [totalConversions, setTotalConversions] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [currentPageUsers, setCurrentPageUsers] = useState(0);

  useEffect(() => {
    // Generate unique session ID for this user
    const sessionId = sessionStorage.getItem('analytics_session') || 
      `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session', sessionId);

    // Track current user
    const currentUser: LiveUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      page: window.location.pathname,
      timestamp: Date.now(),
      isActive: true,
      country: 'Unknown', // Could be enhanced with geolocation API
      referrer: document.referrer,
      userAgent: navigator.userAgent
    };

    // Add to live users
    setLiveUsers(prev => {
      const filtered = prev.filter(user => 
        Date.now() - user.timestamp < 300000 // Remove users inactive for 5 minutes
      );
      return [...filtered, currentUser];
    });

    // Track page view
    trackEvent('page_view', {
      page: window.location.pathname,
      title: document.title,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      session_id: sessionId
    });

    // Cleanup inactive users
    const interval = setInterval(() => {
      setLiveUsers(prev => prev.filter(user => 
        Date.now() - user.timestamp < 300000
      ));
    }, 60000); // Check every minute

    // Update analytics stats
    setActiveUsers(liveUsers.filter(u => u.isActive).length);
    setCurrentPageUsers(liveUsers.filter(u => u.page === window.location.pathname).length);

    return () => {
      clearInterval(interval);
      // Mark user as inactive when leaving
      setLiveUsers(prev => prev.map(user => 
        user.id === currentUser.id ? { ...user, isActive: false } : user
      ));
    };
  }, []);

  const trackEvent = (type: AnalyticsEvent['type'], data: any) => {
    const event: AnalyticsEvent = {
      type,
      data,
      timestamp: Date.now()
    };

    // Send to analytics endpoint or Google Analytics
    if (window.gtag) {
      window.gtag('event', type, {
        event_category: getEventCategory(type),
        event_label: getEventLabel(type, data),
        value: getEventValue(type, data),
        custom_map: {
          session_id: sessionStorage.getItem('analytics_session'),
          live_users_count: liveUsers.length,
          active_users_count: activeUsers
        }
      });
    }

    // Also send to your own analytics endpoint
    sendToAnalyticsEndpoint(event);
  };

  const getEventCategory = (type: string): string => {
    switch (type) {
      case 'page_view': return 'engagement';
      case 'conversion': return 'conversions';
      case 'upload': return 'user_interaction';
      case 'download': return 'conversions';
      case 'error': return 'system';
      case 'feature_usage': return 'engagement';
      default: return 'general';
    }
  };

  const getEventLabel = (type: string, data: any): string => {
    switch (type) {
      case 'page_view': return data.page || 'unknown_page';
      case 'conversion': return data.conversion_type || 'png_to_svg';
      case 'upload': return data.file_type || 'file_upload';
      case 'download': return data.file_type || 'svg_download';
      case 'error': return data.error_type || 'general_error';
      case 'feature_usage': return data.feature_name || 'feature_interaction';
      default: return 'unknown_event';
    }
  };

  const getEventValue = (type: string, data: any): number => {
    switch (type) {
      case 'conversion': return 1;
      case 'upload': return data.file_size_bytes || 0;
      case 'download': return 1;
      default: return 0;
    }
  };

  const sendToAnalyticsEndpoint = async (event: AnalyticsEvent) => {
    try {
      // Send to your analytics API (you can implement this endpoint)
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.warn('Analytics endpoint not available:', error);
    }
  };

  return {
    liveUsers,
    totalConversions,
    activeUsers,
    currentPageUsers,
    trackEvent,
    trackPageView: (page: string, title: string) => {
      trackEvent('page_view', { page, title });
    },
    trackConversion: (fileSize: number, conversionTime: number, conversionType: string = 'png_to_svg') => {
      setTotalConversions(prev => prev + 1);
      trackEvent('conversion', {
        conversion_type: conversionType,
        file_size_bytes: fileSize,
        conversion_time_ms: conversionTime,
        success: true
      });
    },
    trackFileUpload: (fileSize: number, fileType: string) => {
      trackEvent('upload', {
        file_type: fileType,
        file_size_bytes: fileSize
      });
    },
    trackDownload: (fileType: string, fileSize?: number) => {
      trackEvent('download', {
        file_type: fileType,
        file_size_bytes: fileSize
      });
    },
    trackError: (errorType: string, errorMessage: string, context?: any) => {
      trackEvent('error', {
        error_type: errorType,
        error_message: errorMessage,
        context
      });
    },
    trackFeatureUsage: (featureName: string, action: string, details?: any) => {
      trackEvent('feature_usage', {
        feature_name: featureName,
        action,
        details
      });
    }
  };
}
