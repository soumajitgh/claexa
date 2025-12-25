import React from 'react';

/**
 * Centralized disclosure text for Google API usage & terms.
 * Reused by both desktop and mobile login variants to guarantee consistency.
 */
export const GoogleApiDisclosure: React.FC<{ className?: string }> = ({ className }) => (
  <div className={"p-3 bg-blue-50 border border-blue-200 rounded-md " + (className || '')}>
    <p className="text-xs text-gray-700 text-center leading-snug">
      <strong>Data Usage:</strong> Claexa AI's use of information from Google APIs adheres to the{' '}
      <a
        href="https://developers.google.com/terms/api-services-user-data-policy"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline font-medium"
      >
        Google API Services User Data Policy
      </a>
      , including the{' '}
      <a
        href="https://developers.google.com/terms/api-services-user-data-policy#limited-use"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline font-medium"
      >
        Limited Use requirements
      </a>
      .
    </p>
  </div>
);

/** Inline terms helper for reuse */
export const TermsNotice: React.FC<{ className?: string }> = ({ className }) => (
  <p className={"text-center text-[11px] text-gray-600 " + (className || '')}>
    By continuing, you agree to our{' '}
    <a href="/l/privacy-policy" className="underline">Terms and Conditions</a>.
  </p>
);

export default GoogleApiDisclosure;
