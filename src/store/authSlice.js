import { createSlice } from '@reduxjs/toolkit'

const storedUser = JSON.parse(localStorage.getItem('user'));

const authSlice = createSlice({
  name: 'auth',

  initialState: {
    user: storedUser || null,
    token: localStorage.getItem('token') || null,
    userId: localStorage.getItem('userId') || null,
    roles: JSON.parse(localStorage.getItem('roles')) || []
  },

  reducers: {
    setCredentials: (state, action) => {

      const user = action.payload.user;
      const token = action.payload.token;

      const roles = user?.realm_access?.roles || [];

      state.user = user;
      state.token = token;
      state.userId = user?.sub || null;
      state.roles = roles;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userId', user?.sub || '');
      localStorage.setItem('roles', JSON.stringify(roles));

      console.log("USER:", user);
      console.log("USER ID:", user?.sub);
      console.log("ROLES:", roles);
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.userId = null;
      state.roles = [];

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      localStorage.removeItem('roles');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;

// import { createSlice } from '@reduxjs/toolkit'

// const authSlice = createSlice({
//   name: 'auth',
//   initialState : {
//     user: JSON.parse(localStorage.getItem('user')) || null,
//     token: localStorage.getItem('token') || null,
//     userId: localStorage.getItem('userId') | null
//   },
//   reducers: {
//     // setCredentials: (state, action) => {
//     //   state.user = action.payload.user;
//     //   state.token = action.payload.token;
//     //   state.userId = action.payload.user.sub;

//     //   localStorage.setItem('token', action.payload.token);
//     //   localStorage.setItem('user', JSON.stringify(action.payload.user));
//     //   localStorage.setItem('userId', action.payload.user.sub);
//     // },
//     setCredentials: (state, action) => {
//       const user = action.payload.user;

//       state.user = user;
//       state.token = action.payload.token;
//       state.userId = user?.sub || null;

//       localStorage.setItem('token', action.payload.token);
//       localStorage.setItem('user', JSON.stringify(user));
//       localStorage.setItem('userId', user?.sub || '');
//       console.log("userId", user?.sub, " user ", user)
//     },
//     logout: (state) => {
//       state.user = null;
//       state.token = null;
//       state.userId = null;
      
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       localStorage.removeItem('userId');
//     },
//   },
// });

// export const { setCredentials, logout } = authSlice.actions;
// export default authSlice.reducer;