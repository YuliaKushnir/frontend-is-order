import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

// import { AuthContext } from "../../context/auth-context";
import "./NavLinks.css";
import { CartContext } from "../../../context/CartContext";
import { Button } from "@mui/material";
import { AuthContext } from "react-oauth2-code-pkce";
import { hasAnyRole } from "utils/auth/auth";

const NavLinks = () => {
  const { token, tokenData, logIn, logOut, isAuthenticated } = useContext(AuthContext);

  const { cart } = useContext(CartContext);

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const userId = tokenData?.sub;

  return (
    <ul className="nav-links">
      <li><NavLink to="/products" end>КАТАЛОГ</NavLink></li>

      {hasAnyRole(tokenData, ["ROLE_MANAGER", "ROLE_ADMIN"]) && (
      < li><NavLink to="/stock">СКЛАД</NavLink></li>
      )}

      {hasAnyRole(tokenData, ["ROLE_EXECUTOR"]) && (
        < li><NavLink to="/stock/all">СКЛАД</NavLink></li>
      )}

      {hasAnyRole(tokenData, ["ROLE_MANAGER", "ROLE_EXECUTOR", "ROLE_ADMIN"]) && (
        <li><NavLink to="/orders">ЗАМОВЛЕННЯ</NavLink></li>
      )}

      {hasAnyRole(tokenData, ["ROLE_ADMIN"]) && (
        <li><NavLink to={`/users`}>КОРИСТУВАЧІ</NavLink></li>
      )}

      {hasAnyRole(tokenData, ["ROLE_MANAGER", "ROLE_EXECUTOR", "ROLE_ADMIN"]) && (
        <li><NavLink to="/statistics">СТАТИСТИКА</NavLink></li>
      )}
      
      { !token ? (
        <li><Button onClick={() => { logIn(); }}>ОСОБИСТИЙ КАБІНЕТ</Button></li>
      ) : (
        <li><NavLink to={`/account/${userId}`}>ОСОБИСТИЙ КАБІНЕТ</NavLink></li>
      )}

      

      <li>
        <NavLink to="/cart" style={{ position: "relative" }}>
          <ShoppingCartIcon />
          {totalItems > 0 && (
            <span
              style={{position: "absolute", top: -5,
                right: -10, background: "red",
                color: "#fff", borderRadius: "50%",
                fontSize: 12, padding: "2px 6px"
              }}
            >
              {totalItems}
            </span>
          )}
        </NavLink>
      </li>

      { !token ? (
        <li><Button onClick={() => { logIn(); }}>ВХІД</Button></li>
      ) : (
        <li><Button onClick={() => { logOut(); }}>ВИХІД</Button></li>
      )}
    </ul>
  );
};

export default NavLinks;