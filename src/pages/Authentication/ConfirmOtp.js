import withRouter from "../../Components/Common/withRouter";
import React, {useEffect, useState} from "react";
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";
import {
    Alert,
    Card,
    CardBody,
    Col,
    Container,
    Form, FormFeedback, FormGroup, Input, Label,
    Row,
} from "reactstrap";
import {Link} from "react-router-dom";
import logoLight from "../../assets/images/logo/addressLogo02.png";

import OtpInput from 'react-otp-input';
import {useFormik} from "formik";
import * as Yup from "yup";
import {userForgetPassword} from "../../slices/auth/forgetpwd/thunk";
import {customToastMsg} from "../../common/commonFunctions";
import {passwordRegex} from "../../common/util";
import {resetPasswordDetailsWithOtp} from "../../service/auth";
import * as authService from "../../service/auth";
import * as constants from "../../common/constants";
import {userForgetPasswordSuccess} from "../../slices/auth/forgetpwd/reducer";

const ConfirmOtp = (props) => {
    const [error, setError] = useState('');
    const [step, setStep] = useState('OTP');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [retypePassword, setRetypePassword] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [resendCounter, setResendCounter] = useState(30);
    const verifyOtpCode = () => {
        if (otp.length === 6) {
            setStep('PASSWORD')
        } else {
            customToastMsg('Enter correct OTP code', 0)
        }

    }
    const changePassword = () => {
        if (newPassword.trim() === '') {
            customToastMsg('New Passwords cannot be empty', 0)
        } else if (!passwordRegex(newPassword)) {
            customToastMsg('Password must be at least 8 characters long and include an uppercase letter (A-Z), a digit (0-9), and a special character', 0)
        } else if (newPassword !== retypePassword) {
            customToastMsg('Passwords are not match! Try again', 0)
        } else {
            let data = {
                "email": props.router.location.state,
                "otp": otp,
                "password": newPassword,
                "password_confirmation": retypePassword
            }
            console.log(data);

            authService.resetPasswordDetailsWithOtp(data).then(
                res => {
                    props.navigate('/login')
                }
            ).catch(c => {
                customToastMsg(c.response.data.message, 0);
                setStep('OTP')
            })

        }
    }

    const startCountdown = () => {
        setIsResending(true);
        setResendCounter(30);
    };

    useEffect(() => {
        let countdownInterval;

        if (isResending && resendCounter > 0) {
            countdownInterval = setInterval(() => {
                setResendCounter((prevCounter) => prevCounter - 1);
            }, 1000);
        } else if (resendCounter === 0) {
            setIsResending(false);
        }

        return () => clearInterval(countdownInterval);
    }, [isResending, resendCounter]);


    const handleResend = () => {
        let request = {
            "grant_type": "client",
            "client_id": constants.Client_ID,
            "client_secret": constants.Client_Secret,
            "email": props.router.location.state
        }

        authService.resetPasswordConfirmEmail(request).then(res => {
            customToastMsg('Reset link are sent to your mailbox, check there first', 1, 'none ');
            startCountdown();
            setOtp('')
        }).catch(c => {
            console.log(c)
            customToastMsg(c.response.data.message, 0)
        })

    };

    document.title = "Confirm Otp";
    return (
        <React.Fragment className=" bg-login-view ">
            <ParticlesAuth>
                <div className="auth-page-content pt-5">
                    <Container className="pt-2">
                        <Row>
                            <Col lg={12}>
                                <div className="text-center mt-sm-5 mb-4 text-white-50">
                                    <div>
                                        <Link to="/" className="d-inline-block mt-5 auth-logo">
                                            <img src={logoLight} alt="" height="100"/>
                                        </Link>
                                    </div>
                                    <p className="mt-3 text-primary fs-15 fw-medium">Tea & Soul Admin Dashboard</p>
                                </div>
                            </Col>
                        </Row>

                        {step === 'OTP' ?
                            <Row className="justify-content-center">
                                <Col md={8} lg={6} xl={5}>
                                    <Card className="mt-4 card-shadow">
                                        <CardBody className="p-4">
                                            <div className="text-center mt-2">
                                                <h2 className="text-primary">Confirm OTP !</h2>
                                                <p className="text-muted">Insert your OTP code</p>
                                            </div>
                                            {error && error ? (<Alert color="danger"> {error} </Alert>) : null}
                                            <div className="p-2 mt-4">
                                                <div>
                                                    <div class="otp-wrapper">
                                                        <OtpInput
                                                            value={otp}
                                                            onChange={setOtp}
                                                            numInputs={6}
                                                            renderSeparator={<span> {' - '}</span>}
                                                            renderInput={(props) => <input
                                                                style={{width: '2rem'}} {...props} />}
                                                        />
                                                    </div>
                                                    <div className="text-center mt-4">
                                                        <button   onClick={verifyOtpCode}
                                                                className="btn btn-success w-100" type="button">
                                                            Verify OTP Code
                                                        </button>
                                                    </div>

                                                    <div className="text-center mt-4">
                                                        {!isResending &&
                                                            <b style={{textDecoration: "underline"}}
                                                               onClick={handleResend} disabled={isResending}
                                                               className="text-primary">Resend OTP</b>}
                                                        {isResending && <p className='text-secondary'>Try again in <b
                                                            className="text-primary">00:{resendCounter < 10 ? `0${resendCounter}` : resendCounter}</b> seconds
                                                        </p>}
                                                    </div>

                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>


                                </Col>
                            </Row> :
                            <Row className="justify-content-center">
                                <Col md={8} lg={6} xl={5}>
                                    <Card className="mt-4 card-shadow">
                                        <CardBody className="p-4">
                                            <div className="text-center mt-2">
                                                <h2 className="text-primary">Enter your new password </h2>
                                                {/*<p className="text-muted">Enter your new password </p>*/}
                                            </div>
                                            {error && error ? (<Alert color="danger"> {error} </Alert>) : null}
                                            <div className="p-2 mt-4">
                                                <div
                                                >
                                                    <div>
                                                        <FormGroup>
                                                            <Label for="exampleEmail">
                                                                New Password
                                                            </Label>
                                                            <Input
                                                                id="exampleEmail"
                                                                name="newpassword"
                                                                onChange={(event) => {
                                                                    setNewPassword(event.target.value)
                                                                }}
                                                                placeholder="new password"
                                                                type="password"
                                                            />
                                                        </FormGroup>

                                                        <FormGroup>
                                                            <Label for="exampleEmail">
                                                                Retype Password
                                                            </Label>
                                                            <Input
                                                                id="exampleEmail"
                                                                name="text"
                                                                placeholder="retype password"
                                                                type="password"
                                                                onChange={(event) => {
                                                                    setRetypePassword(event.target.value)
                                                                }}
                                                            />

                                                        </FormGroup>
                                                    </div>
                                                    <div className="text-center mt-4">
                                                        <button onClick={() => changePassword()}
                                                                className="btn btn-success w-100" type="button">Change
                                                            Password
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>


                                </Col>
                            </Row>
                        }
                    </Container>
                </div>
            </ParticlesAuth>
        </React.Fragment>
    );
}
export default withRouter(ConfirmOtp);