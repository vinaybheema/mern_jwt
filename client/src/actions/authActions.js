import axios from "axios";
import { GET_ERRORS } from "./types";

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
