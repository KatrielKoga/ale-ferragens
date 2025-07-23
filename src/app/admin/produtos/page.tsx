'use client';

import {
  productCreateBody,
  ProductCreateBody,
  ProductResponse,
  ProductUpdateBody,
} from '@/lib/interfaces';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

// Form initial state
const initialForm: ProductCreateBody | ProductUpdateBody = {
  name: '',
  description: '',
  points: 0,
  image: new File([], ''),
};

function ProductForm({
  onSubmit,
  initialData,
  onCancel,
}: {
  onSubmit: (product: ProductCreateBody | ProductUpdateBody) => void;
  initialData?: ProductResponse;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ProductCreateBody | ProductUpdateBody>(
    () => {
      if (initialData) {
        return {
          ...initialData,
          image: undefined,
        };
      }
      return initialForm;
    }
  );
  const [errors, setErrors] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev: ProductCreateBody | ProductUpdateBody) => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value,
    }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = productCreateBody.safeParse(form);
    if (!parsed.success) {
      setErrors(JSON.stringify(parsed.error));
      return;
    }
    setErrors(null);
    onSubmit(form);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2 border p-4 rounded bg-gray-50"
    >
      <div>
        <label className="block text-sm font-medium">Nome</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Descrição</label>
        <input
          name="description"
          value={form.description || ''}
          onChange={handleChange}
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Pontos</label>
        <input
          name="points"
          type="number"
          value={form.points}
          onChange={handleChange}
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Imagem</label>
        <input
          name="image"
          type="file"
          accept="image/*"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files && e.target.files[0];
            setForm((prev: ProductCreateBody | ProductUpdateBody) => ({
              ...prev,
              image: file || prev.image,
            }));
          }}
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      {errors && <pre className="text-red-500 text-xs">{errors}</pre>}
      <div className="flex gap-2 mt-2">
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Salvar
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [editing, setEditing] = useState<ProductResponse | null>(null); // product or null
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch products
  async function fetchProducts() {
    setLoading(true);
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  // Create product
  async function handleCreate(product: ProductCreateBody) {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('points', product.points.toString());
      if (product.description) {
        formData.append('description', product.description);
      }
      if (product.image) {
        formData.append('image', product.image);
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || 'Erro ao criar produto');
        setLoading(false);
        return;
      }

      setCreating(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Erro ao criar produto');
    } finally {
      setLoading(false);
    }
  }

  // Update product
  async function handleUpdate(product: ProductUpdateBody) {
    setLoading(true);
    const formData = new FormData();
    if (product.name) {
      formData.append('name', product.name);
    }
    if (product.points) {
      formData.append('points', product.points.toString());
    }
    if (product.description) {
      formData.append('description', product.description);
    }
    if (product.image) {
      formData.append('image', product.image);
    }
    await fetch(`/api/products/${product.id}`, {
      method: 'PATCH',
      body: formData,
    });
    setEditing(null);
    fetchProducts();
    setLoading(false);
  }

  // Delete product
  async function handleDelete(id: string) {
    if (!window.confirm('Tem certeza que deseja deletar este produto?')) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('active', 'false');
    await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      body: formData,
    });
    fetchProducts();
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={() => setCreating(true)}
        >
          Novo Produto
        </button>
      </div>
      {creating && (
        <ProductForm
          onSubmit={(product) => handleCreate(product as ProductCreateBody)}
          onCancel={() => setCreating(false)}
        />
      )}
      {loading && <div>Carregando...</div>}
      <table className="w-full border mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Nome</th>
            <th className="border px-2 py-1">Descrição</th>
            <th className="border px-2 py-1">Pontos</th>
            <th className="border px-2 py-1">Imagem</th>
            <th className="border px-2 py-1">Ações</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-4">
                Nenhum produto encontrado.
              </td>
            </tr>
          )}
          {products.map((product) =>
            editing && editing.id === product.id ? (
              <tr key={product.id}>
                <td colSpan={5}>
                  <ProductForm
                    initialData={product}
                    onSubmit={handleUpdate}
                    onCancel={() => setEditing(null)}
                  />
                </td>
              </tr>
            ) : (
              <tr key={product.id}>
                <td className="border px-2 py-1">{product.name}</td>
                <td className="border px-2 py-1">{product.description}</td>
                <td className="border px-2 py-1">{Number(product.points)}</td>
                <td className="border px-2 py-1">
                  <Image
                    width={40}
                    height={30}
                    src={product.image}
                    alt={product.name}
                    className="w-10 h-10 object-cover"
                  />
                </td>
                <td className="border px-2 py-1 flex gap-2">
                  <button
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                    onClick={() => setEditing(product)}
                  >
                    Editar
                  </button>
                  <button
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    onClick={() => handleDelete(product.id)}
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
