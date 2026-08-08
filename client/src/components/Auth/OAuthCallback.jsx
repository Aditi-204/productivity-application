import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const error = params.get('error');
    const accessToken = params.get('accessToken');
    const userJson = params.get('user');

    if (error) {
      navigate('/login?error=' + encodeURIComponent(error));
      return;
    }

    if (accessToken && userJson) {
      try {
        const user = JSON.parse(decodeURIComponent(userJson));
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        useAuthStore.setState({ user, token: accessToken, isAuthenticated: true });
        navigate('/dashboard', { replace: true });
        return;
      } catch (e) {
        navigate('/login?error=' + encodeURIComponent('Failed to process login'));
        return;
      }
    }

    navigate('/login');
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-[#C4B5FD] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Completing authentication...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
