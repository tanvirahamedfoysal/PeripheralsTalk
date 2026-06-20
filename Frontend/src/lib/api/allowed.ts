type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface AllowedRoute {
  methods: readonly HttpMethod[];
  pattern: RegExp;
}

const allowedRoutes: readonly AllowedRoute[] = [
  {
    methods: ["POST"],
    pattern:
      /^auth\/(register|login|validate-token|request-reset-password|reset-password)\/?$/,
  },
  {
    methods: ["GET", "POST"],
    pattern: /^category\/?$/,
  },
  {
    methods: ["GET", "PUT", "DELETE"],
    pattern: /^category\/\d+\/?$/,
  },
  {
    methods: ["GET", "POST", "DELETE"],
    pattern: /^article\/\d+\/?$/,
  },
  {
    methods: ["GET"],
    pattern: /^article\/\d+\/all-articles\/?$/,
  },
  {
    methods: ["POST"],
    pattern: /^article\/\d+\/make-active\/\d+\/?$/,
  },
  {
    methods: ["POST"],
    pattern: /^article\/\d+\/vote\/?$/,
  },
  {
    methods: ["POST"],
    pattern: /^article\/toggle_favourite\/\d+\/?$/,
  },
  {
    methods: ["GET", "POST", "PUT", "DELETE"],
    pattern: /^comment\/\d+\/?$/,
  },
  {
    methods: ["POST"],
    pattern: /^comment\/\d+\/(up-vote|down-vote|report)\/?$/,
  },
  {
    methods: ["GET"],
    pattern: /^profile\/(profile-photo|all)\/?$/,
  },
  {
    methods: ["GET", "PUT", "DELETE"],
    pattern: /^profile\/me\/?$/,
  },
  {
    methods: ["POST"],
    pattern: /^profile\/request-for-editor-access\/?$/,
  },
  {
    methods: ["GET"],
    pattern: /^admin\/(get-editor-request|all-report)\/?$/,
  },
  {
    methods: ["POST"],
    pattern:
      /^admin\/(make-editor|revoke-editor|suspend-user|unsuspend-user|resolve-report|reset-user-password)\/\d+\/?$/,
  },
  {
    methods: ["GET"],
    pattern: /^admin\/get-user-by-comment\/\d+\/?$/,
  },
  {
    methods: ["POST"],
    pattern: /^utility\/upload-image\/?$/,
  },
];

export function isAllowedBackendRequest(method: string, path: string): boolean {
  const normalizedMethod = method.toUpperCase() as HttpMethod;

  return allowedRoutes.some(
    (route) => route.methods.includes(normalizedMethod) && route.pattern.test(path),
  );
}
