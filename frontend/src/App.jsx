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


// =====================================
// LANGUAGE SELECTOR
// =====================================

function LanguageSelector() {
    const {
        language,
        changeLanguage
    } = useLanguage();

    return (
        <div className="language-selector">
            <div className="language-selector-inner">
                <span className="language-selector-icon">
                    🌐
                </span>

                <select
                    className="language-selector-select"
                    value={language}
                    onChange={(e) =>
                        changeLanguage(e.target.value)
                    }
                    aria-label="Select language"
                >
                    <option value="en">
                        🇬🇧 English
                    </option>

                    <option value="hi">
                        🇮🇳 हिन्दी
                    </option>

                    <option value="mr">
                        🇮🇳 मराठी
                    </option>
                </select>
            </div>
        </div>
    );
}


// =====================================
// APP CONTENT
// =====================================

function AppContent() {
    const [user, setUser] = useState(() => {
        try {
            const storedUser =
                localStorage.getItem("user");

            return storedUser
                ? JSON.parse(storedUser)
                : null;
        } catch {
            return null;
        }
    });


    // =====================================
    // LOGIN / REGISTER SUCCESS
    // =====================================

    const auth = (loggedInUser) => {
        localStorage.setItem(
            "user",
            JSON.stringify(loggedInUser)
        );

        setUser(loggedInUser);
    };


    // =====================================
    // LOGOUT
    // =====================================

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };


    // =====================================
    // RENDER
    // =====================================

    return (
        <div className="ecoscrap-app">
            <LanguageSelector />

            {!user ? (
                <Login
                    onAuth={auth}
                />
            ) : user.role === "ADMIN" ? (
                <AdminDashboard
                    user={user}
                    onLogout={logout}
                />
            ) : user.role === "COLLECTOR" ? (
                <CollectorDashboard
                    user={user}
                    onLogout={logout}
                />
            ) : user.role === "RECYCLER" ? (
                <RecyclerDashboard
                    user={user}
                    onLogout={logout}
                />
            ) : (
                <UserDashboard
                    user={user}
                    onLogout={logout}
                />
            )}
        </div>
    );
}


// =====================================
// ROOT APP
// =====================================

function App() {
    return (
        <LanguageProvider>
            <AppContent />
        </LanguageProvider>
    );
}


export default App;