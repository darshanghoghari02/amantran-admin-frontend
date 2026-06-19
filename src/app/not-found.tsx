import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FFF0F2] flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-[22px] bg-[#FF3E5C] flex items-center justify-center shadow-lg">
          <Heart className="w-8 h-8 text-white fill-white" />
        </div>
        <h1 className="font-extrabold text-4xl text-[#1E1D1E]">404</h1>
        <p className="text-gray-500 font-semibold">Page not found.</p>
        <Link
          href="/"
          className="mt-2 px-6 py-2.5 bg-[#FF3E5C] text-white font-bold rounded-xl shadow hover:bg-[#E62E47] transition-all"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
