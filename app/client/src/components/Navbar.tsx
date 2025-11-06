import { useAuth } from "react-oidc-context";
import { Link } from "react-router";

interface NavbarProps {
  showBackButton?: boolean;
}

export default function Navbar({ showBackButton = false }: NavbarProps) {
  const auth = useAuth();

  return (
    <nav className="bg-white shadow-sm border-primary-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                {/* ← Back */}
              </Link>
            )}
            <Link to="/" aria-label="Go to home" className="text-xl font-bold text-gray-900">
              Mindset
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {auth.user?.profile?.preferred_username ?? auth.user?.profile?.name}
            </span>
            <button
              onClick={() => auth.removeUser() || auth.signoutRedirect()}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
