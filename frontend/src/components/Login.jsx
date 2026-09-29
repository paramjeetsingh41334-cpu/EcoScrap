import { useState } from "react";
import { api } from "../api.js";

function Login({ onAuth }) {
    const [mode, setMode] = useState("login");

    const [form, setForm] = useState({
        name: "",
        phone: "",
        password: "",
        role: "USER"
    });

    const submit = async (e) => {
        e.preventDefault();

        try {
            const data = await api(`/auth/${mode}`, {
                method: "POST",
                body: JSON.stringify(form)
            });

            localStorage.setItem("token", data.token);
            onAuth(data.user);
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-card">

                {/* Brand */}
                <div className="auth-brand">

                    <div className="auth-logo">
                        ♻️
                    </div>

                    <div>
                        <h1>EcoScrap</h1>
                        <p>Digital waste marketplace</p>
                    </div>

                </div>

                {/* Heading */}
                <div className="auth-heading">

                    <span>
                        {mode === "login"
                            ? "WELCOME BACK"
                            : "GET STARTED"}
                    </span>

                    <h2>
                        {mode === "login"
                            ? "Sign in to your account"
                            : "Create your account"}
                    </h2>

                    <p>
                        {mode === "login"
                            ? "Access your EcoScrap dashboard and manage your recycling activity."
                            : "Join EcoScrap and become part of the digital recycling marketplace."}
                    </p>

                </div>

                {/* Form */}
                <form
                    className="auth-form"
                    onSubmit={submit}
                >

                    {mode === "register" && (
                        <div className="auth-field">

                            <label>
                                Full Name
                            </label>

                            <div className="auth-input-wrap">

                                <span>👤</span>

                                <input
                                    placeholder="Enter your name"
                                    required
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            name: e.target.value
                                        })
                                    }
                                />

                            </div>

                        </div>
                    )}

                    <div className="auth-field">

                        <label>
                            Phone Number
                        </label>

                        <div className="auth-input-wrap">

                            <span>📱</span>

                            <input
                                placeholder="Enter your phone number"
                                required
                                value={form.phone}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        phone: e.target.value
                                    })
                                }
                            />

                        </div>

                    </div>

                    <div className="auth-field">

                        <label>
                            Password
                        </label>

                        <div className="auth-input-wrap">

                            <span>🔒</span>

                            <input
                                placeholder="Enter your password"
                                type="password"
                                required
                                value={form.password}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        password: e.target.value
                                    })
                                }
                            />

                        </div>

                    </div>

                    {mode === "register" && (
                        <div className="auth-field">

                            <label>
                                Account Type
                            </label>

                            <div className="auth-input-wrap">

                                <span>🏷️</span>

                                <select
                                    value={form.role}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            role: e.target.value
                                        })
                                    }
                                >
                                    <option value="USER">
                                        USER
                                    </option>

                                    <option value="COLLECTOR">
                                        COLLECTOR
                                    </option>

                                    <option value="RECYCLER">
                                        RECYCLER
                                    </option>

                                    <option value="ORGANIZATION">
                                        ORGANIZATION
                                    </option>
                                </select>

                            </div>

                        </div>
                    )}

                    <button
                        type="submit"
                        className="auth-submit"
                    >
                        {mode === "login"
                            ? "Login to EcoScrap"
                            : "Create Account"}

                        <span>→</span>
                    </button>

                </form>

                {/* Switch */}
                <div className="auth-switch">

                    <span>
                        {mode === "login"
                            ? "New to EcoScrap?"
                            : "Already have an account?"}
                    </span>

                    <button
                        type="button"
                        className="auth-switch-button"
                        onClick={() =>
                            setMode(
                                mode === "login"
                                    ? "register"
                                    : "login"
                            )
                        }
                    >
                        {mode === "login"
                            ? "Create account"
                            : "Login instead"}
                    </button>

                </div>

                {/* Footer */}
                <div className="auth-footer">
                    ♻️ Sustainable recycling powered by EcoScrap
                </div>

            </div>

        </div>
    );
}

export default Login;