import "dotenv/config";
import { sendNotification } from "./services/notification.service.js";

const result = await sendNotification({
    phone: "+91 9694158184",
    message: "Hello from EcoScrap! This is a test SMS.",
    channels: ["SMS"]
});

console.log("SMS test result:", result);