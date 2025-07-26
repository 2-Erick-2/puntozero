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

interface BuscarPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function BuscarPage({ searchParams }: BuscarPageProps) {
  const { q } = await searchParams;
  const termino = q || "";

  const supabase = createSupabaseBrowser();
  let articulos: any[] = [];

  if (termino.trim()) {
    // Búsqueda en título, categoría y contenido
    const { data, error } = await supabase
      .from('articulos')
      .select('*')
      .or(`titulo.ilike.%${termino}%,categoria.ilike.%${termino}%,contenido.ilike.%${termino}%`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      articulos = data;
    }
  }

  const articulosProcessed = articulos.map((articulo: Articulo) => ({
    ...articulo,
    imagen: processImageUrl(articulo.imagen)
  }));

  return (
    <main className="max-w-6xl mx-auto w-full py-8 px-4 bg-white">
      {/* Header de la página */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {termino ? `Resultados de búsqueda` : `Búsqueda de artículos`}
        </h1>
        {termino && (
          <p className="text-lg text-gray-600">
            {articulosProcessed.length === 0 
              ? `No se encontraron artículos para "${termino}"`
              : `${articulosProcessed.length} artículo${articulosProcessed.length !== 1 ? 's' : ''} encontrado${articulosProcessed.length !== 1 ? 's' : ''} para "${termino}"`
            }
          </p>
        )}
        {!termino && (
          <p className="text-lg text-gray-600">Ingresa un término para buscar artículos</p>
        )}
      </div>

      {/* Botón para volver a todos los artículos */}
      <div className="mb-8 text-center">
        <Link
          href="/articulos"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Ver todos los artículos
        </Link>
      </div>

      {/* Grid de artículos */}
      {termino && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {articulosProcessed.map((articulo) => (
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
      )}

      {/* Mensaje si no hay término de búsqueda */}
      {!termino && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-gray-500 text-lg">Usa el buscador en el header para encontrar artículos</p>
          </div>
        </div>
      )}

      {/* Mensaje si no hay resultados */}
      {termino && articulosProcessed.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
            </svg>
            <p className="text-gray-500 text-lg mb-4">No se encontraron artículos para "{termino}"</p>
            <p className="text-gray-400 text-sm">Intenta con otros términos o revisa la ortografía</p>
          </div>
        </div>
      )}
    </main>
  );
} 