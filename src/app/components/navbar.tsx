import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="shadow py-4">
      <div className="max-w-5xl mx-auto flex justify-center items-center space-x-6">
        <Link
          href="/"
          className="btn btn-outline btn-primary border-blue-500 transition duration-200 hover:scale-105 hover:shadow-lg">
          🏠 Home
        </Link>
      </div>
    </nav>
  );
}
