// src/service/complaintService.js

import ApiService from "./apiService";

export const getAllComplaints = (filters = {}) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `complaints`;
    apiObject.params = filters;
    return ApiService.callApi(apiObject);
};

export const getComplaintById = (id) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `complaints/${id}`;
    return ApiService.callApi(apiObject);
};

export const createComplaint = (complaintData) => {
    const apiObject = {};
    apiObject.method = 'POST';
    apiObject.authentication = true;
    apiObject.endpoint = `complaints`;
    apiObject.body = complaintData;
    return ApiService.callApi(apiObject);
};

export const updateComplaint = (id, complaintData) => {
    const apiObject = {};
    apiObject.method = 'PUT';
    apiObject.authentication = true;
    apiObject.endpoint = `complaints/${id}`;
    apiObject.body = complaintData;
    return ApiService.callApi(apiObject);
};

export const addComplaintNote = (id, note) => {
    const apiObject = {};
    apiObject.method = 'POST';
    apiObject.authentication = true;
    apiObject.endpoint = `complaints/${id}/notes`;
    apiObject.body = { note };
    return ApiService.callApi(apiObject);
};

export const submitComplaintFeedback = (id, feedback, rating) => {
    const apiObject = {};
    apiObject.method = 'POST';
    apiObject.authentication = true;
    apiObject.endpoint = `complaints/${id}/feedback`;
    apiObject.body = { feedback, rating };
    return ApiService.callApi(apiObject);
};