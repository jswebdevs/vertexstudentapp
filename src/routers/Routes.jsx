import { createBrowserRouter } from 'react-router-dom';
import Root from '../layout/Root';
import Error from '../components/error/Error';
import Dashboard from '../components/dashboard/Dashboard';
import Login from '../components/account/Login';
import Signup from '../components/account/Signup';
import PrivateRoute from './PrivateRoute';
import StudentProfile from '../components/account/StudentProfile';
import Courses from '../components/Courses/Courses';
import ViewCourse from '../components/Courses/ViewCourses';
import Cart from '../components/Courses/Cart';
import UpdateCourse from '../components/Courses/UpdateCourse';
import AddCourse from '../components/Courses/AddCourse';


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
        path: "account/:id",
        element: <StudentProfile />,
        loader: ({ params }) =>
          fetchJSON(
            `https://backend.vertexforbcs.org/api/users/${params.id}`
          ),
      },
      {
        path: "courses",
        element: <Courses></Courses>
      },
      {
        path: "view-course/:id",
        element: <ViewCourse></ViewCourse>
      },
      {
        path: "cart",
        element: <Cart></Cart>
      },
      {
        path: "update-course",
        element: <UpdateCourse></UpdateCourse>
      },
      {
        path: "add-course",
        element: <AddCourse></AddCourse>
      }
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