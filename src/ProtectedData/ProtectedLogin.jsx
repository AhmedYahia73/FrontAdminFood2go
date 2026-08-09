import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Context/Auth';

const ProtectedLogin = () => {
       const auth = useAuth();
       const navigate = useNavigate();
       const location = useLocation();

       useEffect(() => {
              const currentPath = location.pathname.split('?')[0];
              // const isAuthRoute = currentPath === '/' || currentPath === '/login' || currentPath === '/forget_password';
              const isAuthRoute = currentPath === '/' || currentPath === '/forget_password';

              if (auth?.userState && isAuthRoute) {
                     // If logged in and accessing public route, redirect based on role
                     const role = auth.userState?.role ? auth.userState?.role : localStorage.getItem("role");
                     if (role === 'branch') {
                            navigate('/branch', { replace: true });
                     } else {
                            navigate('/dashboard', { replace: true });
                     }
              } else if (!auth?.userState && !isAuthRoute) {
                     // If not logged in and accessing a protected route, redirect to login
                     // navigate('/login', { state: { from: location }, replace: true });
                     navigate('/', { state: { from: location }, replace: true });
              }
       }, [auth]);
       // }, [auth, location.pathname, navigate]);

       return <Outlet />;
};

export default ProtectedLogin;
