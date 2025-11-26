import { Link } from "react-router";

export function PreviewNav() {
  return (
    <nav className="bg-custom-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-primary-700">
            Mindset
          </Link>
          <Link to="/" className="text-sm text-neutral-600 hover:text-primary-600">
            Back to Home
          </Link>
        </div>
      </div>
    </nav>
  );
}
