"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NoAccess() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const redirect = setTimeout(() => {
      router.push("/login");
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-6">
      <div className="bg-white shadow-xl rounded-xl p-8 border max-w-md">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-red-600 mb-2">
          Acceso denegado
        </h1>
        <p className="text-gray-700 mb-4">
          No tenés permisos para ver esta información.
        </p>
        <p className="text-sm text-gray-500">
          Serás redirigido en <span className="font-semibold">{countdown}</span>{" "}
          segundos...
        </p>
      </div>
    </div>
  );
}
