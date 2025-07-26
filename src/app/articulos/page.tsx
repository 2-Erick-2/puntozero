import React from "react";
import Image from "next/image";
import Link from "next/link";
import { createSupabaseBrowser } from "../supabaseClient";

// Tipos para los artículos
interface Articulo {
  id: string;
  titulo: string;
  slug: string;
  categoria: string;
  imagen: string;
  descripcion_corta: string;
  fecha: string;
  contenido: string;
  created_at: string;
  updated_at: string;
}

// Helper para procesar URLs de imágenes de Supabase Storage
function processImageUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith('http')) {
    return url;
  }
  if (url.startsWith('/storage/')) {
    return `https://${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '')}${url}`;
  }
  return url;
}

export default async function ArticulosPage() {
  const supabase = createSupabaseBrowser();
  const { data: articulos, error } = await supabase
    .from('articulos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <main className="max-w-6xl mx-auto w-full py-8 px-4 bg-white">
        <div className="text-center text-red-600">Error cargando artículos.</div>
      </main>
    );
  }

  const articulosProcessed = (articulos || []).map((articulo: Articulo) => ({
    ...articulo,
    imagen: processImageUrl(articulo.imagen)
  }));

  return (
    <main className="max-w-6xl mx-auto w-full py-8 px-4 bg-white">
      {/* Header de la página */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Artículos</h1>
        <p className="text-lg text-gray-600">Descubre todos nuestros artículos</p>
      </div>

      {/* Grid de artículos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {articulosProcessed.map((articulo: Articulo) => (
          <article key={articulo.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
            {/* Imagen del artículo */}
            <div className="relative h-48 overflow-hidden">
              <Image
                src={articulo.imagen}
                alt={articulo.titulo}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
              {/* Badge de categoría */}
              <div className="absolute top-3 left-3">
                <span className="bg-white/90 text-xs font-bold text-gray-700 px-2 py-1 rounded-full shadow">
                  {articulo.categoria}
                </span>
              </div>
            </div>

            {/* Contenido del artículo */}
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {articulo.titulo}
                  </h2>
              <p className="text-sm text-gray-500 mb-3">{articulo.fecha}</p>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {articulo.descripcion_corta}
              </p>
              
              {/* Botón Ver artículo */}
              <Link
                href={`/articulo/${articulo.slug}`}
                className="inline-block bg-blue-600 text-white font-semibold px-6 py-2 rounded-full hover:bg-blue-700 transition-colors duration-200"
              >
                Ver artículo
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Mensaje si no hay artículos */}
      {articulosProcessed.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No hay artículos disponibles.</p>
        </div>
      )}
    </main>
  );
} 