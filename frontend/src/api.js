const API =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8000/api";

const DB_NAME = "ecoscrap-offline";
const DB_VERSION = 1;
const STORE_NAME = "requestQueue";


// ======================================================
// IndexedDB
// ======================================================

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(
            DB_NAME,
            DB_VERSION
        );

        request.onupgradeneeded = () => {
            const db = request.result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, {
                    keyPath: "id",
                    autoIncrement: true
                });
            }
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}


// ======================================================
// Add request to offline queue
// ======================================================

async function addToQueue(path, options) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            STORE_NAME,
            "readwrite"
        );

        const store = transaction.objectStore(
            STORE_NAME
        );

        const request = store.add({
            path,
            method: options.method || "GET",
            body: options.body || null,
            createdAt: Date.now()
        });

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}


// ======================================================
// Get queued requests
// ======================================================

async function getQueue() {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            STORE_NAME,
            "readonly"
        );

        const store = transaction.objectStore(
            STORE_NAME
        );

        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}


// ======================================================
// Delete queued request
// ======================================================

async function removeFromQueue(id) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            STORE_NAME,
            "readwrite"
        );

        const store = transaction.objectStore(
            STORE_NAME
        );

        const request = store.delete(id);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}


// ======================================================
// Send queued requests
// ======================================================

async function syncOfflineRequests() {
    if (!navigator.onLine) {
        return;
    }

    const queue = await getQueue();

    if (!queue.length) {
        return;
    }

    console.log(
        `EcoScrap: syncing ${queue.length} offline request(s)...`
    );

    for (const item of queue) {
        try {
            const token =
                localStorage.getItem("token");

            const response = await fetch(
                API + item.path,
                {
                    method: item.method,
                    headers: {
                        "Content-Type":
                            "application/json",

                        ...(token
                            ? {
                                  Authorization:
                                      `Bearer ${token}`
                              }
                            : {})
                    },

                    body: item.body
                }
            );

            // Only remove after successful
            // server response.
            if (response.ok) {
                await removeFromQueue(item.id);

                console.log(
                    "EcoScrap: offline request synced",
                    item.path
                );
            } else {
                // Don't delete failed requests.
                console.warn(
                    "EcoScrap: queued request failed",
                    item.path
                );
            }
        } catch (error) {
            // Internet may have disappeared again.
            console.warn(
                "EcoScrap: sync stopped",
                error
            );

            break;
        }
    }
}


// ======================================================
// Main API function
// ======================================================

export async function api(
    path,
    options = {}
) {
    const token =
        localStorage.getItem("token");

    const method =
        (options.method || "GET").toUpperCase();

    const headers = {
        "Content-Type": "application/json",

        ...(token
            ? {
                  Authorization:
                      `Bearer ${token}`
              }
            : {})
    };

    try {
        const res = await fetch(
            API + path,
            {
                ...options,
                method,
                headers
            }
        );

        const data =
            await res.json().catch(() => ({}));

        if (!res.ok) {
            throw new Error(
                data.message ||
                    "Request failed"
            );
        }

        return data;

    } catch (error) {

        // ------------------------------------------
        // Only queue write operations.
        // GET requests are never queued.
        // ------------------------------------------

        const isWriteRequest =
            ["POST", "PUT", "PATCH", "DELETE"]
                .includes(method);

        // Never queue authentication requests.
        const isAuthRequest =
            path.startsWith("/auth/");

        const networkOffline =
            !navigator.onLine ||
            error instanceof TypeError;

        if (
            isWriteRequest &&
            !isAuthRequest &&
            networkOffline
        ) {
            await addToQueue(
                path,
                {
                    method,
                    body:
                        options.body || null
                }
            );

            console.log(
                "EcoScrap: request saved for offline sync",
                path
            );

            throw new Error(
                "You are offline. Your action has been saved and will sync automatically when internet returns."
            );
        }

        throw error;
    }
}


// ======================================================
// Automatic synchronization
// ======================================================

window.addEventListener(
    "online",
    () => {
        console.log(
            "EcoScrap: internet restored"
        );

        syncOfflineRequests();
    }
);


// Try syncing when application starts
window.addEventListener(
    "load",
    () => {
        if (navigator.onLine) {
            syncOfflineRequests();
        }
    }
);


export { API };