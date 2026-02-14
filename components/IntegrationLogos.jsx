"use client";

/**
 * Real-ish SVG logos for each integration.
 * These are simplified/stylized versions recognizable at small sizes.
 */

export function SalesforceLogo({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M13.3 7.2c1.2-1.3 2.9-2 4.7-2 2.3 0 4.3 1.2 5.4 3 1-.5 2.1-.7 3.2-.7 4.1 0 7.4 3.3 7.4 7.4s-3.3 7.4-7.4 7.4c-.6 0-1.1-.1-1.7-.2-1 1.7-2.9 2.9-5 2.9-1 0-2-.3-2.8-.7-1 2-3.1 3.4-5.5 3.4-2.6 0-4.8-1.6-5.7-3.9-.4.1-.9.1-1.3.1C1.9 23.9 0 20.7 0 17.6 0 14.5 2.8 11.4 5.6 11.4c.6 0 1.1.1 1.7.3.8-2.5 3-4.5 6-4.5z"
        fill="#00A1E0"
      />
    </svg>
  );
}

export function ZendeskLogo({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 4v14.4L4 28V13.6L16 4z" fill="#03363D" />
      <path d="M16 28h12L16 18.4V28z" fill="#03363D" />
      <path d="M4 4h12L4 13.6V4z" fill="#03363D" />
      <path d="M16 4v14.4L28 4H16z" fill="#03363D" opacity="0.7" />
    </svg>
  );
}

export function IntercomLogo({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="2" y="2" width="28" height="28" rx="7" fill="#286EFA" />
      <path
        d="M9 11v7M12 9v11M16 8v12M20 9v11M23 11v7"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M9 23c2 1.5 5 2.5 7 2.5s5-1 7-2.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function SlackLogo({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M8.5 19.5a2.5 2.5 0 01-5 0 2.5 2.5 0 012.5-2.5h2.5v2.5zM9.75 19.5a2.5 2.5 0 015 0v6.25a2.5 2.5 0 01-5 0V19.5z"
        fill="#E01E5A"
      />
      <path
        d="M12.25 8.5a2.5 2.5 0 010-5 2.5 2.5 0 012.5 2.5v2.5h-2.5zM12.25 9.75a2.5 2.5 0 010 5H6a2.5 2.5 0 010-5h6.25z"
        fill="#36C5F0"
      />
      <path
        d="M23.25 12.25a2.5 2.5 0 015 0 2.5 2.5 0 01-2.5 2.5h-2.5v-2.5zM22 12.25a2.5 2.5 0 01-5 0V6a2.5 2.5 0 015 0v6.25z"
        fill="#2EB67D"
      />
      <path
        d="M19.5 23.25a2.5 2.5 0 010 5 2.5 2.5 0 01-2.5-2.5v-2.5h2.5zM19.5 22a2.5 2.5 0 010-5H26a2.5 2.5 0 010 5h-6.5z"
        fill="#ECB22E"
      />
    </svg>
  );
}

export function GongLogo({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="2" y="2" width="28" height="28" rx="7" fill="#7C3AED" />
      <circle cx="16" cy="14" r="7" stroke="white" strokeWidth="2.5" fill="none" />
      <line x1="16" y1="21" x2="16" y2="28" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="12" y1="26" x2="20" y2="26" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function HubSpotLogo({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="21" cy="16" r="4" stroke="#FF7A59" strokeWidth="2.5" fill="none" />
      <circle cx="10" cy="9" r="2.5" fill="#FF7A59" />
      <circle cx="10" cy="23" r="2.5" fill="#FF7A59" />
      <line x1="12" y1="10" x2="17.5" y2="13.5" stroke="#FF7A59" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="22" x2="17.5" y2="18.5" stroke="#FF7A59" strokeWidth="2" strokeLinecap="round" />
      <line x1="25" y1="16" x2="28" y2="16" stroke="#FF7A59" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function JiraLogo({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M27.1 15L17 4.9a2.83 2.83 0 00-4 0L2.9 15a2.83 2.83 0 000 4L13 29.1a2.83 2.83 0 004 0L27.1 19a2.83 2.83 0 000-4zM15 20.3l-3.3-3.3L15 13.7l3.3 3.3L15 20.3z"
        fill="#0052CC"
      />
    </svg>
  );
}

export function LinearLogo({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="2" y="2" width="28" height="28" rx="7" fill="#5E6AD2" />
      <path
        d="M6.7 22.8a13.2 13.2 0 002.5 2.5l16.1-16.1a13.2 13.2 0 00-2.5-2.5L6.7 22.8z"
        fill="white"
      />
      <path
        d="M6 18.8c.1 1 .3 2 .6 2.8L18.4 9.8c-.8-.3-1.8-.5-2.8-.6L6 18.8z"
        fill="white"
        opacity="0.7"
      />
      <path
        d="M25.2 10.4c.3.8.5 1.8.6 2.8l-12.6 12.6c-1-.1-2-.3-2.8-.6l14.8-14.8z"
        fill="white"
        opacity="0.7"
      />
    </svg>
  );
}

export function AmplitudeLogo({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="2" y="2" width="28" height="28" rx="7" fill="#1D2026" />
      <path
        d="M8 22l4-10 3 6 3-12 3 8 3-4"
        stroke="#2DCEB1"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/* Map integration IDs to logo components */
const LOGO_MAP = {
  salesforce: SalesforceLogo,
  zendesk: ZendeskLogo,
  intercom: IntercomLogo,
  slack: SlackLogo,
  gong: GongLogo,
  hubspot: HubSpotLogo,
  jira: JiraLogo,
  linear: LinearLogo,
  amplitude: AmplitudeLogo,
};

export default function IntegrationLogo({ id, size = 24 }) {
  const Logo = LOGO_MAP[id];
  if (!Logo) {
    return (
      <div
        className="rounded-lg flex items-center justify-center text-white text-[11px] font-bold"
        style={{ width: size, height: size, backgroundColor: "#999" }}
      >
        ?
      </div>
    );
  }
  return <Logo size={size} />;
}
