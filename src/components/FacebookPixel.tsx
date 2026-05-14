import React, { useEffect } from 'react';

interface FacebookPixelProps {
  pixelId: string;
}

export const FacebookPixel: React.FC<FacebookPixelProps> = ({ pixelId }) => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize Facebook Pixel
      (function (f: any, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

      fbq('init', pixelId);
      fbq('track', 'PageView');
    }
  }, [pixelId]);

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
};

// Facebook Pixel tracking functions
export const fbq = (event: string, ...args: any[]) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq(event, ...args);
  }
};

// Common conversion events for academic writing service
export const trackLeadGeneration = (value?: number, currency: string = 'USD') => {
  fbq('track', 'Lead', { value, currency });
};

export const trackServiceInquiry = (service: string, value?: number) => {
  fbq('track', 'AddToCart', {
    content_name: service,
    content_category: 'Academic Writing Services',
    value: value || 50,
    currency: 'USD'
  });
};

export const trackPurchase = (value: number, currency: string = 'USD', orderId?: string) => {
  fbq('track', 'Purchase', {
    value,
    currency,
    contents: [{
      id: orderId || 'academic-service',
      quantity: 1,
      item_price: value
    }]
  });
};

export const trackCompleteRegistration = (userType: string) => {
  fbq('track', 'CompleteRegistration', {
    content_name: userType,
    status: true
  });
};

export const trackCustomEvent = (eventName: string, parameters?: Record<string, any>) => {
  fbq('trackCustom', eventName, parameters);
};