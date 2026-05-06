import {createBrowserRouter, RouterProvider} from "react-router-dom"
import {LandingPage} from "./pages/LandingPage";
import { AppLayout } from "./AppLayout";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Contact from "./pages/Contact";
import ErrorPage from "./pages/ErrorPage";
import { AuthProvider } from "./Auth/auth";
import Home from "./pages/Home";
import History from "./pages/History";
import Admin from "./pages/Admin";
import ResultPage from "./pages/ResultPage";


function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <LandingPage />,
      errorElement: <ErrorPage />,
    },
    {
      path: "/",
      element: <AppLayout/>,
      errorElement: <ErrorPage />,
      children: [
        {
          path: '/home',
          element: <Home />
        },
        {
          path: '/detect',
          element: <Home />
        },
        {
          path: '/result',
          element: <ResultPage />
        },
        {
          path: '/signup',
          element: <Signup />
        },
        {
          path: '/login',
          element: <Login />
        },
        {
          path: '/contact',
          element: <Contact />
        },
        {
          path: '/history',
          element: <History/>
        },
        {
          path: '/admin',
          element: <Admin/>
        },
      ]
    },
  ])
  

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;