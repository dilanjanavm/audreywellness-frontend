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

// Environment Configuration
const CITYPAK_CONFIG = {
  accountNumber: "7259",
  username: "rumesh_2@audreycare.co",
  password: "ACse@#19746",
  apiToken: "135-8f2028d1-01a2-4970-a7f0-3cde42941fbd",
  // Environment URLs
  stagingUrl: "https://staging.citypak.lk",
  productionUrl: "https://falcon.citypak.lk",
  // Use production by default, can be changed via environment variable
  baseUrl: process.env.REACT_APP_CITYPAK_ENV === 'staging' 
    ? "https://staging.citypak.lk" 
    : "https://falcon.citypak.lk",
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
 * Uses the new Citypak API endpoint: customer_api/v1/track?tracking_number={tracking_number}
 * @param {String} trackingNumber - Tracking number (e.g., D00008977)
 * @returns {Promise}
 */
export const trackOrder = async (trackingNumber) => {
  if (!trackingNumber || !trackingNumber.trim()) {
    return {
      success: false,
      message: "Tracking number is required",
    };
  }

  // New API endpoint format: customer_api/v1/track?tracking_number={tracking_number}
  const endpoint = `/customer_api/v1/track?tracking_number=${encodeURIComponent(trackingNumber.trim())}`;
  
  const result = await makeCitypakRequest("GET", endpoint);
  
  // Transform response to match expected format
  if (result.success && result.data) {
    // Handle new API response format: { is_success: true, data: { tracking_number, reference, is_delivered, receiver_name } }
    if (result.data.is_success && result.data.data) {
      const apiData = result.data.data;
      return {
        success: true,
        data: {
          // Map to camelCase for consistency with frontend
          trackingNumber: apiData.tracking_number || apiData.trackingNumber,
          reference: apiData.reference || null,
          isDelivered: apiData.is_delivered || apiData.isDelivered || false,
          receiverName: apiData.receiver_name || apiData.receiverName || null,
          // Also include snake_case for backward compatibility
          tracking_number: apiData.tracking_number || apiData.trackingNumber,
          is_delivered: apiData.is_delivered || apiData.isDelivered || false,
          receiver_name: apiData.receiver_name || apiData.receiverName || null,
        },
        status: result.status,
      };
    }
    // If response is already in expected format, return as is
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
 * Uses the new Citypak API endpoint: customer_api/v1/track?tracking_number={tracking_number}
 * Note: This endpoint may still require authentication. If public access is needed,
 * the endpoint might be different or authentication might be optional.
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

  // Try public endpoint first (no auth headers)
  try {
    const endpoint = `/customer_api/v1/track?tracking_number=${encodeURIComponent(trackingNumber.trim())}`;
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
      // Handle new API response format: { success: true, message: "...", data: {...} }
      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data, // Return the data object directly for transformation
          message: response.data.message,
          status: response.status,
        };
      }
      
      // Handle API response format with is_success
      if (response.data.is_success && response.data.data) {
        const apiData = response.data.data;
        return {
          success: true,
          data: {
            // Map to camelCase for consistency with frontend
            trackingNumber: apiData.tracking_number || apiData.trackingNumber,
            reference: apiData.reference || null,
            isDelivered: apiData.is_delivered || apiData.isDelivered || false,
            receiverName: apiData.receiver_name || apiData.receiverName || null,
            // Also include snake_case for backward compatibility
            tracking_number: apiData.tracking_number || apiData.trackingNumber,
            is_delivered: apiData.is_delivered || apiData.isDelivered || false,
            receiver_name: apiData.receiver_name || apiData.receiverName || null,
          },
          status: response.status,
        };
      }
      
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    }
  } catch (err) {
    // If public endpoint fails, try authenticated endpoint
    console.log("Public tracking failed, trying authenticated endpoint...");
  }

  // Fallback to authenticated endpoint
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
