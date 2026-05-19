import React, { useState } from "react";
import { Link } from "react-router-dom";

import Header from "./Header";
import NavLinks from "./NavLinks";

import './Navbar.css'

const Navbar = () => {
  return (
    <>
    <Header>
        <h1 className="main-navigation__title">
          <Link to="/">Garment print</Link>
        </h1>
        <nav className="main-navigation__header-nav">
            <NavLinks />
        </nav>
    </Header>
    </>
  );
};

export default Navbar;
