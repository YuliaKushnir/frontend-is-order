export const authConfig = {
  clientId: 'oauth2-pkce-client',
  authorizationEndpoint: `/realms/cloud-realm/protocol/openid-connect/auth`,
  tokenEndpoint: `/realms/cloud-realm/protocol/openid-connect/token`,
  redirectUri: window.location.origin,
  scope: 'openid profile email offline_access',
}

// export const authConfig = {
//     clientId: 'oauth2-pkce-client',
//     authorizationEndpoint: 'http://localhost:8181/realms/is-order-processing/protocol/openid-connect/auth',
//     tokenEndpoint: 'http://localhost:8181/realms/is-order-processing/protocol/openid-connect/token',
//     redirectUri: 'http://localhost:3000',
//     scope: 'openid profile email offline_access',
//     onRefreshTokenExpire: (event) => event.logIn(),
//   }