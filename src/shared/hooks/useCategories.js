import React from "react";

export const useCategories = () => {
  const [categories, setCategories] = React.useState([]);

  React.useEffect(() => {
    fetch("http://localhost:8080/categories")
      .then(res => res.json())
      .then(data => {
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => setCategories([]));
  }, []);

  return categories;
};