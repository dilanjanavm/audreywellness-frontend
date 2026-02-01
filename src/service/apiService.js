import axios from 'axios';
import apiConfig from './apiConfig';
import Cookies from "js-cookie";
import * as constants from "../common/constants";
import * as authService from "./auth";


export const callApi = async (apiObject) => {
    let body = {};
    let method = apiObject.method ? apiObject.method.toLowerCase() : 'get';

    if (method === 'post' || method === 'put' || method === 'patch' || method === 'delete') {
        body = apiObject.body ? apiObject.body : {};
    }
    let headers = {};


    // For multipart requests, use a completely different approach
    if (apiObject.isMultipart) {
        console.log(body)
        return await handleMultipartRequest(apiObject, body, headers, method);
    }

    // Normal request handling for non-multipart
    if (apiObject.urlencoded) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
    } else if (apiObject.arrayBufferType) {
        headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        headers['Content-Disposition'] = 'attachment; filename=template.xlsx';
    } else {
        headers['Content-Type'] = 'application/json';
    }


    if (apiObject.authentication) {
        let access_token = Cookies.get(constants.ACCESS_TOKEN);
        let refresh_token = Cookies.get(constants.REFRESH_TOKEN);
        if (access_token && apiObject.state !== 'refresh_token') {
            headers.Authorization = `Bearer ${access_token}`;
        } else if (apiObject.state === 'refresh_token') {
            headers.Authorization = `Bearer ${refresh_token}`;
        }

    }

    if (apiObject.isBasicAuth) {
        headers.Authorization = `Basic ${constants.BASIC_AUTH}`;
    }

    headers.VerfiyCode = Cookies.get(constants.VERIFY_CODE);

    // const url = apiObject.isWithoutPrefix ? `${apiConfig.serverUrl}/${apiObject.endpoint}` : `${apiConfig.serverUrl}/${apiConfig.basePath}/${apiObject.endpoint}`;

    const url = `${apiConfig.serverUrl}/${apiObject.endpoint}`;

    let result;


    //  await axios[method](url, {headers: headers}, {headers: headers})
    // await axios[method](url, method !== 'get' && method !== 'delete' ? body : {headers: headers}, {headers: headers} )
    await axios({
        method: method,
        url: url,
        data: (method === 'post' || method === 'put' || method === 'patch') ? body : undefined,
        headers: headers,
        timeout: apiObject.isMultipart ? 30000 : 10000,
    }).then(async response => {
        result = {
            ...await response.data,
            desc: response.data.desc ? response.data.desc : response.data.result,
            status: response && response.status ? response.status : 0
        };
    })
        .catch(async error => {
            console.log(error.response)
            if (error !== undefined) {
                if (error.response === undefined) {
                    result = {
                        success: false, status: 2, data: null,
                        message: "Your connection was interrupted"
                    }
                } else if (error.response.status === 401) {
                    // Save current location for redirect after login
                    const currentPath = window.location.pathname + window.location.search;
                    if (currentPath !== '/login' && currentPath !== '/') {
                        sessionStorage.setItem('redirectAfterLogin', currentPath);
                    }
                    
                    // Clear authentication data
                    Cookies.remove(constants.ACCESS_TOKEN);
                    Cookies.remove(constants.REFRESH_TOKEN);
                    Cookies.remove(constants.Expire_time);
                    sessionStorage.removeItem("authUser");
                    
                    // Redirect to login
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                    
                    result = {
                        success: false, status: 401, data: null,
                        message: "Your session has expired. Please login again."
                    };
                } else if (error.response.status === 403) {
                    result = {
                        success: false, status: 2, data: null,
                        message: "Access is denied."
                    };
                } else if (error.response.status === 417) {
                    result = {
                        success: false, status: 2, data: null,
                        message: "Oops! Something went wrong."
                    };
                } else if (error.response.data !== undefined) {
                    result = {
                        success: false, status: 0, data: null,
                        message: error.response.data.result ? error.response.data.result : 'Sorry, something went wrong'
                    }
                } else {
                    result = {
                        success: false, status: 2, data: null,
                        message: "Sorry, something went wrong."
                    };
                }
            } else {
                result = {
                    success: false, status: 2, data: null,
                    message: "Your connection was interrupted!"
                };
            }
            throw error;
        });


    return result;
};

