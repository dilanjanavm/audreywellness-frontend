import ApiService from "./apiService";
import axios from "axios";
import apiConfig from "./apiConfig";
import Cookies from "js-cookie";
import * as constants from "../common/constants";
import * as citypakApi from "./citypakApiService";

/**
 * Create a new courier order
 * Uses Citypak API directly
 * @param {Object} orderData - Order data
 * @returns {Promise}
 */
export const createCourierOrder = async (orderData) => {
  try {
    // Use Citypak API directly
    const result = await citypakApi.createOrder(orderData);
    
    if (result.success && result.data) {
      return {
        success: true,
        data: result.data,
        message: "Order created successfully",
      };
    } else {
      return {
        success: false,
        message: result.message || "Failed to create order",
        data: null,
      };
    }
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      success: false,
      message: error.message || "Failed to create order",
      data: null,
    };
  }
};

/**
 * Track an order by tracking number
 * Uses Citypak API directly
 * @param {String} trackingNumber - Tracking number
 * @returns {Promise}
 */
export const trackOrder = async (trackingNumber) => {
  try {
    // Use Citypak API directly
    const result = await citypakApi.trackOrder(trackingNumber);
    
    if (result.success && result.data) {
      return {
        success: true,
        data: transformCitypakTrackingData(result.data),
        message: "Tracking data retrieved successfully",
      };
    } else {
      return {
        success: false,
        message: result.message || "Failed to track order",
        data: null,
      };
    }
  } catch (error) {
    console.error("Error tracking order:", error);
    return {
      success: false,
      message: error.message || "Failed to track order",
      data: null,
    };
  }
};

/**
 * Track an order by tracking number (Public - No authentication required)
 * Uses Citypak API directly
 * @param {String} trackingNumber - Tracking number
 * @returns {Promise}
 */
export const trackOrderPublic = async (trackingNumber) => {
  try {
    // Use Citypak API directly for public tracking
    const result = await citypakApi.trackOrderPublic(trackingNumber);
    
    // Transform Citypak response to match expected format
    if (result.success && result.data) {
      return {
        success: true,
        data: transformCitypakTrackingData(result.data),
        message: "Tracking data retrieved successfully",
      };
    } else {
      return {
        success: false,
        message: result.message || "Failed to track order",
        data: null,
      };
    }
  } catch (error) {
    console.error("Error tracking order:", error);
    return {
      success: false,
      message: error.message || "Failed to track order",
      data: null,
    };
  }
};

/**
 * Transform Citypak API response to match expected frontend format
 */
const transformCitypakTrackingData = (citypakData) => {
  // If data is already in expected format, return as is
  if (citypakData.trackingNumber || citypakData.tracking_number) {
    return {
      trackingNumber: citypakData.trackingNumber || citypakData.tracking_number,
      reference: citypakData.reference || citypakData.order_reference || null,
      isDelivered: citypakData.isDelivered || citypakData.is_delivered || citypakData.status === "DL" || citypakData.status_code === "DL",
      receiverName: citypakData.receiverName || citypakData.receiver_name || citypakData.recipient_name || null,
      podImageUrl: citypakData.podImageUrl || citypakData.pod_image_url || citypakData.proof_of_delivery || null,
      trackingHistory: transformTrackingHistory(citypakData.trackingHistory || citypakData.tracking_history || citypakData.history || []),
      status: citypakData.status || citypakData.status_code || "Unknown",
      statusType: citypakData.statusType || citypakData.status_type || citypakData.current_status || "Unknown",
    };
  }
  
  // If data structure is different, try to extract what we can
  return {
    trackingNumber: citypakData.tracking_number || citypakData.trackingNumber || "N/A",
    reference: citypakData.reference || citypakData.order_reference || null,
    isDelivered: citypakData.is_delivered || citypakData.isDelivered || false,
    receiverName: citypakData.receiver_name || citypakData.receiverName || null,
    podImageUrl: citypakData.pod_image_url || citypakData.podImageUrl || null,
    trackingHistory: transformTrackingHistory(citypakData.tracking_history || citypakData.trackingHistory || []),
    status: citypakData.status || "Unknown",
    statusType: citypakData.status_type || citypakData.statusType || "Unknown",
  };
};

/**
 * Transform tracking history array
 */
