import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DefaultLayout from './layout/DefaultLayout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import routes from './routes';

const App = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <Routes>
        <Route path="/auth/signin" element={<SignIn />} />
        <Route path="/auth/signup" element={<SignUp />} />

        <Route element={<DefaultLayout />}>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/users/list" replace />} />
            {routes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<route.component />}
              />
            ))}
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/auth/signin" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
