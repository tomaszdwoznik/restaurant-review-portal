import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
                <p className="text-sm font-medium text-stone-500">Weryfikacja uprawnień...</p>
            </div>
        );
    }
    
    if (!user) return <Navigate to="/login" replace />;
    return <>{children}</>;
}