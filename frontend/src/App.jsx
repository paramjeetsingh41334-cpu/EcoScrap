
import { useState } from "react";

import UserDashboard from "./pages/UserDashboard.jsx";
import CollectorDashboard from "./pages/CollectorDashboard.jsx";
import RecyclerDashboard from "./pages/RecyclerDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

import Login from "./components/Login.jsx";

import {
    LanguageProvider,
    useLanguage
} from "./i18n.jsx";

function LanguageSelector() {
    const { language, changeLanguage } = useLanguage();

    return (
        <div className="language-selector">
            <div className="language-selector-inner">
                <span className="language-selector-icon">🌐</span>

                <select
                    className="language-selector-select"
                    value={language}
                    onChange={(e) => changeLanguage(e.target.value)}
                    aria-label="Select language"
                >
                    <option value="en">🇬🇧 English</option>
                    <option value="hi">🇮🇳 हिन्दी</option>
                    <option value="mr">🇮🇳 मराठी</option>
                    <option value="hry">🟢 हरियाणवी</option>
                </select>
            </div>
        </div>
    );
}

function AppContent() {
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem("user");
            return storedUser ? JSON.parse(storedUser) : null;
        } catch {
            return null;
        }
    });

    const [showLogin, setShowLogin] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    const auth = (loggedInUser) => {
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        setShowLogin(false);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setPendingAction(null);
    };

    const requireAuth = (action) => {
        setPendingAction(action || null);
        setShowLogin(true);
    };

    return (
        <div className="ecoscrap-app">
            <div className="app-language-selector">
                <LanguageSelector />
            </div>

            {!user ? (
                <UserDashboard
                    user={null}
                    onRequireAuth={requireAuth}
                />
            ) : user.role === "ADMIN" ? (
                <AdminDashboard user={user} onLogout={logout} />
            ) : user.role === "COLLECTOR" ? (
                <CollectorDashboard user={user} onLogout={logout} />
            ) : user.role === "RECYCLER" ? (
                <RecyclerDashboard user={user} onLogout={logout} />
            ) : (
                <UserDashboard
                    user={user}
                    onLogout={logout}
                    pendingAction={pendingAction}
                    onPendingActionHandled={() => setPendingAction(null)}
                    onRequireAuth={requireAuth}
                />
            )}

            {showLogin && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 9999,
                        background: "rgba(0, 0, 0, 0.65)",
                        overflowY: "auto"
                    }}
                >
                    <Login
                        onAuth={auth}
                        onClose={() => {
                            setShowLogin(false);
                            setPendingAction(null);
                        }}
                    />
                </div>
            )}
        </div>
    );
}

function App() {
    return (
        <LanguageProvider>
            <AppContent />
        </LanguageProvider>
    );
}

export default App;
