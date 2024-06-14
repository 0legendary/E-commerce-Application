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

const UserLayout= () => {
  return (
    <div>
      <UserHeader/>
      <Outlet />
    </div>
  );
};

function App() {

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route path="/" element={<UserLayout/>}>
          <Route index element={<UserHomePage/>} />
        </Route>
        <Route path="/authentication" element={<AuthenticationPage/>}></Route>
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
