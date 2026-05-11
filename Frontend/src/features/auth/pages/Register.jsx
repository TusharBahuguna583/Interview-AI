import React,{useState} from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import "../auth.form.scss"
import LoadingScreen from '../../../components/LoadingScreen'

const Register = () => {

    const navigate = useNavigate()
    const [ username, setUsername ] = useState("")
    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")

    const {loading,handleRegister} = useAuth()
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        const success = await handleRegister({ username, email, password })
        if (success) {
            navigate("/")
        }
    }

    if (loading) {
        return (
            <LoadingScreen
                title="Creating your account"
                message="Setting up your interview workspace."
                label="Sign up"
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
                        <h1>Get started</h1>
                        <p className='auth-subtitle'>Create your interview workspace</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="username">Username</label>
                            <input
                                onChange={(e) => { setUsername(e.target.value) }}
                                type="text" id="username" name='username' placeholder='Enter username' required />
                        </div>
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

                        <button type='submit' className='button primary-button auth-button' >Create Account</button>
                    </form>

                    <div className='auth-footer'>
                        <p>Already have an account? <Link to="/login" >Sign in</Link></p>
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

export default Register