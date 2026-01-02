'use client';

import { Pagination } from '@/components/Pagination';
import { UserByDocumentResponse } from '@/lib/interfaces';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { formatDocument } from '@/lib/formatters';

function formatDate(dateStr: string | Date) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR');
}

export default function UserPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const id = params?.id as string;

  const [user, setUser] = useState<UserByDocumentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPagination, setLoadingPagination] = useState(false);
  const [orderPage, setOrderPage] = useState<number>(
    Number(searchParams.get('orderPage')) || 1
  );
  const [redeemPage, setRedeemPage] = useState<number>(
    Number(searchParams.get('redeemPage')) || 1
  );

  // For pagination controls
  const [hasMoreOrders, setHasMoreOrders] = useState(false);
  const [hasMoreRedeems, setHasMoreRedeems] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchUser = async () => {
      const url = `/api/user/${id}`;
      const res = await fetch(url);
      if (!res.ok) {
        setUser(null);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setUser(data);
      setHasMoreOrders(Array.isArray(data.orders) && data.orders.length === 10);
      setHasMoreRedeems(
        Array.isArray(data.redeems) && data.redeems.length === 10
      );
      setLoading(false);
    };
    fetchUser();
  }, [id]);

  useEffect(() => {
    setLoadingPagination(true);
    const fetchUser = async () => {
      const url = `/api/user/${id}?orderPage=${orderPage}&redeemPage=${redeemPage}`;
      const res = await fetch(url);
      if (!res.ok) {
        setLoadingPagination(false);
        return;
      }
      const data = await res.json();
      setUser(data);
      setHasMoreOrders(Array.isArray(data.orders) && data.orders.length === 10);
      setHasMoreRedeems(
        Array.isArray(data.redeems) && data.redeems.length === 10
      );
      setLoadingPagination(false);
    };
    fetchUser();
  }, [orderPage, redeemPage]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <div>Usuário não encontrado.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Usuário: {user.name}</h1>
      <div className="mb-4">
        <div>
          <strong>Documento:</strong> {formatDocument(user.document)}
        </div>
        <div>
          <strong>Criado em:</strong> {formatDate(user.createdAt)}
        </div>
        <div>
          <strong>Saldo de pontos:</strong> {user.points}
        </div>
      </div>

      {loadingPagination ? (
        <div>Carregando...</div>
      ) : (
        <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
          <section className="mb-6 flex-1 min-w-0">
            <h2 className="text-xl font-semibold mb-2">Pedidos</h2>
            {user.orders.length === 0 ? (
              <div>
                Nenhum pedido encontrado.
                <Pagination
                  page={orderPage}
                  hasMore={hasMoreOrders}
                  setPage={setOrderPage}
                />
              </div>
            ) : (
              <div>
                <ul className="mb-2">
                  {user.orders.map((order, idx) => (
                    <li
                      key={idx}
                      className={`border-b py-2 flex justify-between ${order.expiredAt ? 'bg-gray-100 opacity-70' : ''}`}
                    >
                      <span>
                        Pontos:{' '}
                        <span className="font-bold text-green-500 whitespace-nowrap">
                          + {order.points}
                        </span>
                      </span>
                      {order.expiredAt && (
                        <span className="text-red-600 italic ">
                          ({formatDate(order.expiredAt)})
                        </span>
                      )}
                      <span>{formatDate(order.createdAt)}</span>
                    </li>
                  ))}
                </ul>
                <Pagination
                  page={orderPage}
                  hasMore={hasMoreOrders}
                  setPage={setOrderPage}
                />
              </div>
            )}
          </section>

          <section className="mb-6 flex-1 min-w-0">
            <h2 className="text-xl font-semibold mb-2">Resgates</h2>
            {user.redeems.length === 0 ? (
              <div>
                <span className="text-center">Nenhum resgate encontrado.</span>
                <Pagination
                  page={redeemPage}
                  hasMore={hasMoreRedeems}
                  setPage={setRedeemPage}
                />
              </div>
            ) : (
              <div>
                <ul className="mb-2">
                  {user.redeems.map((redeem, idx) => (
                    <li
                      key={idx}
                      className={`border-b py-2 flex flex-col sm:flex-row sm:justify-between ${redeem.expiredAt ? 'bg-gray-100 opacity-70' : ''}`}
                    >
                      <span>
                        {redeem.product?.name}, Pontos:{' '}
                        <span className="font-bold text-red-500 whitespace-nowrap">
                          - {redeem.points}
                        </span>
                      </span>
                      {redeem.expiredAt && (
                        <span className="text-red-600 italic">
                          ({formatDate(redeem.expiredAt)})
                        </span>
                      )}
                      <span>{formatDate(redeem.createdAt)}</span>
                    </li>
                  ))}
                </ul>
                <Pagination
                  page={redeemPage}
                  hasMore={hasMoreRedeems}
                  setPage={setRedeemPage}
                />
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
