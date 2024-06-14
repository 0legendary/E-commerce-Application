import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,

} from 'react-router-dom';
import UserHeader from './views/User/UserHeader';
import AuthenticationPage from './views/Authentication/Authentication';
import UserHomePage from './views/User/UserHomePage';
import AdminHeader from './views/Admin/AdminHeader'
import AdminHomePage from './views/Admin/AdminHomePage'
import PrivateRoute from './views/MiddleWare/PrivateRoute';


const UserLayout = () => {
  return (
    <div>
      <UserHeader />
      <Outlet />
    </div>
  );
};

const AdminLayout = () => {
  return (
    <div>
      <AdminHeader />
      <Outlet />
    </div>
  );
};

function App() {

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route path="/authentication" element={<AuthenticationPage />}></Route>

        <Route element={<PrivateRoute/>}>
          <Route path="/" element={<UserLayout />}>
            <Route index element={<UserHomePage />} />
          </Route>

          <Route path='/admin' element={<AdminLayout />}>
            <Route index element={<AdminHomePage />} />
          </Route>
        </Route>
      </Route>
    )
  );

  return (
    <div>
      <RouterProvider router={router}></RouterProvider>
    </div>
  );
}

export default App;
