'use client';
import Link from 'next/link';

export default function AdminPage() {
  async function handleResetPoints() {
    if (window.confirm('Tem certeza que deseja reiniciar todos os pontos?')) {
      fetch('/api/points/expire', {
        method: 'PATCH',
      })
        .then(async (res) => {
          if (res.ok) {
            alert('Pontos reiniciados com sucesso.');
          } else {
            alert('Erro ao reiniciar pontos.');
          }
        })
        .catch(() => {
          alert('Erro ao reiniciar pontos.');
        });
    }
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-10">
      <h1 className="text-3xl font-bold mb-8">Administração</h1>
      <nav className="flex flex-col gap-4 w-full max-w-xs">
        <Link
          href="/admin/compras"
          className="block px-6 py-3 rounded-lg bg-blue-600 text-white text-lg font-semibold text-center hover:bg-blue-700 transition"
        >
          Compras
        </Link>
        <Link
          href="/admin/produtos"
          className="block px-6 py-3 rounded-lg bg-green-600 text-white text-lg font-semibold text-center hover:bg-green-700 transition"
        >
          Produtos
        </Link>
        <Link
          href="/admin/resgates"
          className="block px-6 py-3 rounded-lg bg-purple-600 text-white text-lg font-semibold text-center hover:bg-purple-700 transition"
        >
          Resgates
        </Link>
        <Link
          href="/admin/usuarios"
          className="block px-6 py-3 rounded-lg bg-gray-700 text-white text-lg font-semibold text-center hover:bg-gray-800 transition"
        >
          Usuários
        </Link>
        <button
          onClick={handleResetPoints}
          className="block px-6 py-3 rounded-lg bg-red-500 text-white text-lg font-semibold text-center hover:bg-red-600 transition"
        >
          Reiniciar Pontos
        </button>
      </nav>
    </div>
  );
}
