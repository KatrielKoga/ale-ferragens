'use client';

import { orderCreateBody, OrderResponse } from '@/lib/interfaces/orders';
import React, { useEffect, useState } from 'react';
import { formatDocument, formatPoints } from '@/lib/formatters';

type UserOption = {
  id: string;
  name: string;
  document: string;
};

function PurchaseForm({
  onSubmit,
  loading,
}: {
  onSubmit: (purchase: { userId: string; points: number }) => void;
  loading: boolean;
}) {
  const [userSearch, setUserSearch] = useState('');
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [points, setPoints] = useState('');
  const [errors, setErrors] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  async function handleUserSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setUserSearch(e.target.value);
    setSelectedUser(null);
    if (e.target.value.length < 3) {
      setUserOptions([]);
      return;
    }
    setSearching(true);
    const params = new URLSearchParams();
    params.set('search', e.target.value);
    params.set('limit', '5');
    const res = await fetch(`/api/users?${params.toString()}`);
    const data = await res.json();
    setUserOptions(data);
    setSearching(false);
  }

  function handleUserSelect(user: UserOption) {
    setSelectedUser(user);
    setUserSearch(`${user.name} (${formatDocument(user.document)})`);
    setUserOptions([]);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedUser) {
      setErrors('Selecione um usuário.');
      return;
    }
    const parsed = orderCreateBody
      .pick({ points: true })
      .safeParse({ points: Number(points) });
    if (!parsed.success) {
      setErrors('Informe um valor de pontos válido.');
      return;
    }
    setErrors(null);
    onSubmit({ userId: selectedUser.id, points: Number(points) });
    setPoints('');
    setSelectedUser(null);
    setUserSearch('');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 p-4 border rounded bg-white shadow max-w-xl"
    >
      <div className="mb-2 relative">
        <label className="block text-sm font-medium">
          Usuário (nome ou documento)
        </label>
        <input
          type="text"
          value={userSearch}
          onChange={handleUserSearch}
          className="border px-2 py-1 rounded w-full"
          placeholder="Digite o nome ou documento"
          required
        />
        {userOptions.length > 0 && (
          <ul className="absolute z-10 bg-white border rounded w-full mt-1 max-h-40 overflow-auto">
            {userOptions.map((user) => (
              <li
                key={user.id}
                className="px-2 py-1 hover:bg-blue-100 cursor-pointer"
                onClick={() => handleUserSelect(user)}
              >
                {user.name} ({formatDocument(user.document)})
              </li>
            ))}
          </ul>
        )}
        {searching && (
          <div className="text-xs text-gray-500 mt-1">Buscando...</div>
        )}
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium">Pontos</label>
        <input
          type="number"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          className="border px-2 py-1 rounded w-full"
          min={1}
          required
        />
      </div>
      {errors && <div className="text-red-600 text-sm mb-2">{errors}</div>}
      <button
        type="submit"
        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? 'Salvando...' : 'Adicionar Compra'}
      </button>
    </form>
  );
}

export default function AdminPurchasesPage() {
  const [purchases, setPurchases] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  async function fetchPurchases() {
    setLoading(true);
    const res = await fetch('/api/orders?limit=10');
    const data = await res.json();
    setPurchases(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchPurchases();
  }, []);

  async function handleCreatePurchase({
    userId,
    points,
  }: {
    userId: string;
    points: number;
  }) {
    setCreating(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, points }),
      });
      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Erro ao adicionar compra');
        setCreating(false);
        return;
      }
      fetchPurchases();
    } catch (err) {
      alert('Erro ao adicionar compra');
    } finally {
      setCreating(false);
    }
  }

  async function handleDeletePurchase(id: string) {
    if (window.confirm('Tem certeza que deseja excluir esta compra?')) {
      fetch(`/api/orders/${id}`, {
        method: 'DELETE',
      })
        .then(async (res) => {
          if (res.ok) {
            fetchPurchases();
          } else {
            const error = await res.json();
            alert(error.error || 'Erro ao excluir compra');
          }
        })
        .catch(() => {
          alert('Erro ao excluir compra');
        });
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Adicionar Compra</h1>
      <PurchaseForm onSubmit={handleCreatePurchase} loading={creating} />
      <div className="bg-white rounded shadow mt-6">
        <h2 className="text-lg font-semibold p-4 border-b">Últimas Compras</h2>
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="p-2 border-b">Usuário</th>
              <th className="p-2 border-b">Pontos</th>
              <th className="p-2 border-b">Data</th>
              <th className="p-2 border-b">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-4 text-center">
                  Carregando...
                </td>
              </tr>
            ) : purchases.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center">
                  Nenhuma compra encontrada.
                </td>
              </tr>
            ) : (
              purchases.map((purchase) => (
                <tr key={purchase.id}>
                  <td className="p-2 border-b">{purchase.user?.name || '-'}</td>
                  <td className="p-2 border-b text-right">
                    {formatPoints(purchase.points)}
                  </td>
                  <td className="p-2 border-b text-center">
                    {new Date(purchase.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-2 border-b text-center">
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDeletePurchase(purchase.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
