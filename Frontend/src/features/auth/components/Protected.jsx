import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router";
import Navbar from "./Navbar";
import LoadingScreen from "../../../components/LoadingScreen";

const Protected = ({children}) => {
    const { loading,user } = useAuth()


    if(loading){
        return (
            <LoadingScreen
                title="Checking your session"
                message="Hang tight while we confirm your account."
                label="Authentication"
            />
        )
    }

    if(!user){
        return <Navigate to={'/login'} />
    }
    
    return (
        <>
            <Navbar />
            <div className="protected-shell">
                {children}
            </div>
        </>
    )
}

export default Protected
