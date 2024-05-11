import {userForgetPasswordSuccess, userForgetPasswordError} from "./reducer"

//Include Both Helper File with needed methods
import {getFirebaseBackend} from "../../../helpers/firebase_helper";


import * as authService from "../../../service/auth";
import {customToastMsg} from "../../../common/commonFunctions";
import * as constants from "../../../common/constants";

const fireBaseBackend = getFirebaseBackend();

export const userForgetPassword = (user, history) => async (dispatch) => {
    try {
        let response;
        console.log(user.email)
        let request = {
            "grant_type": "client",
            "client_id": constants.Client_ID,
            "client_secret": constants.Client_Secret,
            "email": user.email
        }
        console.log(history)
        authService.resetPasswordConfirmEmail(request).then(res => {
            console.log(res);
            customToastMsg('OTP code sent to your mailbox, check there first', 1, 'none ')
            dispatch(userForgetPasswordSuccess(
                "OTP code sent to your mailbox, check there first, check there first"
            ));
            history.navigate('/confirm-otp', { state: user.email })
            // window.location.href = '/confirm-otp'
        }).catch(c => {
            console.log(c)
            customToastMsg(c.response.data.message, 0)
        })

        const data = await response;

        if (data) {
            dispatch(userForgetPasswordSuccess(
                "OTP code sent to your mailbox, check there first"
            ))
        }
    } catch (forgetError) {
        dispatch(userForgetPasswordError(forgetError))
    }
}