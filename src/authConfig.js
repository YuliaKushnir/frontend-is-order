// export const authConfig = {
//   clientId: 'oauth2-pkce-client',
//   authorizationEndpoint: `/realms/cloud-realm/protocol/openid-connect/auth`,
//   tokenEndpoint: `/realms/cloud-realm/protocol/openid-connect/token`,
//   redirectUri: window.location.origin,
//   scope: 'openid profile email offline_access',
// }

export const authConfig = {
    clientId: 'frontend-client',
    authorizationEndpoint: `${window.location.origin}/realms/cloud-realm/protocol/openid-connect/auth`,
    tokenEndpoint: `${window.location.origin}/realms/cloud-realm/protocol/openid-connect/token`,
    redirectUri: window.location.origin,
    scope: 'openid profile email',
    onRefreshTokenExpire: (event) => event.logIn(),
  }