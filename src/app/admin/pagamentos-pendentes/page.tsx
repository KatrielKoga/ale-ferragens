'use client';

import { formatCurrency, formatDocument } from '@/lib/formatters';
import {
  PendingPaymentByUserResponse,
  PendingPaymentResponse,
} from '@/lib/interfaces/pending-payments';
import { EyeIcon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Pagination } from '../../../components/Pagination';

type UserOption = {
  id: string;
  name: string;
  document: string;
};

function PendingPaymentForm({
  onSubmit,
  loading,
}: {
  onSubmit: (payment: { userId: string; valueInCents: number }) => void;
  loading: boolean;
}) {
  const [userSearch, setUserSearch] = useState('');
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [value, setValue] = useState('');
  const [isPositive, setIsPositive] = useState(true);
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
    const parsedValue = Number(value);
    if (isNaN(parsedValue) || parsedValue <= 0) {
      setErrors('Informe um valor válido maior que zero.');
      return;
    }
    const valueInCents = isPositive ? parsedValue * 100 : -parsedValue * 100;
    setErrors(null);
    onSubmit({ userId: selectedUser.id, valueInCents });
    setValue('');
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
        <label className="block text-sm font-medium">Valor (R$)</label>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="border px-2 py-1 rounded w-full"
          min={0.01}
          step={0.01}
          required
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium">Tipo</label>
        <div className="flex gap-4">
          <label>
            <input
              type="radio"
              name="type"
              checked={isPositive}
              onChange={() => setIsPositive(true)}
              className="mr-2"
            />
            Adicionar saldo negativo (compra)
          </label>
          <label>
            <input
              type="radio"
              name="type"
              checked={!isPositive}
              onChange={() => setIsPositive(false)}
              className="mr-2"
            />
            Desconto (pagamento)
          </label>
        </div>
      </div>
      {errors && <div className="text-red-600 text-sm mb-2">{errors}</div>}
      <button
        type="submit"
        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? 'Salvando...' : 'Adicionar Pagamento Pendente'}
      </button>
    </form>
  );
}

export default function AdminPendingPaymentsPage() {
  const [summaries, setSummaries] = useState<PendingPaymentByUserResponse>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    name: string;
    document: string;
  } | null>(null);
  const [modalPayments, setModalPayments] = useState<PendingPaymentResponse[]>(
    []
  );
  const [modalLoading, setModalLoading] = useState(false);
  const [modalPage, setModalPage] = useState(1);
  const [modalHasMore, setModalHasMore] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalOpen &&
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setModalOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [modalOpen]);

  async function fetchSummaries() {
    setLoading(true);
    const params = new URLSearchParams();
    if (page > 1) params.set('page', page.toString());
    params.set('limit', '10');
    const res = await fetch(`/api/pending-payments?${params.toString()}`);
    const data: PendingPaymentByUserResponse = await res.json();
    setSummaries(data);
    setHasMore(data.length === 10);
    setLoading(false);
  }

  async function fetchUserPayments(document: string, pageNum: number = 1) {
    setModalLoading(true);
    const params = new URLSearchParams();
    params.set('document', document);
    params.set('page', pageNum.toString());
    params.set('limit', '10');
    const res = await fetch(`/api/pending-payments?${params.toString()}`);
    const data: PendingPaymentByUserResponse = await res.json();
    const first = data[0];
    setModalPayments(first.pendingPayments || []);
    setModalHasMore((first.pendingPayments || []).length === 10);
    setModalLoading(false);
  }

  useEffect(() => {
    fetchSummaries();
  }, [page]);

  async function handleCreatePayment({
    userId,
    valueInCents,
  }: {
    userId: string;
    valueInCents: number;
  }) {
    setCreating(true);
    try {
      const res = await fetch('/api/pending-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, valueInCents }),
      });
      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Erro ao adicionar pagamento pendente');
        setCreating(false);
        return;
      }
      fetchSummaries();
    } catch (err) {
      alert('Erro ao adicionar pagamento pendente');
    } finally {
      setCreating(false);
    }
  }

  function handleUserClick(user: { name: string; document: string }) {
    setSelectedUser(user);
    setModalOpen(true);
    setModalPage(1);
    fetchUserPayments(user.document, 1);
  }

  async function handleDeletePayment(id: string) {
    if (
      window.confirm('Tem certeza que deseja excluir este pagamento pendente?')
    ) {
      fetch(`/api/pending-payments/${id}`, {
        method: 'DELETE',
      })
        .then(async (res) => {
          if (res.ok) {
            if (selectedUser) {
              fetchUserPayments(selectedUser.document, modalPage);
            }
            fetchSummaries();
          } else {
            const error = await res.json();
            alert(error.error || 'Erro ao excluir pagamento pendente');
          }
        })
        .catch(() => {
          alert('Erro ao excluir pagamento pendente');
        });
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pagamentos Pendentes</h1>
      <PendingPaymentForm onSubmit={handleCreatePayment} loading={creating} />
      <div className="bg-white rounded shadow mt-6">
        <h2 className="text-lg font-semibold p-4 border-b">
          Usuários com Pagamentos Pendentes
        </h2>
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="p-2 border-b">Usuário</th>
              <th className="p-2 border-b">Saldo Total</th>
              <th className="p-2 border-b">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} className="p-4 text-center">
                  Carregando...
                </td>
              </tr>
            ) : summaries.length === 0 ? (
              <tr>
                <td colSpan={2} className="p-4 text-center">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            ) : (
              summaries.map((summary, index) => (
                <tr key={index} className=" hover:bg-gray-100">
                  <td className="p-2 border-b">
                    {summary.user.name} ({formatDocument(summary.user.document)}
                    )
                  </td>
                  <td className="p-2 border-b text-right text-nowrap">
                    {formatCurrency(summary.balanceInCents)}
                  </td>
                  <td className="p-2 border-b text-center">
                    <button
                      onClick={() => handleUserClick(summary.user)}
                      className="bg-blue-600 cursor-pointer text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination page={page} hasMore={hasMore} setPage={setPage} />
      </div>

      {modalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white rounded shadow max-w-2xl w-full max-h-max overflow-auto"
          >
            <div className="p-4 border-b flex justify-between">
              <h3 className="text-lg font-semibold">
                Pagamentos Pendentes de {selectedUser.name} (
                {formatDocument(selectedUser.document)})
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-500 border border-gray-500 px-2 py-1 rounded hover:bg-gray-100"
              >
                X
              </button>
            </div>
            <div className="p-4">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="p-2 border-b">Valor</th>
                    <th className="p-2 border-b">Data</th>
                    <th className="p-2 border-b">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {modalLoading ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-center">
                        Carregando...
                      </td>
                    </tr>
                  ) : modalPayments?.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-center">
                        Nenhum pagamento encontrado.
                      </td>
                    </tr>
                  ) : (
                    modalPayments?.map((payment) => (
                      <tr key={payment.id}>
                        <td className="p-2 border-b text-right">
                          {formatCurrency(payment.valueInCents)}
                        </td>
                        <td className="p-2 border-b text-center">
                          {new Date(payment.createdAt).toLocaleDateString(
                            'pt-BR'
                          )}
                        </td>
                        <td className="p-2 border-b text-center">
                          <button
                            className="text-red-600 hover:underline"
                            onClick={() => handleDeletePayment(payment.id)}
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <Pagination
                page={modalPage}
                hasMore={modalHasMore}
                setPage={(fn) => {
                  const newPage = fn(modalPage);
                  setModalPage(newPage);
                  if (selectedUser)
                    fetchUserPayments(selectedUser.document, newPage);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
