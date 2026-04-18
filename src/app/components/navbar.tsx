"use client";
import Link from "next/link";

export default function Navbar() {
  const handleNav = (e: React.MouseEvent, path: string) => {
    if (window.location.protocol === 'file:') {
      e.preventDefault();
      window.location.href = path;
    }
  };

  return (
    <nav className="shadow py-4">
      <div className="max-w-5xl mx-auto flex justify-center items-center space-x-6">
        <Link href="./" onClick={(e) => handleNav(e, './index.html')} className="btn btn-primary">
          🏠 Home
        </Link>
        <Link href="./faq" onClick={(e) => handleNav(e, './faq.html')} className="btn btn-primary">
          faq
        </Link>
      </div>
    </nav>
  );
}
