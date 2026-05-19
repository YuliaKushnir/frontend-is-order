import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "react-oauth2-code-pkce";
import { hasAnyRole } from "utils/auth/auth";


export default function ProtectedRoute({
  children,
  roles = []
}) {

  const {
    isAuthenticated,
    tokenData
  } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (
    roles.length > 0 &&
    !hasAnyRole(tokenData, roles)
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
}