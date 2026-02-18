'use client';

import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
    product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
    const mainImage = product.images[0]?.imageUrl || 'https://via.placeholder.com/400x600?text=No+Image';
    const price = product.variants[0]?.price || '0.00';

    return (
        <Link href={`/product/${product.id}`} className="group block">
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
                <img
                    src={mainImage}
                    alt={product.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-in-out"
                />
                {product.status === 'DRAFT' && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-2 py-1">DRAFT</div>
                )}
            </div>

            <h3 className="text-sm font-bold uppercase tracking-wide mb-1 group-hover:underline">{product.name}</h3>
            <p className="text-xs text-gray-500 mb-2">{product.gender} / {product.category}</p>
            <p className="font-mono text-sm">₹{price}</p>
        </Link>
    );
}
