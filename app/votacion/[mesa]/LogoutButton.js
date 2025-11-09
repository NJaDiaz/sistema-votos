"use client";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function LogoutButton({ username }) {
  const router = useRouter();

  const handleLogout = async () => {
    document.cookie = "mesa=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    const q = query(collection(db, "usuariosMesa"), where("username", "==", username));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const userRef = snapshot.docs[0].ref;
      await updateDoc(userRef, { activeSession: null });
    }

    router.push("/login");
  };

  return (
    <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
      Cerrar sesión
    </button>
  );
}
