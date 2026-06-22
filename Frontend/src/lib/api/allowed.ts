const rules: Array<{ method: string; pattern: RegExp }> = [
  { method: "GET", pattern: /^category\/?$/ },
  { method: "GET", pattern: /^category\/\d+$/ },
  { method: "POST", pattern: /^category\/?$/ },
  { method: "PUT", pattern: /^category\/\d+$/ },
  { method: "DELETE", pattern: /^category\/\d+$/ },

  { method: "GET", pattern: /^article\/\d+$/ },
  { method: "GET", pattern: /^article\/active-article\/\d+$/ },
  { method: "POST", pattern: /^article\/?$/ },
  { method: "PUT", pattern: /^article\/\d+$/ },
  { method: "DELETE", pattern: /^article\/\d+$/ },
  { method: "GET", pattern: /^article\/\d+\/all-articles$/ },
  { method: "POST", pattern: /^article\/\d+\/make-active\/\d+$/ },
  { method: "POST", pattern: /^article\/\d+\/rate$/ },
  { method: "GET", pattern: /^article\/\d+\/is-rated$/ },
  { method: "POST", pattern: /^article\/\d+\/toggle-bookmark$/ },

  { method: "GET", pattern: /^comment\/\d+$/ },
  { method: "POST", pattern: /^comment\/\d+$/ },
  { method: "POST", pattern: /^comment\/reply\/\d+$/ },
  { method: "PUT", pattern: /^comment\/\d+$/ },
  { method: "DELETE", pattern: /^comment\/\d+$/ },
  { method: "POST", pattern: /^comment\/\d+\/(up-vote|down-vote|report)$/ },
  { method: "GET", pattern: /^comment\/is-voted\/\d+$/ },

  { method: "GET", pattern: /^profile\/profile-photo$/ },
  { method: "POST", pattern: /^profile\/validate-username$/ },
  { method: "GET", pattern: /^profile\/all$/ },
  { method: "GET", pattern: /^profile\/me$/ },
  { method: "PUT", pattern: /^profile\/me$/ },
  { method: "DELETE", pattern: /^profile\/me$/ },
  { method: "POST", pattern: /^profile\/request-for-editor-access$/ },

  { method: "GET", pattern: /^admin\/get-editor-request$/ },
  { method: "POST", pattern: /^admin\/make-editor\/\d+$/ },
  { method: "POST", pattern: /^admin\/revoke-editor\/\d+$/ },
  { method: "POST", pattern: /^admin\/suspend-user\/\d+$/ },
  { method: "POST", pattern: /^admin\/unsuspend-user\/\d+$/ },
  { method: "GET", pattern: /^admin\/all-report$/ },
  { method: "POST", pattern: /^admin\/resolve-report\/\d+$/ },
  { method: "GET", pattern: /^admin\/get-user-by-comment\/\d+$/ },
  { method: "POST", pattern: /^admin\/reset-user-password\/\d+$/ },

  { method: "POST", pattern: /^utility\/upload-image$/ },
];

export function isAllowedBackendRequest(method: string, rawPath: string): boolean {
  const path = rawPath.replace(/^\/+|\/+$/g, "");
  return rules.some(
    (rule) => rule.method === method.toUpperCase() && rule.pattern.test(path),
  );
}
