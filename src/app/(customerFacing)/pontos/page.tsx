'use client';

import {
  CheckCircle,
  Gift,
  Loader,
  TicketCheck,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import WhatsappButton from '@/components/Whatsapp-button';
import { UserByDocumentResponse } from '../../../lib/interfaces';

export default function Pontos() {
  const [documento, setDocumento] = useState('');
  const [dados, setDados] = useState<UserByDocumentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setDados(null);

    try {
      const res = await fetch(
        `/api/users/${encodeURIComponent(
          documento.replace(/\./g, '').replace(/\-/g, '')
        )}`
      );
      if (res.status === 404) {
        setDados({
          id: '',
          name: '',
          document: '',
          createdAt: new Date(),
          points: 0,
          orders: [],
          redeems: [],
        });
        return;
      }
      if (!res.ok) {
        throw new Error('Documento não encontrado');
      }
      const data: UserByDocumentResponse = await res.json();
      setDados(data);
    } catch (err) {
      setError(
        'Documento não encontrado. Verifique o CPF/CNPJ e tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  function formatCpfCnpj(input: string) {
    let value = input.replace(/\D/g, '');

    if (value.length <= 11) {
      value = value
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      value = value
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }

    setDocumento(value);
  }

  return (
    <section className="min-h-screen bg-gray-100 py-10 flex justify-center flex-col items-center gap-10">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md h-full">
        <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
          Consulta de Pontos
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Consulte seu saldo de pontos e histórico de compras e resgates.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label className="text-sm text-center text-gray-600">
            Digite seu CPF ou CNPJ para consultar seu saldo de pontos e
            histórico.
          </label>
          <input
            type="text"
            placeholder="Digite seu CPF ou CNPJ"
            maxLength={18}
            value={documento}
            onChange={(e) => formatCpfCnpj(e.target.value)}
            className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            required
          />
          <button
            type="submit"
            className={`w-full px-4 py-3 rounded-lg text-white font-semibold text-lg transition-colors duration-300\n              ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800'}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader className="animate-spin mr-2" size={20} />{' '}
                Consultando...
              </span>
            ) : (
              'Consultar'
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center space-x-3">
            <XCircle size={20} />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {dados && (
          <div className="mt-8 text-left w-full space-y-6">
            <div className="bg-blue-50 p-5 rounded-lg flex items-center justify-between shadow-sm">
              <p className="text-xl font-bold text-blue-800">Pontos Atuais:</p>
              <p className="text-3xl font-extrabold text-blue-700">
                {Intl.NumberFormat('pt-BR', {
                  style: 'decimal',
                }).format(dados.points)}
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <TrendingUp size={24} className="mr-2 text-green-600" />{' '}
                Histórico de Pontos:
              </h3>
              <ul className="space-y-2">
                {dados.orders?.length > 0 ? (
                  dados.orders.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-center text-gray-700 bg-gray-50 p-3 rounded-md shadow-sm"
                    >
                      <div>
                        <CheckCircle
                          size={18}
                          className="text-green-500 mr-3 "
                        />
                      </div>
                      {Intl.NumberFormat('pt-BR', {
                        style: 'decimal',
                      }).format(item.points)}{' '}
                      pontos - Compra{' '}
                      {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                    </li>
                  ))
                ) : (
                  <li
                    key={1}
                    className="flex items-center text-gray-700 bg-gray-50 p-3 rounded-md shadow-sm"
                  >
                    Você ainda não realizou nenhuma compra.
                  </li>
                )}
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <Gift size={24} className="mr-2 text-blue-600" /> Histórico de
                Resgates:
              </h3>
              <ul className="space-y-2">
                {dados.redeems?.length > 0 ? (
                  dados.redeems.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-center text-gray-700 bg-gray-50 p-3 rounded-md shadow-sm"
                    >
                      <div>
                        <TicketCheck size={18} className="text-blue-500 mr-3" />
                      </div>
                      {Intl.NumberFormat('pt-BR', {
                        style: 'decimal',
                      }).format(item.points)}{' '}
                      pontos - Resgate{' '}
                      {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                    </li>
                  ))
                ) : (
                  <li
                    key={1}
                    className="flex items-center text-gray-700 bg-gray-50 p-3 rounded-md shadow-sm"
                  >
                    Você ainda não realizou nenhum resgate.
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
      <div className="text-center mt-16">
        <p className="text-lg text-gray-700 mb-4">
          Está com dúvidas sobre seus pontos?
        </p>
        <WhatsappButton text="Entre em contato" />
      </div>
    </section>
  );
}