const handleMultipartRequest = async (apiObject, body, headers, method) => {
    // Add authentication headers
    if (apiObject.authentication) {
        let access_token = Cookies.get(constants.ACCESS_TOKEN);
        let refresh_token = Cookies.get(constants.REFRESH_TOKEN);
        if (access_token && apiObject.state !== 'refresh_token') {
            headers.Authorization = `Bearer ${access_token}`;
        } else if (apiObject.state === 'refresh_token') {
            headers.Authorization = `Bearer ${refresh_token}`;
        }
    }

    if (apiObject.isBasicAuth) {
        headers.Authorization = `Basic ${constants.BASIC_AUTH}`;
    }

    headers.VerfiyCode = Cookies.get(constants.VERIFY_CODE);

    const url = `${apiConfig.serverUrl}/${apiObject.endpoint}`;

    let result;

    // Create a new axios instance with custom config for multipart
    const axiosInstance = axios.create();

    await axiosInstance({
        method: method,
        url: url,
        data: body, // This should be FormData
        headers: headers,
        timeout: 30000,
        transformRequest: [(data, headers) => {
            // Remove any Content-Type that might be set
            delete headers['Content-Type'];
            return data;
        }],
    }).then(async response => {
        result = {
            ...response.data,
            desc: response.data.desc ? response.data.desc : response.data.result,
            status: response && response.status ? response.status : 0
        };
    })
        .catch(async error => {
            console.log(error.response);
            if (error !== undefined) {
                if (error.response === undefined) {
                    result = {
                        success: false, status: 2, data: null,
                        message: "Your connection was interrupted"
                    };
                } else if (error.response.status === 401) {
                    // Save current location for redirect after login
                    const currentPath = window.location.pathname + window.location.search;
                    if (currentPath !== '/login' && currentPath !== '/') {
                        sessionStorage.setItem('redirectAfterLogin', currentPath);
                    }
                    
                    // Clear authentication data
                    Cookies.remove(constants.ACCESS_TOKEN);
                    Cookies.remove(constants.REFRESH_TOKEN);
                    Cookies.remove(constants.Expire_time);
                    sessionStorage.removeItem("authUser");
                    
                    // Redirect to login
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                    
                    result = {
                        success: false, status: 401, data: null,
                        message: "Your session has expired. Please login again."
                    };
                } else if (error.response.status === 403) {
                    result = {
                        success: false, status: 2, data: null,
                        message: "Access is denied."
                    };
                } else if (error.response.status === 417) {
                    result = {
                        success: false, status: 2, data: null,
                        message: "Oops! Something went wrong."
                    };
                } else if (error.response.data !== undefined) {
                    result = {
                        success: false, status: 0, data: null,
                        message: error.response.data.result ? error.response.data.result : 'Sorry, something went wrong'
                    };
                } else {
                    result = {
                        success: false, status: 2, data: null,
                        message: "Sorry, something went wrong."
                    };
                }
            } else {
                result = {
                    success: false, status: 2, data: null,
                    message: "Your connection was interrupted!"
                };
            }
            throw result;
        });

    return result;
};

export const renewTokenHandler = async (apiObject) => {
    //alert('refreshToken')
    //  Cookies.remove(constants.ACCESS_TOKEN);
    //  Cookies.remove(constants.REFRESH_TOKEN);
    //  Cookies.remove(constants.Expire_time);
    //  Cookies.remove('userDetails');
    //  Cookies.remove(constants.ACCESS_TOKEN);
    //  window.location = `/login`;


    let result;
    // renew token - start
    const obj = {refresh_token: Cookies.get(constants.REFRESH_TOKEN), grant_type: 'refresh_token'};


    await authService.renewToken().then(async response => {

        Cookies.set(constants.ACCESS_TOKEN, response.data.access_token);
        Cookies.set(constants.REFRESH_TOKEN, response.data.refresh_token);
        result = await callApi(apiObject);
    }).catch(async c => {


        window.location = `/login`;
    });
    // renew token - end
    return result;
};

export default {renewTokenHandler, callApi};
