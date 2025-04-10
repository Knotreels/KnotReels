'use client';

import { useSearchParams } from "next/navigation";
import AuthForm from "@/components/AuthForm";

export default function LoginClient() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || null;

  return (
    <div className="min-h-screen bg-background text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-4xl font-bold text-white">Welcome Back 👋</h1>
        <p className="text-gray-400">
          Sign in to continue exploring cinematic content from the creative world.
        </p>
        <AuthForm type="login" redirectTo={redirectTo} />
      </div>
    </div>
  );
}
