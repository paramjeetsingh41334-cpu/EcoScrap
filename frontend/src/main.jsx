import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";
import { LanguageProvider } from "./i18n.jsx";

createRoot(document.getElementById("root")).render(
    <LanguageProvider>
        <App />
    </LanguageProvider>
);


// PWA service worker should run only in production.
// During Vite development, unregister any old worker so it cannot
// cache stale React/JS files.
if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
        if (import.meta.env.PROD) {
            navigator.serviceWorker
                .register("/sw.js")
                .then(() => console.log("EcoScrap PWA service worker registered"))
                .catch((error) =>
                    console.error("Service worker registration failed:", error)
                );
        } else {
            try {
                const registrations =
                    await navigator.serviceWorker.getRegistrations();

                for (const registration of registrations) {
                    await registration.unregister();
                }

                const cacheNames = await caches.keys();

                for (const cacheName of cacheNames) {
                    if (cacheName.startsWith("ecoscrap-")) {
                        await caches.delete(cacheName);
                    }
                }

                console.log("EcoScrap: development service worker/cache cleared");
            } catch (error) {
                console.warn("Could not clear development PWA cache:", error);
            }
        }
    });
}
