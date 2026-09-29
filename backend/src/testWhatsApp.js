import "dotenv/config";
import { sendNotification } from "./services/notification.service.js";

const result = await sendNotification({
    phone: "918950813601",
    message: "Test message from EcoScrap",
    channels: ["WHATSAPP"]
});

console.log("WhatsApp test result:", result);