const transformTrackingHistory = (history) => {
  if (!Array.isArray(history)) {
    return [];
  }
  
  return history.map((item) => ({
    statusCode: item.statusCode || item.status_code || item.code || "UN",
    statusType: item.statusType || item.status_type || item.status || item.description || "Unknown",
    description: item.description || item.remarks || item.note || null,
    date: item.date || item.tracking_date || item.created_at || null,
    time: item.time || item.tracking_time || null,
    location: item.location || item.city || item.office || null,
    reason: item.reason || item.failure_reason || null,
  }));
};

/**
 * Get all courier orders
 * Uses Citypak API directly
 * @param {Object} filters - Optional filters
 * @returns {Promise}
 */
export const getAllCourierOrders = async (filters = {}) => {
  try {
    // Use Citypak API directly
    const result = await citypakApi.getAllOrders(filters);
    
    if (result.success && result.data) {
      return {
        success: true,
        data: Array.isArray(result.data) ? result.data : (result.data.orders || result.data.data || []),
        message: "Orders retrieved successfully",
      };
    } else {
      return {
        success: false,
        message: result.message || "Failed to retrieve orders",
        data: [],
      };
    }
  } catch (error) {
    console.error("Error retrieving orders:", error);
    return {
      success: false,
      message: error.message || "Failed to retrieve orders",
      data: [],
    };
  }
};

/**
 * Get courier order by ID
 * Uses Citypak API directly
 * @param {String} orderId - Order ID
 * @returns {Promise}
 */
export const getCourierOrderById = async (orderId) => {
  try {
    // Use Citypak API directly
    const result = await citypakApi.getOrderById(orderId);
    
    if (result.success && result.data) {
      return {
        success: true,
        data: result.data,
        message: "Order retrieved successfully",
      };
    } else {
      return {
        success: false,
        message: result.message || "Failed to retrieve order",
        data: null,
      };
    }
  } catch (error) {
    console.error("Error retrieving order:", error);
    return {
      success: false,
      message: error.message || "Failed to retrieve order",
      data: null,
    };
  }
};

/**
 * Helper function to download PDF blob
 */
const downloadPDF = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Print waybills by order ID
 * Uses Citypak API directly
 * Downloads PDF directly
 * @param {String} orderId - Citypak order ID
 * @param {String} pageSize - Page size (A4 or 4X6, default: A4)
 * @param {Number} perPageWaybillCount - Waybills per page (default: 4)
 * @returns {Promise}
 */
export const printWaybillsByOrderId = async (orderId, pageSize = "A4", perPageWaybillCount = 4) => {
  try {
    // Use Citypak API directly
    const result = await citypakApi.printWaybill(orderId, pageSize);
    
    if (result.success) {
      return { success: true, message: result.message || "Waybill downloaded successfully" };
    } else {
      throw new Error(result.message || "Failed to download waybill");
    }
  } catch (error) {
    console.error("Error downloading waybill:", error);
    throw error;
  }
};

/**
 * Print waybills by tracking numbers
 * Downloads PDF directly
 * @param {Array|String} trackingNumbers - Array of tracking numbers or comma-separated string
 * @param {String} pageSize - Page size (A4 or 4X6, default: A4)
 * @param {Number} perPageWaybillCount - Waybills per page (default: 4)
 * @returns {Promise}
 */
export const printWaybillsByTrackingNumbers = async (trackingNumbers, pageSize = "A4", perPageWaybillCount = 4) => {
  try {
    const access_token = Cookies.get(constants.ACCESS_TOKEN);
    const headers = {
      Authorization: `Bearer ${access_token}`,
    };

    // Handle both array and string formats
    let trackingParams = "";
    if (Array.isArray(trackingNumbers)) {
      trackingParams = trackingNumbers.map(tn => `tracking_numbers[]=${encodeURIComponent(tn)}`).join("&");
    } else {
      trackingParams = `tracking_numbers=${encodeURIComponent(trackingNumbers)}`;
    }

    const url = `${apiConfig.serverUrl}/courier/waybills?${trackingParams}&page_size=${pageSize}&per_page_waybill_count=${perPageWaybillCount}`;

    const response = await axios({
      method: "GET",
      url: url,
      headers: headers,
      responseType: "blob",
      timeout: 30000,
    });

    const blob = new Blob([response.data], { type: "application/pdf" });
    const filename = Array.isArray(trackingNumbers) 
      ? `waybills_${trackingNumbers.join("_")}.pdf`
      : `waybills_${trackingNumbers}.pdf`;
    downloadPDF(blob, filename);
    return { success: true, message: "Waybill downloaded successfully" };
  } catch (error) {
    console.error("Error downloading waybill:", error);
    throw error;
  }
};

