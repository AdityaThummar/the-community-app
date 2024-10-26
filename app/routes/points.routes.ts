const AUTH_ROUTE = "/auth";
const APP_ROUTE = "/app";
const FEED_ROUTE = "/feed";

const RouterPoints = {
  //auth routes, All points will starts with 'AUTH_ROUTE/...'
  AUTH_SIGNUP_REGISTER: `/signup/register`,
  AUTH_SIGNIN: `/signin`,
  AUTH_REFRESH_TOKENS: `/refresh-tokens`,
  AUTH_PROFILE: "/profile",
  DELETE_ACCOUNT: "/delete-account",

  //feed routes, All points will starts with 'APP_ROUTE/FEED_ROUTE/...'
  FEED_CREATE: "/create",
  SINGLE_FEED: "/:id",
  REACT_FEED: "/reaction",
  ALL_FEEDS: "/all",
};

export { RouterPoints, AUTH_ROUTE, APP_ROUTE, FEED_ROUTE };
