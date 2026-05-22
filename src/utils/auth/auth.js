export const getRoles = (tokenData) => {
  return tokenData?.resource_access?.["order-processing"]?.roles || [];
};

// export const getRoles = (tokenData) => {
//   return tokenData?.realm_access?.roles || [];
// };

export const hasRole = (tokenData, role) => {
  return getRoles(tokenData).includes(role);
};

export const hasAnyRole = (tokenData, roles) => {
  const userRoles = getRoles(tokenData);

  return roles.some(role =>
    userRoles.includes(role)
  );
};
