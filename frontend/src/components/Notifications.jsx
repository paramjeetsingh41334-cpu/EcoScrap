import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useLanguage } from "../i18n.jsx";


function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);

    const { t } = useLanguage();

    const loadNotifications = async () => {
        try {
            const data = await api("/notifications/mine");

            setNotifications(
                Array.isArray(data) ? data : []
            );
        } catch (error) {
            console.error(
                "Notification error:",
                error
            );
        }
    };

    const markAsRead = async (id) => {
        try {
            await api(
                `/notifications/${id}/read`,
                {
                    method: "PATCH"
                }
            );

            await loadNotifications();
        } catch (error) {
            console.error(
                "Mark notification read error:",
                error
            );
        }
    };

    const markAllAsRead = async () => {
        try {
            await api(
                "/notifications/read-all",
                {
                    method: "PATCH"
                }
            );

            await loadNotifications();
        } catch (error) {
            console.error(
                "Mark all notifications error:",
                error
            );
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const unreadCount = notifications.filter(
        (notification) => !notification.read
    ).length;

    const getNotificationDetails = (notification) => {
        const message = notification.message || "";

        if (
            message.includes(
                "accepted by a collector"
            )
        ) {
            return {
                icon: "✓",
                type: "accepted",
                title: t("pickupAccepted")
            };
        }

        if (
            message.includes(
                "collector is on the way"
            )
        ) {
            return {
                icon: "🚚",
                type: "onway",
                title: t("collectorOnWay")
            };
        }

        if (
            message.includes(
                "collector has arrived"
            )
        ) {
            return {
                icon: "📍",
                type: "arrived",
                title: t("collectorArrived")
            };
        }

        if (
            message.includes(
                "pickup has been cancelled"
            )
        ) {
            return {
                icon: "×",
                type: "cancelled",
                title: t("pickupCancelled")
            };
        }

        if (
            message.includes(
                "pickup has been completed"
            )
        ) {
            const weightMatch = message.match(
                /(\d+(?:\.\d+)?)\s*kg/
            );

            const weight = weightMatch
                ? weightMatch[1]
                : "";

            return {
                icon: "✓",
                type: "completed",
                title: `${t(
                    "pickupCompleted"
                )} ${weight} kg ${t(
                    "receiptReady"
                )}`
            };
        }

        return {
            icon: "🔔",
            type: "general",
            title: message
        };
    };

    return (
        <section className="notifications-card">

            {/* Header */}
            <div className="notifications-top">

                <div className="notifications-heading">

                    <div className="notifications-icon">
                        🔔
                    </div>

                    <div>
                        <h3>
                            {t("notifications")}
                        </h3>

                        <p>
                            {unreadCount > 0
                                ? `${unreadCount} ${t(
                                      "unreadNotifications"
                                  )}`
                                : t(
                                      "noNotifications"
                                  )}
                        </p>
                    </div>

                </div>

                <button
                    type="button"
                    className="notifications-toggle"
                    onClick={() =>
                        setOpen(!open)
                    }
                >
                    {open
                        ? t("hide")
                        : t("view")}

                    <span
                        className={
                            open
                                ? "arrow rotate"
                                : "arrow"
                        }
                    >
                        ↓
                    </span>
                </button>

            </div>

            {/* Unread badge */}
            {unreadCount > 0 && (
                <div className="notifications-summary">

                    <span className="unread-dot"></span>

                    <span>
                        {unreadCount}{" "}
                        {t(
                            "unreadNotifications"
                        )}
                    </span>

                    {open && (
                        <button
                            type="button"
                            className="mark-all-button"
                            onClick={
                                markAllAsRead
                            }
                        >
                            ✓{" "}
                            {t(
                                "markAllAsRead"
                            )}
                        </button>
                    )}

                </div>
            )}

            {/* Notification list */}
            {open && (
                <div className="notifications-content">

                    {notifications.length === 0 && (
                        <div className="notifications-empty">

                            <div className="empty-icon">
                                🔔
                            </div>

                            <h4>
                                {t(
                                    "noNotifications"
                                )}
                            </h4>

                            <p>
                                You’ll see your
                                pickup and account
                                updates here.
                            </p>

                        </div>
                    )}

                    {notifications.length > 0 && (
                        <div className="notifications-list">

                            {notifications.map(
                                (
                                    notification
                                ) => {
                                    const details =
                                        getNotificationDetails(
                                            notification
                                        );

                                    return (
                                        <div
                                            className={`notification-card ${
                                                notification.read
                                                    ? "notification-read"
                                                    : "notification-unread"
                                            }`}
                                            key={
                                                notification._id
                                            }
                                        >

                                            {/* Icon */}
                                            <div
                                                className={`notification-type-icon ${details.type}`}
                                            >
                                                {
                                                    details.icon
                                                }
                                            </div>

                                            {/* Content */}
                                            <div className="notification-body">

                                                <div className="notification-message">
                                                    {
                                                        details.title
                                                    }
                                                </div>

                                                <div className="notification-meta">

                                                    <span>
                                                        {new Date(
                                                            notification.createdAt
                                                        ).toLocaleString()}
                                                    </span>

                                                    {!notification.read && (
                                                        <span className="new-label">
                                                            NEW
                                                        </span>
                                                    )}

                                                </div>

                                            </div>

                                            {/* Mark read */}
                                            {!notification.read && (
                                                <button
                                                    type="button"
                                                    className="mark-read-button"
                                                    onClick={() =>
                                                        markAsRead(
                                                            notification._id
                                                        )
                                                    }
                                                    title={t(
                                                        "markRead"
                                                    )}
                                                >
                                                    ✓
                                                </button>
                                            )}

                                        </div>
                                    );
                                }
                            )}

                        </div>
                    )}

                </div>
            )}

        </section>
    );
}

export default Notifications;