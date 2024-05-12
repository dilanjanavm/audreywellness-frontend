import axios from "axios";
import Cookies from "js-cookie";
import * as  constants from "../common/constants";

export const getLoggedinUser = () => {
    const user = Cookies.get(constants.ACCESS_TOKEN);
    if (!user) {
        return null;
    } else {
        return user;
    }
};

export const setAuthorization = (token) => {
    console.log(    token)
  //  axios.defaults.headers.common["Authorization"] = "Bearer " + token;
};