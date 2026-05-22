// export const authConfig = {
//     clientId: 'gateway-client',
//     authorizationEndpoint: `/realms/cloud-realm/protocol/openid-connect/auth`,
//     tokenEndpoint: `/realms/cloud-realm/protocol/openid-connect/token`,
//     redirectUri: 'https://34.116.235.108',
//     scope: 'openid profile email offline_access',
//     onRefreshTokenExpire: (event) => event.logIn(),
//   }

export const authConfig = {
  clientId: 'order-processing',
  authorizationEndpoint: 'https://34.116.235.108/realms/garment_print/protocol/openid-connect/auth',
  tokenEndpoint: 'https://34.116.235.108/realms/garment_print/protocol/openid-connect/token',
  redirectUri: "https://34.116.235.108",
  scope: 'openid profile email offline_access',
  onRefreshTokenExpire: (event) => event.logIn(),
};