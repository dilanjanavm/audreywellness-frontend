import axios from "axios";

/**
 * Citypak API Service
 * Direct integration with Citypak courier service API
 * Using Live credentials
 * 
 * NOTE: API endpoints are configured based on common patterns.
 * If the actual Citypak API uses different endpoints, please update
 * the endpoint arrays in each function accordingly.
 * 
 * Live Credentials:
 * - Account Number: 7259
 * - Username: rumesh_2@audreycare.co
 * - API Token: 135-8f2028d1-01a2-4970-a7f0-3cde42941fbd
 * - Base URL: https://m.citypak.lk
 */

// Live Environment Credentials
const CITYPAK_CONFIG = {
  accountNumber: "7259",
  username: "rumesh_2@audreycare.co",
  password: "ACse@#19746",
  apiToken: "135-8f2028d1-01a2-4970-a7f0-3cde42941fbd",
  baseUrl: "https://falcon.citypak.lk", // Live environment
  timeout: 30000,
};

/**
 * Get authentication headers for Citypak API
 */
const getAuthHeaders = () => {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${CITYPAK_CONFIG.apiToken}`,
    "X-Account-Number": CITYPAK_CONFIG.accountNumber,
  };
};

/**
 * Make API request to Citypak
 */
const makeCitypakRequest = async (method, endpoint, data = null, customHeaders = {}) => {
  try {
    const url = `${CITYPAK_CONFIG.baseUrl}${endpoint}`;
    const headers = {
      ...getAuthHeaders(),
      ...customHeaders,
    };

    const config = {
      method: method.toLowerCase(),
      url: url,
      headers: headers,
      timeout: CITYPAK_CONFIG.timeout,
    };

    if (data && (method.toLowerCase() === "post" || method.toLowerCase() === "put" || method.toLowerCase() === "patch")) {
      config.data = data;
    }

    const response = await axios(config);
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    console.error("Citypak API Error:", error);

    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        status: error.response.status,
        message: error.response.data?.message || error.response.data?.error || "API request failed",
        data: error.response.data,
      };
    } else if (error.request) {
      // Request made but no response
      return {
        success: false,
        status: 0,
        message: "No response from server. Please check your connection.",
      };
    } else {
      // Error setting up request
      return {
        success: false,
        status: 0,
        message: error.message || "An error occurred",
      };
    }
  }
};

/**
 * Track order by tracking number
 * @param {String} trackingNumber - Tracking number (e.g., D00008987)
 * @returns {Promise}
 */
export const trackOrder = async (trackingNumber) => {
  if (!trackingNumber || !trackingNumber.trim()) {
    return {
      success: false,
      message: "Tracking number is required",
    };
  }

  // Official Endpoint: customer_api/v1/track?tracking_number={tracking_number}
  const endpoint = `/customer_api/v1/track?tracking_number=${encodeURIComponent(trackingNumber.trim())}`;

  const result = await makeCitypakRequest("GET", endpoint);

  // Transform response to match expected format
  if (result.success && result.data) {
    // API Response: { is_success: true, data: { ... } }
    if (result.data.is_success && result.data.data) {
      const apiData = result.data.data;
      return {
        success: true,
        data: {
          trackingNumber: apiData.tracking_number,
          reference: apiData.reference,
          // API returns is_delivered: true/false
          isDelivered: apiData.is_delivered,
          receiverName: apiData.receiver_name,
          receiverNic: apiData.receiver_nic,
          podImageUrl: apiData.pod_image_url,
          trackingHistory: apiData.tracking_history || [],
          // Keep raw data accessible
          ...apiData
        },
        status: result.status,
      };
    }

    // Handle "success" property as per user's actual response
    if (result.data.success && result.data.data) {
      const apiData = result.data.data;
      return {
        success: true,
        data: {
          trackingNumber: apiData.tracking_number,
          reference: apiData.reference,
          isDelivered: apiData.is_delivered,
          receiverName: apiData.receiver_name,
          receiverNic: apiData.receiver_nic,
          podImageUrl: apiData.pod_image_url,
          trackingHistory: apiData.tracking_history || [],
          ...apiData
        },
        status: result.status,
      };
    }

    // Handle "Failed Response" structure from docs: { success: false, message: "...", data: [...] }
    if (result.data.success === false) {
      return {
        success: false,
        message: result.data.message || "Invalid Tracking Number",
        status: result.status
      };
    }

    // If response is already in expected format (fallback)
    return result;
  }

  return result;
};

/**
 * Create a new courier order
 * @param {Object} orderData - Order data
 * @returns {Promise}
 */
export const createOrder = async (orderData) => {
  if (!orderData) {
    return {
      success: false,
      message: "Order data is required",
    };
  }

  // Official Endpoint: customer_api/v1/orders
  const endpoint = `/customer_api/v1/orders`;
  return await makeCitypakRequest("POST", endpoint, orderData);
};

/**
 * Get order details by order ID
 * @param {String} orderId - Order ID
 * @returns {Promise}
 */
export const getOrderById = async (orderId) => {
  if (!orderId) {
    return {
      success: false,
      message: "Order ID is required",
    };
  }

  const endpoints = [
    `/api/orders/${orderId}`,
    `/api/v1/orders/${orderId}`,
    `/orders/${orderId}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const result = await makeCitypakRequest("GET", endpoint);
      if (result.success && result.data) {
        return result;
      }
    } catch (err) {
      continue;
    }
  }

  return await makeCitypakRequest("GET", `/customer_api/v1/orders/${orderId}`);
};

