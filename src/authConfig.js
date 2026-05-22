// export const authConfig = {
//     clientId: 'gateway-client',
//     authorizationEndpoint: `/realms/cloud-realm/protocol/openid-connect/auth`,
//     tokenEndpoint: `/realms/cloud-realm/protocol/openid-connect/token`,
//     redirectUri: 'https://34.116.235.108',
//     scope: 'openid profile email offline_access',
//     onRefreshTokenExpire: (event) => event.logIn(),
//   }

export const authConfig = {
  clientId: 'gateway-client',
  authorizationEndpoint: 'https://34.116.235.108/realms/cloud-realm/protocol/openid-connect/auth',
  tokenEndpoint: 'https://34.116.235.108/realms/cloud-realm/protocol/openid-connect/token',
  redirectUri: window.location.origin,
  scope: 'openid profile email',
  onRefreshTokenExpire: (event) => event.logIn(),
};