"use client";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="relative flex flex-col items-center justify-center h-screen overflow-hidden">
      {/* 🎥 Video de fondo */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="/fond.mp4" type="video/mp4" />
        Tu navegador no soporta videos en HTML5.
      </video>

      {/* 🧡 Capa oscura para mejor contraste */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/40"></div>

      {/* 💬 Contenido principal */}
      <div className="relative z-10 text-center text-white">
        <h1 className="text-4xl font-bold mb-6">
          Bienvenido Potrero Activo 2025
        </h1>
        <button
          onClick={() => router.push("/login")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Inicia sesión para continuar
        </button>
      </div>
    </main>
  );
}