/**
 * Get all orders
 * @param {Object} filters - Optional filters (page, limit, etc.)
 * @returns {Promise}
 */
export const getAllOrders = async (filters = {}) => {
  let queryString = "";
  if (Object.keys(filters).length > 0) {
    const params = new URLSearchParams(filters);
    queryString = `?${params.toString()}`;
  }

  const endpoints = [
    `/api/orders${queryString}`,
    `/api/v1/orders${queryString}`,
    `/orders${queryString}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const result = await makeCitypakRequest("GET", endpoint);
      if (result.success && result.data) {
        return result;
      }
    } catch (err) {
      continue;
    }
  }

  return await makeCitypakRequest("GET", `/customer_api/v1/orders${queryString}`);
};

/**
 * Print waybill by order ID
 * @param {String} orderId - Order ID
 * @param {String} pageSize - Page size (A4 or 4X6)
 * @returns {Promise}
 */
export const printWaybill = async (orderId, pageSize = "A4") => {
  if (!orderId) {
    return {
      success: false,
      message: "Order ID is required",
    };
  }

  try {
    const endpoint = `/customer_api/v1/orders/${orderId}/waybills?page_size=${pageSize}`;
    const url = `${CITYPAK_CONFIG.baseUrl}${endpoint}`;
    const headers = getAuthHeaders();

    // Remove Content-Type for blob response
    delete headers["Content-Type"];

    const response = await axios({
      method: "GET",
      url: url,
      headers: headers,
      responseType: "blob",
      timeout: CITYPAK_CONFIG.timeout,
    });

    // Download the PDF
    const blob = new Blob([response.data], { type: "application/pdf" });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `waybill_${orderId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    return {
      success: true,
      message: "Waybill downloaded successfully",
    };
  } catch (error) {
    console.error("Error downloading waybill:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to download waybill",
    };
  }
};

/**
 * Public tracking endpoint (no authentication required)
 * @param {String} trackingNumber - Tracking number
 * @returns {Promise}
 */
export const trackOrderPublic = async (trackingNumber) => {
  // The API requires authentication/API Key for all requests.
  // "Public" in this context means the user of the website doesn't need to login to OUR system,
  // but we still use the configured API Token to talk to Citypak.
  return await trackOrder(trackingNumber);
};

export default {
  trackOrder,
  trackOrderPublic,
  createOrder,
  getOrderById,
  getAllOrders,
  printWaybill,
};