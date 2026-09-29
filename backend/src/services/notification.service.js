export async function sendNotification({
    phone,
    message,
    channels = ["IN_APP"]
}) {
    const result = {
        phone,
        message,
        channels,
        sent: []
    };

    // WhatsApp
    if (channels.includes("WHATSAPP")) {
        if (
            process.env.WHATSAPP_ENABLED === "true" &&
            process.env.WHATSAPP_ACCESS_TOKEN &&
            process.env.WHATSAPP_PHONE_NUMBER_ID
        ) {
            try {
                const url = `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        messaging_product: "whatsapp",
                        to: phone,
                        type: "template",
                      template: {
    name: "pickup_status",
    language: {
        code: "en",
    },
    components: [
        {
            type: "body",
            parameters: [
                {
                    type: "text",
                    parameter_name: "status",
                    text: message
                }
            ]
        }
    ]
}
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    console.error("❌ WhatsApp API error:", data);
                } else {
                    console.log(`✅ WhatsApp sent to ${phone}`);
                    result.sent.push("WHATSAPP");
                }
            } catch (error) {
                console.error("❌ WhatsApp request failed:", error);
            }
        } else {
            console.log("📱 WhatsApp is not configured. Skipping.");
        }
    }

    // SMS
    // SMS
if (channels.includes("SMS")) {
    if (
        process.env.SMS_ENABLED === "true" &&
        process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_PHONE_NUMBER
    ) {
        try {
            const auth = Buffer.from(
                `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
            ).toString("base64");

            const body = new URLSearchParams({
                To: phone.startsWith("+") ? phone : `+${phone}`,
                From: process.env.TWILIO_PHONE_NUMBER,
                Body: message
            });

            const response = await fetch(
                `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Basic ${auth}`,
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error("❌ Twilio SMS error:", data);
            } else {
                console.log(`✅ SMS sent to ${phone}`);
                result.sent.push("SMS");
            }
        } catch (error) {
            console.error("❌ SMS request failed:", error);
        }
    } else {
        console.log("💬 SMS is not configured. Skipping.");
    }
}

    // In-app notification
    if (channels.includes("IN_APP")) {
        result.sent.push("IN_APP");
    }

    return result;
}