import { Link } from "react-router";

interface LandingPageProps {
  onSignIn: () => void;
}

export function LandingPage({ onSignIn }: LandingPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Mindset</h1>
        <p className="text-gray-600 mb-8">
          Turn your notes into productive study sessions
        </p>
        <div className="">
          <Link to="/preview" className="btn-secondary py-3">
            Try It Free
          </Link>
          <button onClick={onSignIn} className="btn">
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
