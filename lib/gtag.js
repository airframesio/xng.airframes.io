// Google Analytics — shares the Airframes/Airwaves property so the xng docs site
// rolls up with the rest of the family. Swap the ID if a dedicated stream is set up.
export const GA_TRACKING_ID = 'G-ZJPSH6XWCR';

const ready = () => typeof window !== 'undefined' && typeof window.gtag === 'function';

export const pageview = (url) => {
  if (!ready()) return;
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

export const event = ({ action, category, label, value }) => {
  if (!ready()) return;
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
  });
};
