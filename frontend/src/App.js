import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,

} from 'react-router-dom';
import { isTokenExpired } from './config/jwtUtils';
import UserHeader from './views/User/Header/Header'
import UserHomePage from './views/User/Homepage/UserHomePage';
import AdminHeader from './views/Admin/Header/AdminHeader'
import AdminHomePage from './views/Admin/HomePage/AdminHomePage'
import PrivateRoute from './views/MiddleWare/PrivateRoute';
import PrivateRouteAdmin from './views/MiddleWare/PrivateRouteAdmin';
import LoginMiddleware from './views/MiddleWare/LoginMiddleware'
import { useEffect } from 'react';
//import Authentication from './views/Authentication/Authentication';
import Authentication from './views/User/Authentication/Authentication'
import ShoppingPage from './views/User/Shopping-page/ShoppingPage';
import Login from './views/Admin/Authentication/Login';

import './index.css'
import AdminProducts from './views/Admin/Products/AdminProducts';
import AddProduct from './views/Admin/AddNewProduct/AddProduct';


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
  useEffect(() => {
    const checkTokenExp = () => {
      const token = sessionStorage.getItem('accessToken')
      if (token && isTokenExpired(token)) {
        sessionStorage.removeItem('accessToken')
        window.location.href = '/authentication'
      }
    }
    const intervalId = setInterval(checkTokenExp, 1000);

    return () => clearInterval(intervalId);
  }, [])

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route element={<LoginMiddleware />}>
          <Route path="/authentication" element={<Authentication />}></Route>
        </Route>
        <Route path='/admin/auth'>
            <Route index element={<Login/>} />
          </Route>
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<UserLayout />}>
            <Route index element={<UserHomePage />} />
          </Route>
          <Route path="/shop" element={<UserLayout />}>
            <Route index element={<ShoppingPage />} />
          </Route>
        </Route>
        <Route element={<PrivateRouteAdmin />}>
          <Route path='/admin' element={<AdminHomePage />}>
            <Route path="products" element={<AdminProducts />} />
            <Route path="addProduct" element={<AddProduct />} />
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
