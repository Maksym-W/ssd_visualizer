import Link from "next/link";

export default function Faq() {
    return (
        <Link
          href="https://pages.cs.wisc.edu/~remzi/OSTEP/file-ssd.pdf"
          className="btn btn-outline btn-primary border-blue-500 transition duration-200 hover:scale-105 hover:shadow-lg">
          Based on this
        </Link>
    );
};