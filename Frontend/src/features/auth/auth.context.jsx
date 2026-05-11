import { createContext,useState } from "react";


export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState(null)

    const showToast = ({ message, type = "error", duration = 3600 }) => {
        setToast({ message, type })
        window.clearTimeout(showToast.timeout)
        showToast.timeout = window.setTimeout(() => setToast(null), duration)
    }

    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading, showToast }}>
            {children}
            {toast && (
                <div className={`toast ${toast.type}`} role="status" aria-live="polite">
                    {toast.message}
                </div>
            )}
        </AuthContext.Provider>
    )

    
}