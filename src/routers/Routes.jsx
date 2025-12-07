import { createBrowserRouter } from 'react-router-dom';
import Root from '../layout/Root';
import Error from '../components/error/Error';
import Dashboard from '../components/dashboard/Dashboard';
import Login from '../components/account/Login';
import Signup from '../components/account/Signup';
import PrivateRoute from './PrivateRoute';

const Routes = createBrowserRouter([
  {
    path: "/",
    element: <Root></Root>,
    errorElement: <Error></Error>,
    children: [
      {
        path: "/",
        element: (
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        ),
      },
      {
        path: "/dashboard",
        element: (
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: "login",
    element: <Login></Login>,
  },
  {
    path: "register",
    element: <Signup></Signup>,
  },
]);

export default Routes;