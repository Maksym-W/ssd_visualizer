import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="shadow py-4">
      <div className="max-w-5xl mx-auto flex justify-center items-center space-x-6">
        <Link
          href="/"
          className="btn btn-primary">
          🏠 Home
        </Link>
        <Link
          href="/faq"
          className="btn btn-primary">
          faq
        </Link>
      </div>
    </nav>
  );
}
