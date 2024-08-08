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
import AddProduct from './views/Admin/Products/AddNewProduct/AddProduct';
import EditProduct from './views/Admin/Products/EditProduct/EditProduct';
import ShowUser from './views/Admin/User/ShowUser';
import SingleProduct from './views/User/Shopping-page/SingleProduct';
import Category from './views/Admin/Category/Category';
import ProfileHome from './views/User/Profile/Home/ProfileHome';
import AccountSettings from './views/User/Profile/Account/AccountSettings';
import Address from './views/User/Profile/Address/Address';
import Cart from './views/User/Cart/Cart';
import Checkout from './views/User/CheckoutPage/Checkout';
import Order from './views/User/Orders-Page/Order';
import AdminOrders from './views/Admin/OrderPage/AdminOrders';
import Wallet from './views/User/Wallet/Wallet';
import PaymentPolicy from './views/User/Policies/PaymentPolicy';


const UserLayout = () => {
  return (
    <div>
      <UserHeader />
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
          <Route index element={<Login />} />
        </Route>
        <Route path="/" element={<UserLayout />}>
            <Route index element={<UserHomePage />} />
          </Route>
          <Route path="/shop" element={<UserLayout />}>
            <Route index element={<ShoppingPage />} />
            <Route path=":id" element={<SingleProduct />} />
          </Route>
        <Route element={<PrivateRoute />}>
          <Route path="/cart" element={<UserLayout />}>
            <Route index element={<Cart />} />
          </Route>
          <Route path="/checkout/:product_Id" element={<UserLayout />}>
            <Route index element={<Checkout />} />
          </Route>
          <Route path="/orders" element={<UserLayout />}>
            <Route index element={<Order />} />
          </Route>
          <Route path="/wallet" element={<UserLayout />}>
            <Route index element={<Wallet />} />
          </Route>
          <Route path="/payment/policy" element={<UserLayout />}>
            <Route index element={<PaymentPolicy />} />
          </Route>
          <Route path="/account" element={<UserLayout />}>
            <Route path="" element={<ProfileHome />}>
              <Route path="settings" element={<AccountSettings />} />
              <Route path="address" element={<Address />} />
            </Route>
          </Route>
        </Route>
        <Route element={<PrivateRouteAdmin />}>
          <Route path='/admin' element={<AdminHomePage />}>
            <Route path="products" element={<AdminProducts />} />
            <Route path="addProduct" element={<AddProduct />} />
            <Route path="editProduct/:id" element={<EditProduct />} />
            <Route path="users" element={<ShowUser />} />
            <Route path="category" element={<Category />} />
            <Route path="orders" element={<AdminOrders />} />
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

