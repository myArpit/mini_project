import { RouterProvider } from "react-router"
import { router } from "./app.routes.jsx"
import { AuthProvider } from "./features/auth/auth.context.jsx"
import { InterviewProvider } from "./features/interview/interview.context.jsx"
import { ThemeProvider } from "./features/theme/theme.provider.jsx"
import AppToaster from './features/theme/AppToaster.jsx'

function App() {

  return (
    <ThemeProvider>
      <AuthProvider>
        <AppToaster />
        <InterviewProvider>
          <RouterProvider router={router} />
        </InterviewProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
