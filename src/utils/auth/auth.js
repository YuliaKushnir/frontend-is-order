// export const getRoles = (tokenData) => {
//   return tokenData?.resource_access?.["oauth2-pkce-client"]?.roles || [];
// };

export const getRoles = (tokenData) => {
  console.log("ROLE = ", tokenData?.realm_access?.roles || [])
  return tokenData?.realm_access?.roles || [];
};

export const hasRole = (tokenData, role) => {
  console.log("tokenData = ", tokenData)

  return getRoles(tokenData).includes(role);
};

export const hasAnyRole = (tokenData, roles) => {
  console.log("tokenData = ", tokenData)

  const userRoles = getRoles(tokenData);

  return roles.some(role =>
    userRoles.includes(role)
  );
};