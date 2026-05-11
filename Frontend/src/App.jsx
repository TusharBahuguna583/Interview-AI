import { RouterProvider } from "react-router"
import { router } from "./app.routes.jsx"
import { AuthProvider } from "./features/auth/auth.context.jsx"
import { InterviewProvider } from "./features/interview/interview.context.jsx"
import { VapiProvider } from "./features/interview/vapi.context.jsx"

function App() {

  return (
    <AuthProvider>
      <VapiProvider>
        <InterviewProvider>
          <RouterProvider router={router} />
        </InterviewProvider>
      </VapiProvider>
    </AuthProvider>
  )
}

export default App
