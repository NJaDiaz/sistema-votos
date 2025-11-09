"use client";

export default function LogoutButton() {
  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <button onClick={logout} className="bg-red-500 text-white px-3 py-1 rounded">
      Logout
    </button>
  );
}
