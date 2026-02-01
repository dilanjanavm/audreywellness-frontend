import ApiService from "./apiService";

/**
 * Send SMS to a customer
 * @param {Object} smsData - SMS data:
 *   - phoneNumber (string, required): Customer phone number
 *   - message (string, required): SMS message content
 *   - taskId (string, optional): Related task ID for tracking
 *   - customerId (string, optional): Customer ID for tracking
 * @returns {Promise} API response
 */
export async function sendSMS(smsData) {
    const apiObject = {};
    apiObject.method = "POST";
    apiObject.authentication = true;
    apiObject.endpoint = "sms/send";
    apiObject.body = smsData;
    return await ApiService.callApi(apiObject);
}

/**
 * Send task status update SMS to customer
 * @param {Object} params - Parameters:
 *   - taskId (string, required): Task ID
 *   - phoneNumber (string, required): Customer phone number
 *   - taskName (string, required): Task name
 *   - status (string, required): New task status
 *   - orderNumber (string, optional): Order number
 *   - customerName (string, optional): Customer name
 * @returns {Promise} API response
 */
export async function sendTaskStatusUpdateSMS(params) {
    const { taskId, phoneNumber, taskName, status, orderNumber, customerName } = params;
    
    // Build SMS message
    const statusLabels = {
        'pending': 'Pending',
        'ongoing': 'In Progress',
        'review': 'Under Review',
        'completed': 'Completed',
        'failed': 'Failed'
    };
    
    const statusLabel = statusLabels[status] || status;
    let message = `Dear ${customerName || 'Customer'},`;
    message += `\n\nYour task "${taskName}" status has been updated to: ${statusLabel}`;
    
    if (orderNumber) {
        message += `\nOrder Number: ${orderNumber}`;
    }
    
    message += `\n\nThank you for your patience.`;
    
    return await sendSMS({
        phoneNumber,
        message,
        taskId,
        customerName
    });
}
