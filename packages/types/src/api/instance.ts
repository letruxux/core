/**
 * Response from GET /instance (unauthenticated).
 * Instance info and API/gateway endpoints.
 */
export interface APIInstance {
  api_code_version: string | number;
  endpoints: {
    api: string;
    gateway: string;
    api_client?: string;
    api_public?: string;
    media?: string;
    static_cdn?: string;
    marketing?: string;
    admin?: string;
    invite?: string;
    gift?: string;
    webapp?: string;
    [key: string]: unknown;
  };
  captcha?: Record<string, unknown>;
  features?: {
    voice_enabled?: boolean;
    self_hosted?: boolean;
    stripe_enabled?: boolean;
    sms_mfa_enabled?: boolean;
    manual_review_enabled?: boolean;
    [key: string]: unknown;
  };
  push?: Record<string, unknown>;
  [key: string]: unknown;
}
