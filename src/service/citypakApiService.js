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
  baseUrl: "https://m.citypak.lk", // Live environment
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

  // Common Citypak tracking endpoint patterns
  // Try different possible endpoints
  const endpoints = [
    `/api/track/${trackingNumber.trim()}`,
    `/api/v1/track/${trackingNumber.trim()}`,
    `/track/${trackingNumber.trim()}`,
    `/api/orders/track/${trackingNumber.trim()}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const result = await makeCitypakRequest("GET", endpoint);
      if (result.success && result.data) {
        return result;
      }
    } catch (err) {
      // Try next endpoint
      continue;
    }
  }

  // If all endpoints fail, try the most common one and return error
  return await makeCitypakRequest("GET", `/api/track/${trackingNumber.trim()}`);
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

  const endpoints = [
    `/api/orders`,
    `/api/v1/orders`,
    `/orders`,
  ];

  for (const endpoint of endpoints) {
    try {
      const result = await makeCitypakRequest("POST", endpoint, orderData);
      if (result.success && result.data) {
        return result;
      }
    } catch (err) {
      continue;
    }
  }

  return await makeCitypakRequest("POST", `/api/orders`, orderData);
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

  return await makeCitypakRequest("GET", `/api/orders/${orderId}`);
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

  return await makeCitypakRequest("GET", `/api/orders${queryString}`);
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
    const endpoint = `/api/orders/${orderId}/waybill?page_size=${pageSize}`;
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
  if (!trackingNumber || !trackingNumber.trim()) {
    return {
      success: false,
      message: "Tracking number is required",
    };
  }

  // Try public endpoint first (no auth)
  const publicEndpoints = [
    `/api/public/track/${trackingNumber.trim()}`,
    `/public/track/${trackingNumber.trim()}`,
    `/track/${trackingNumber.trim()}`,
  ];

  for (const endpoint of publicEndpoints) {
    try {
      const url = `${CITYPAK_CONFIG.baseUrl}${endpoint}`;
      const response = await axios({
        method: "GET",
        url: url,
        headers: {
          "Content-Type": "application/json",
        },
        timeout: CITYPAK_CONFIG.timeout,
      });

      if (response.data) {
        return {
          success: true,
          data: response.data,
          status: response.status,
        };
      }
    } catch (err) {
      // Try next endpoint
      continue;
    }
  }

  // If public endpoints fail, try authenticated endpoint
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
