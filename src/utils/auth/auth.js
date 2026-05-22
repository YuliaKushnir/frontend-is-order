export const getRoles = (tokenData) => {
  const roles = tokenData?.realm_access?.roles || [];

  console.log("ROLES =", roles);

  return roles;
};

export const hasRole = (tokenData, role) => {
  console.log("tokenData =", tokenData);

  return getRoles(tokenData).includes(role);
};

export const hasAnyRole = (tokenData, roles) => {
  console.log("tokenData =", tokenData);

  const userRoles = getRoles(tokenData);

  return roles.some(role =>
    userRoles.includes(role)
  );
};