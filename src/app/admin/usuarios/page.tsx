'use client';

import React, { useEffect, useState } from 'react';
import {
  userCreateBody,
  UserCreateBody,
  UserResponse,
} from '@/lib/interfaces/users';
import { formatPoints } from '../../../lib/formatters';

function UserForm({
  onSubmit,
  onCancel,
  loading,
}: {
  onSubmit: (user: UserCreateBody) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<UserCreateBody>({ name: '', document: '' });
  const [errors, setErrors] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    form.document = form.document.replace(/\D/g, '');
    const parsed = userCreateBody.safeParse(form);
    if (!parsed.success) {
      setErrors('Preencha todos os campos corretamente.');
      return;
    }
    setErrors(null);
    onSubmit(form);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 p-4 border rounded bg-white shadow"
    >
      <div className="mb-2">
        <label className="block text-sm font-medium">Nome</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="border px-2 py-1 rounded w-full"
          required
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium">Documento</label>
        <input
          type="text"
          name="document"
          value={form.document}
          onChange={handleChange}
          maxLength={18}
          className="border px-2 py-1 rounded w-full"
          required
        />
      </div>
      {errors && <div className="text-red-600 text-sm mb-2">{errors}</div>}
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
          disabled={loading}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);

  async function fetchUsers(searchValue = '') {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchValue) params.set('search', searchValue);
    const res = await fetch(`/api/users?${params.toString()}`);
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    fetchUsers(search);
  }

  async function handleCreate(user: UserCreateBody) {
    setCreating(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Erro ao criar usuário');
        setCreating(false);
        return;
      }
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      alert('Erro ao criar usuário');
    } finally {
      setCreating(false);
    }
  }

  function formatDocument(document: string) {
    if (document.length === 11) {
      return document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return document.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5'
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Usuários</h1>
      <form onSubmit={handleSearchSubmit} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Buscar por nome ou documento"
          value={search}
          onChange={handleSearchChange}
          className="border px-2 py-1 rounded flex-1"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Buscar
        </button>
        <button
          type="button"
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          onClick={() => setShowForm(true)}
        >
          Novo Usuário
        </button>
      </form>
      {showForm && (
        <UserForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          loading={creating}
        />
      )}
      <div className="bg-white rounded shadow">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="p-2 border-b">Nome</th>
              <th className="p-2 border-b">Documento</th>
              <th className="p-2 border-b">Pontos</th>
              <th className="p-2 border-b">Criado em</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="p-4 text-center">
                  Carregando...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-4 text-center">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="p-2 border-b">{user.name}</td>
                  <td className="p-2 border-b text-center">
                    {formatDocument(user.document)}
                  </td>
                  <td className="p-2 border-b text-right">
                    {formatPoints(user.points)}
                  </td>
                  <td className="p-2 border-b text-center">
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
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
