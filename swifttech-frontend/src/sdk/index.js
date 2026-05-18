export function createClient({ appId, token, functionsVersion, serverUrl, requiresAuth, appBaseUrl }) {
  // Minimal stub – expand with your own logic
  return {
    appId,
    token,
    functionsVersion,
    serverUrl,
    requiresAuth,
    appBaseUrl,
    request: (endpoint, options) => {
      // implement your client request logic here
    }
  }
}
