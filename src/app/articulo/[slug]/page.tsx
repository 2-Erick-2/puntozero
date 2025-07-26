import React from "react";
import Image from "next/image";
import Link from "next/link";
import { createSupabaseBrowser } from "../../supabaseClient";
import { notFound } from "next/navigation";

// Tipos para el artículo
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

interface ArticuloPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ArticuloPage({ params }: ArticuloPageProps) {
  const { slug } = await params;
  const supabase = createSupabaseBrowser();
  const { data: articulos, error } = await supabase
    .from('articulos')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !articulos) {
    notFound();
  }

  const articulo: Articulo = {
    ...articulos,
    imagen: processImageUrl(articulos.imagen)
  };

  return (
    <main className="max-w-4xl mx-auto w-full py-8 px-4 bg-white">
      {/* Botón de regreso */}
      <div className="mb-8">
        <Link
          href="/articulos"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a Artículos
        </Link>
      </div>

      {/* Header del artículo */}
      <header className="mb-8">
        <div className="mb-4">
          <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
            {articulo.categoria}
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          {articulo.titulo}
        </h1>
        <p className="text-gray-600 text-lg mb-4">
          {articulo.descripcion_corta}
        </p>
        <div className="flex items-center text-gray-500 text-sm">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {articulo.fecha}
        </div>
      </header>

      {/* Imagen destacada */}
      <div className="relative h-96 md:h-[500px] mb-8 rounded-xl overflow-hidden">
        <Image
          src={articulo.imagen}
          alt={articulo.titulo}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Contenido del artículo */}
      <article className="prose prose-lg max-w-none">
        <div 
          className="text-gray-800 leading-relaxed text-lg"
          dangerouslySetInnerHTML={{ __html: articulo.contenido }}
        />
      </article>

      {/* Footer del artículo */}
      <footer className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-gray-600">
            <p className="text-sm">Artículo publicado el {articulo.fecha}</p>
          </div>
          <Link
            href="/articulos"
            className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
          >
            Ver más artículos
          </Link>
        </div>
      </footer>
    </main>
  );
} 