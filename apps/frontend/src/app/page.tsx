'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Header from '@/components/Header';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data);
      } catch (error) {
        console.error('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-white text-black">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[70vh] bg-black flex items-center justify-center overflow-hidden">
        <h1 className="text-9xl font-black text-white italic tracking-tighter opacity-20 absolute select-none">
          DECK.
        </h1>
        <div className="z-10 text-center text-white">
          <h2 className="text-4xl font-serif italic mb-4">New Season Arrivals</h2>
          <button className="bg-white text-black px-8 py-3 font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
            Shop Now
          </button>
        </div>
      </section>

      {/* Product Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold uppercase tracking-widest">Trending Now</h2>
          <div className="flex space-x-4 text-sm text-gray-500">
            <button className="hover:text-black">All</button>
            <button className="hover:text-black">New</button>
            <button className="hover:text-black">Best Sellers</button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
