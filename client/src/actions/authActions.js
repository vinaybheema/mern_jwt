import axios from "axios";
import jwt_decode from "jwt-decode";
import { GET_ERRORS, SET_CURRENT_USER } from "./types";
import { setAuthTokenHeader } from "../utils/authTokenHeader";

export const registerUser = (userData, history) => dispatchEvent => {
  axios
    .post("/api/users/register", userData)
    .then(res => history.push("/login"))
    .catch(err => {
      dispatchEvent({
        type: GET_ERRORS,
        payload: err.response.data
      });
    });
};

export const logInUser = userData => dispatchEvent => {
  axios
    .post("/api/users/login", userData)
    .then(res => {
      console.log(res.data);
      const { token } = res.data;
      localStorage.setItem("jwtToken", token);
      setAuthTokenHeader(token);
      const decoded = jwt_decode(token);
      console.log("data", decoded);
      dispatchEvent(setCurrentUser(decoded));
    })
    .catch(err => {
      dispatchEvent({
        type: GET_ERRORS,
        payload: err.response.data
      });
    });
};

export const setCurrentUser = decoded => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  };
};

export const logOutUser = dispatchEvent => {
  localStorage.removeItem("jwtToken");
  setAuthTokenHeader(false);
  dispatchEvent(setCurrentUser({}));
};
