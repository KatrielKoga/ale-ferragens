'use client';

import WhatsappButton from '@/components/Whatsapp-button';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ProductResponse } from '../../../lib/interfaces';

export default function Produtos() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Erro ao buscar produtos');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <section className="min-h-screen bg-gray-100 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-4">
            Programa de Pontos!
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            A cada um real gasto, você ganha 1 ponto! Troque seus pontos
            acumulados por produtos incríveis e de alta qualidade. Confira nossa
            seleção especial de produtos disponíveis para resgate!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="flex justify-center items-center h-full w-full col-span-3">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            products.map((reward) => (
              <div
                key={reward.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <Image
                  src={reward.image || '/default.svg'}
                  alt={reward.name}
                  width={400}
                  height={300}
                  className="w-full h-48 object-scale-down"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (
                      target.src !==
                      window.location.origin + '/default.svg'
                    ) {
                      target.src = '/default.svg';
                    }
                  }}
                />
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {reward.name}
                  </h3>
                  <p className="text-blue-600 text-lg font-semibold mb-4">
                    {Intl.NumberFormat('pt-BR', {
                      style: 'decimal',
                    }).format(reward.points)}{' '}
                    Pontos
                  </p>
                  <p className="text-gray-600 text-sm mb-4">
                    {reward.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="text-center mt-16">
          <p className="text-lg text-gray-700 mb-4">
            Não encontrou o que procurava ou tem dúvidas sobre seus pontos?
          </p>
          <WhatsappButton text="Entre em contato" />
        </div>
      </div>
    </section>
  );
}
