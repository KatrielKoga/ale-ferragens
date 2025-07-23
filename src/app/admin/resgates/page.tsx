'use client';

import React, { useEffect, useState } from 'react';
import { formatPoints } from '../../../lib/formatters';

type UserOption = {
  id: string;
  name: string;
  document: string;
};

type ProductOption = {
  id: string;
  name: string;
};

type Redeem = {
  id: string;
  userId: string;
  productId: string;
  points: number;
  createdAt: string;
  user: {
    name: string;
  };
  product: {
    name: string;
  };
};

function formatDocument(document: string) {
  if (document.length === 11) {
    return document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3/$4');
}

function RedeemForm({
  onSubmit,
  loading,
}: {
  onSubmit: (redeem: { userId: string; productId: string }) => void;
  loading: boolean;
}) {
  const [userSearch, setUserSearch] = useState('');
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(
    null
  );
  const [errors, setErrors] = useState<string | null>(null);
  const [searchingUser, setSearchingUser] = useState(false);
  const [searchingProduct, setSearchingProduct] = useState(false);

  async function handleUserSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setUserSearch(e.target.value);
    setSelectedUser(null);
    if (e.target.value.length < 3) {
      setUserOptions([]);
      return;
    }
    setSearchingUser(true);
    const params = new URLSearchParams();
    params.set('search', e.target.value);
    params.set('limit', '5');
    const res = await fetch(`/api/users?${params.toString()}`);
    const data = await res.json();
    setUserOptions(data);
    setSearchingUser(false);
  }

  function handleUserSelect(user: UserOption) {
    setSelectedUser(user);
    setUserSearch(`${user.name} (${formatDocument(user.document)})`);
    setUserOptions([]);
  }

  async function handleProductSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setProductSearch(e.target.value);
    setSelectedProduct(null);
    if (e.target.value.length < 2) {
      setProductOptions([]);
      return;
    }
    setSearchingProduct(true);
    const params = new URLSearchParams();
    params.set('search', e.target.value);
    params.set('limit', '5');
    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    setProductOptions(data);
    setSearchingProduct(false);
  }

  function handleProductSelect(product: ProductOption) {
    setSelectedProduct(product);
    setProductSearch(product.name);
    setProductOptions([]);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedUser) {
      setErrors('Selecione um usuário.');
      return;
    }
    if (!selectedProduct) {
      setErrors('Selecione um produto.');
      return;
    }
    setErrors(null);
    onSubmit({ userId: selectedUser.id, productId: selectedProduct.id });
    setSelectedUser(null);
    setUserSearch('');
    setSelectedProduct(null);
    setProductSearch('');
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
        {searchingUser && (
          <div className="text-xs text-gray-500 mt-1">Buscando...</div>
        )}
      </div>
      <div className="mb-2 relative">
        <label className="block text-sm font-medium">Produto (nome)</label>
        <input
          type="text"
          value={productSearch}
          onChange={handleProductSearch}
          className="border px-2 py-1 rounded w-full"
          placeholder="Digite o nome do produto"
          required
        />
        {productOptions.length > 0 && (
          <ul className="absolute z-10 bg-white border rounded w-full mt-1 max-h-40 overflow-auto">
            {productOptions.map((product) => (
              <li
                key={product.id}
                className="px-2 py-1 hover:bg-blue-100 cursor-pointer"
                onClick={() => handleProductSelect(product)}
              >
                {product.name}
              </li>
            ))}
          </ul>
        )}
        {searchingProduct && (
          <div className="text-xs text-gray-500 mt-1">Buscando...</div>
        )}
      </div>
      {errors && <div className="text-red-600 text-sm mb-2">{errors}</div>}
      <button
        type="submit"
        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? 'Salvando...' : 'Adicionar Resgate'}
      </button>
    </form>
  );
}

export default function AdminResgatesPage() {
  const [redeems, setRedeems] = useState<Redeem[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  async function fetchRedeems() {
    setLoading(true);
    const res = await fetch('/api/redeems?limit=10');
    const data = await res.json();
    setRedeems(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchRedeems();
  }, []);

  async function handleCreateRedeem({
    userId,
    productId,
  }: {
    userId: string;
    productId: string;
  }) {
    setCreating(true);
    try {
      const res = await fetch('/api/redeems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId }),
      });
      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Erro ao adicionar resgate');
        setCreating(false);
        return;
      }
      fetchRedeems();
    } catch (err) {
      alert('Erro ao adicionar resgate');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Adicionar Resgate</h1>
      <RedeemForm onSubmit={handleCreateRedeem} loading={creating} />
      <div className="bg-white rounded shadow mt-6">
        <h2 className="text-lg font-semibold p-4 border-b">Últimos Resgates</h2>
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="p-2 border-b">Usuário</th>
              <th className="p-2 border-b">Produto</th>
              <th className="p-2 border-b">Pontos</th>
              <th className="p-2 border-b">Data</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-4 text-center">
                  Carregando...
                </td>
              </tr>
            ) : redeems.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center">
                  Nenhum resgate encontrado.
                </td>
              </tr>
            ) : (
              redeems.map((redeem) => (
                <tr key={redeem.id}>
                  <td className="p-2 border-b">{redeem.user?.name || '-'}</td>
                  <td className="p-2 border-b">
                    {redeem.product?.name || '-'}
                  </td>
                  <td className="p-2 border-b text-right">
                    {formatPoints(redeem.points)}
                  </td>
                  <td className="p-2 border-b text-center">
                    {new Date(redeem.createdAt).toLocaleDateString('pt-BR')}
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
