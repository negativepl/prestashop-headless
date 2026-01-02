// InPost Pay Configuration
// Docs: https://dokumentacja-inpost.atlassian.net/wiki/spaces/PL/pages/152731649

export type InPostPayEnvironment = "sandbox" | "production";

interface InPostPayConfig {
  environment: InPostPayEnvironment;
  clientId: string;
  clientSecret: string;
  merchantId: string;
  posId: string;
  authUrl: string;
  apiUrl: string;
  widgetUrl: string;
}

const SANDBOX_CONFIG = {
  authUrl: "https://sandbox-login.inpost.pl/auth/realms/external/protocol/openid-connect/token",
  apiUrl: "https://sandbox-api.inpost.pl/v1/izi",
  widgetUrl: "https://sandbox-izi.inpost.pl/v1/widget.js",
};

const PRODUCTION_CONFIG = {
  authUrl: "https://login.inpost.pl/auth/realms/external/protocol/openid-connect/token",
  apiUrl: "https://api.inpost.pl/v1/izi",
  widgetUrl: "https://izi.inpost.pl/v1/widget.js",
};

export function getInPostPayConfig(): InPostPayConfig {
  const environment = (process.env.INPOST_PAY_ENVIRONMENT || "sandbox") as InPostPayEnvironment;
  const envConfig = environment === "production" ? PRODUCTION_CONFIG : SANDBOX_CONFIG;

  const clientId = process.env.INPOST_PAY_CLIENT_ID;
  const clientSecret = process.env.INPOST_PAY_CLIENT_SECRET;
  const merchantId = process.env.INPOST_PAY_MERCHANT_ID;
  const posId = process.env.INPOST_PAY_POS_ID;

  if (!clientId || !clientSecret || !merchantId) {
    console.warn("InPost Pay credentials not configured");
  }

  return {
    environment,
    clientId: clientId || "",
    clientSecret: clientSecret || "",
    merchantId: merchantId || "",
    posId: posId || "",
    ...envConfig,
  };
}

export const inpostPayConfig = getInPostPayConfig();
