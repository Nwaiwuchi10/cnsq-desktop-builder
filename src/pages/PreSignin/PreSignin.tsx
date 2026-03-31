"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import imgLogo from "@/assests/images/CNSQ.png";

export default function PreSignin() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative">
      {/* Top Left Logo */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-10">
        <Image src={imgLogo} alt="CN Squad Logo" width={140} height={50} unoptimized />
      </div>

      {/* Center Content */}
      <div className="flex flex-col items-center text-center -mt-20">
        <Image src={imgLogo} alt="CN Squad Logo" width={140} height={50} className="mb-6" unoptimized />
        <h1 className="text-2xl sm:text-[28px] font-bold text-black mb-8">Sign in to access CN Squad</h1>
        <button
          onClick={() => router.push("/login")}
          className="bg-[#95D700] cursor-pointer hover:bg-[#86c200] text-white text-sm font-semibold tracking-wide py-3 px-10 rounded shadow-sm transition-colors uppercase"
        >
          Sign In
        </button>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 w-full border-t border-gray-100 py-6 text-center">
        <p className="text-gray-600 text-[13px] tracking-wide">&copy; 2025 CNSquad. All rights reserved.</p>
      </div>
    </div>
  );
}
