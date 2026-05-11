import React,{useState} from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'
import LoadingScreen from '../../../components/LoadingScreen'

const Login = () => {

    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        const success = await handleLogin({ email, password })
        if (success) {
            navigate('/')
        }
    }

    if (loading) {
        return (
            <LoadingScreen
                title="Signing you in"
                message="Opening your interview workspace."
                label="Login"
            />
        )
    }


    return (
        <main className='auth-page'>
            <header className='auth-navbar'>
                <div className="navbar__container">
                <h1 className="navbar__brand">
                    Interview AI
                </h1>
                </div>
            </header>

            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>Welcome back</h1>
                        <p className='auth-subtitle'>Sign in to your interview workspace</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                onChange={(e) => { setEmail(e.target.value) }}
                                type="email" id="email" name='email' placeholder='you@example.com' required />
                        </div>
                        <div className="input-group">
                            <label htmlFor="password">Password</label>
                            <input
                                onChange={(e) => { setPassword(e.target.value) }}
                                type="password" id="password" name='password' placeholder='••••••••' required />
                        </div>
                        <button type='submit' className='button primary-button auth-button' >Sign In</button>
                    </form>

                    <div className='auth-footer'>
                        <p>Don't have an account? <Link to="/register" >Create one</Link></p>
                    </div>
                </div>
            </div>
            
            <div className="auth-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
            </div>
        </main>
    )
}

export default Login