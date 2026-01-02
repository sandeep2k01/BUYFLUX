import emailjs from '@emailjs/browser';
import { EMAIL_CONFIG } from '../config/emailConfig';

export const notificationService = {
    // Send Email Notification (MODERN BUYFLUX ARCHIVE NOTIFIER)
    sendOrderEmail: async (userEmail: string, orderId: string, status: string, message: string) => {
        try {
            await emailjs.send(
                EMAIL_CONFIG.SERVICE_ID,
                EMAIL_CONFIG.TEMPLATE_ID,
                {
                    to_email: userEmail,
                    order_id: orderId.slice(-6).toUpperCase(),
                    status: status.toUpperCase(),
                    message: message,
                    project_name: 'BUYFLUX PREMIUM'
                },
                EMAIL_CONFIG.PUBLIC_KEY
            );
            console.log(`Email Synchronized for Order #${orderId.slice(-6)}`);
        } catch (error) {
            console.error("Email Sync Error:", error);
        }
    }
};
