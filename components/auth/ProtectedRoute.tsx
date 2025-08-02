
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles?: ('homeowner' | 'installer' | 'admin')[];
}


const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading, userType } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || (allowedRoles && !allowedRoles.includes(userType!))) {
        router.replace('/login');
      }
    }
  }, [user, loading, userType, allowedRoles, router]);

  if (loading) return <div>Loading...</div>;
  if (!user || (allowedRoles && !allowedRoles.includes(userType!))) {
    return null;
  }
  return children;
};

export default ProtectedRoute;