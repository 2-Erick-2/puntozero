export const dynamic = "force-dynamic";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import Slider from "./components/Slider";
import { createSupabaseBrowser } from "./supabaseClient";

const sliderData = [
  {
    image: "/slider1.jpg",
    category: "MODA",
    title: "Tendencias Primavera 2024",
  },
  {
    image: "/slider2.jpg",
    category: "DEPORTE",
    title: "El Futuro del Running Urbano",
  },
  {
    image: "/slider3.jpg",
    category: "CULTURA",
    title: "Arte Digital en Latinoamérica",
  },
];

// Tipos para los datos de Supabase
interface Articulo {
  id: string;
  titulo: string;
  slug: string;
  categoria: string;
  imagen: string;
  descripcion_corta: string;
  fecha: string;
  created_at: string;
  updated_at: string;
}

interface Bloque {
  id: string;
  nombre: string;
  tipo: string;
  posicion: number;
  articulo: Articulo[];
}

// Helper para procesar URLs de imágenes de Supabase Storage
function processImageUrl(url: string): string {
  if (!url) return "";
  // Si ya es una URL completa, devolverla tal como está
  if (url.startsWith('http')) {
    return url;
  }
  // Si es una URL relativa de Supabase Storage, convertirla a absoluta
  if (url.startsWith('/storage/')) {
    return `https://${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '')}${url}`;
  }
  return url;
}

export default async function Home() {
  // Fetch bloques_portada con join a articulos
  const supabase = createSupabaseBrowser();
  const { data, error } = await supabase
    .from("bloques_portada")
    .select(`
      id,
      nombre,
      tipo,
      posicion,
      articulo:articulos (
        id,
        titulo,
        slug,
        categoria,
        imagen,
        descripcion_corta,
        fecha,
        created_at,
        updated_at
      )
    `)
    .order("posicion", { ascending: true });

  // Después de la consulta:
  const bloques = (data ?? []).map((b: any) => ({
    ...b,
    articulo: Array.isArray(b.articulo) ? b.articulo[0] ?? null : b.articulo ?? null,
  }));

  // Procesar URLs de imágenes
  const bloquesProcessed = bloques.map((bloque: any) => ({
    ...bloque,
    articulo: bloque.articulo ? {
      ...bloque.articulo,
      imagen: processImageUrl(bloque.articulo.imagen)
    } : null
  }));

  if (error) {
    return <main className="max-w-6xl mx-auto w-full py-8 px-2 md:px-0 bg-white">Error cargando portada.</main>;
  }
  if (!bloquesProcessed || bloquesProcessed.length === 0) {
    return <main className="max-w-6xl mx-auto w-full py-8 px-2 md:px-0 bg-white">No hay bloques configurados.</main>;
  }

  // Helper para los bloques rojos sin botón
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const BloqueRojo = ({ articulo, onEdit }: { articulo: any, onEdit: () => void }) => {
    if (!articulo) return null;
    return (
      <div className="relative rounded-xl overflow-hidden shadow-md bg-red-600 flex flex-col items-center p-6 h-[240px] min-h-[80px] transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl">
        {/* <EditButton onClick={onEdit} bloque={0} /> */}
        <span className="absolute top-3 left-4 z-20 bg-white/80 text-xs font-bold text-red-700 px-3 py-1 rounded-full shadow">{articulo.fecha}</span>
        <div className="flex-1 flex flex-col justify-center items-center">
          <h3 className="text-white text-lg font-bold mt-8">{articulo.titulo}</h3>
        </div>
      </div>
    );
  };

  // Helper para los bloques horizontales
  const BloqueHorizontal1Real = ({ articulo, colorFondo = 'bg-yellow-200', invertirDesktop = false, onEdit }: { articulo: any, colorFondo?: string, invertirDesktop?: boolean, onEdit: () => void }) => {
    if (!articulo) return null;
    return (
      <div className={`flex flex-col sm:flex-row rounded-xl overflow-hidden shadow-md h-auto min-h-[180px] sm:min-h-[240px] transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl ${invertirDesktop ? 'sm:flex-row-reverse' : ''} sm:items-stretch`}>
        {/* <EditButton onClick={onEdit} bloque={0} /> */}
        <div className={`w-full sm:w-1/2 ${colorFondo} flex flex-col justify-between p-4 sm:p-6 relative min-h-[140px] sm:min-h-[120px] h-full`}>
          <span className={`absolute top-3 left-4 z-20 bg-white/80 text-xs font-bold ${colorFondo === 'bg-pink-200' ? 'text-pink-700' : 'text-yellow-700'} px-3 py-1 rounded-full shadow`}>{articulo.categoria}</span>
          <div className="flex-1 flex flex-col justify-center">
            <h2 className={`text-${colorFondo === 'bg-pink-200' ? 'pink' : 'yellow'}-900 text-xl sm:text-2xl font-bold mb-2 mt-8`}>{articulo.titulo}</h2>
            <span className={`block text-xs ${colorFondo === 'bg-pink-200' ? 'text-pink-800' : 'text-yellow-800'} font-semibold mb-1`}>{articulo.fecha}</span>
            <p className={`text-${colorFondo === 'bg-pink-200' ? 'pink' : 'yellow'}-900 text-base sm:text-lg mb-4 break-words`}>{articulo.descripcion_corta}</p>
          </div>
          <div className="flex justify-center sm:justify-start mt-4">
            <Link href={`/articulo/${articulo.slug}`} className="bg-white/90 text-black font-semibold px-6 py-2 rounded-full hover:bg-yellow-700 hover:text-white hover:shadow-lg transition">Leer más</Link>
          </div>
        </div>
        <div className="w-full sm:w-1/2 min-h-[160px] sm:min-h-[120px] relative flex flex-col justify-end h-full">
          <Image src={articulo.imagen} alt={articulo.titulo} fill className="object-cover w-full h-full min-h-[160px] sm:min-h-[120px] absolute inset-0" />
          {/* El botón solo va en la sección de color de fondo */}
        </div>
      </div>
    );
  };
  const BloqueHorizontal2Real = ({ articulo, onEdit }: { articulo: any, onEdit: () => void }) => {
    if (!articulo) return null;
    return (
      <div className="relative rounded-xl overflow-hidden shadow-md bg-red-600 flex flex-col items-center p-6 h-[240px] min-h-[80px] transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl">
        {/* <EditButton onClick={onEdit} bloque={0} /> */}
        <span className="absolute top-3 left-4 z-20 bg-white/80 text-xs font-bold text-red-700 px-3 py-1 rounded-full shadow">{articulo.fecha}</span>
        <div className="flex-1 flex flex-col justify-center items-center">
          <h3 className="text-white text-lg font-bold mt-8">{articulo.titulo}</h3>
        </div>
      </div>
    );
  };

  return (
    <main className="max-w-6xl mx-auto w-full py-8 px-2 md:px-0 bg-white">
      {/* Slider principal */}
      <Slider sliderData={sliderData} />
      {/* Grid de secciones usando artículos de Supabase */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
        {/* Primera columna: primer artículo destacado y uno más */}
        <div className="flex flex-col h-full gap-6 md:col-span-1">
          {/* Bloque fusionado: primer artículo */}
          {(() => { const a = bloquesProcessed[0].articulo; if (!a) return null; return (
            <div className="flex flex-col rounded-xl overflow-hidden shadow-md h-[320px] min-h-[260px] transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl">
              <div className="relative flex-1 min-h-[120px] flex flex-col justify-end">
                <Image src={a?.imagen ?? ""} alt={a?.titulo ?? ""} fill className="absolute inset-0 w-full h-full object-cover" />
                <span className="absolute top-3 left-4 z-20 bg-white/80 text-xs font-bold text-blue-700 px-3 py-1 rounded-full shadow">{a?.categoria}</span>
              </div>
              <div className="bg-blue-500 flex flex-col justify-center p-6 min-h-[80px]">
                <h2 className="text-white text-2xl font-bold mb-2">{a?.titulo}</h2>
                <p className="text-white text-base mb-4">{a?.descripcion_corta}</p>
                <Link href={`/articulo/${a?.slug}`} className="bg-white/90 text-black font-semibold px-6 py-2 rounded-full self-start hover:bg-white transition">Leer más</Link>
              </div>
            </div>
          ); })()}
          {/* Segundo artículo */}
          {(() => { const a = bloquesProcessed[1].articulo; return (
            <BloqueRojo articulo={a} onEdit={() => {}} />
          ); })()}
        </div>
        {/* Segunda columna: dos bloques apilados, cada uno dividido en dos secciones */}
        <div className="flex flex-col gap-6 md:col-span-2">
          {/* Primer bloque: azul claro izquierda, imagen derecha */}
          {(() => { const a = bloquesProcessed[2].articulo; if (!a) return null; return (
            <div className="flex flex-col sm:flex-row rounded-xl overflow-hidden shadow-md h-auto sm:h-[320px] min-h-[180px] sm:min-h-[320px] transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl">
              <div className="w-full sm:w-1/2 bg-cyan-200 flex flex-col justify-between p-4 sm:p-6 relative min-h-[140px] sm:min-h-[120px]">
                <span className="absolute top-3 left-4 z-20 bg-white/80 text-xs font-bold text-cyan-700 px-3 py-1 rounded-full shadow">{a?.categoria}</span>
                <div className="flex-1 flex flex-col justify-center">
                  <h2 className="text-cyan-900 text-xl sm:text-2xl font-bold mb-2 mt-8">{a?.titulo}</h2>
                  <span className="block text-xs text-cyan-800 font-semibold mb-1">{a?.fecha}</span>
                  <p className="text-cyan-900 text-base sm:text-lg mb-4 break-words">{a?.descripcion_corta}</p>
                  <div className="flex justify-center sm:justify-start">
                    <Link href={`/articulo/${a?.slug}`} className="bg-cyan-700 text-white font-semibold px-6 py-2 rounded-full self-center mt-2 hover:bg-cyan-900 hover:shadow-lg transition">Leer más</Link>
                  </div>
                </div>
              </div>
              <div className="w-full sm:w-1/2 min-h-[160px] sm:min-h-[120px] relative flex flex-col justify-end">
                <Image src={a?.imagen ?? ""} alt={a?.titulo ?? ""} fill className="object-cover w-full h-full min-h-[160px] sm:min-h-[120px] absolute inset-0" />
              </div>
            </div>
          ); })()}
          {/* Segundo bloque: imagen izquierda, verde derecha */}
          {(() => { const a = bloquesProcessed[3].articulo; if (!a) return null; return (
            <div className="flex flex-col sm:flex-row rounded-xl overflow-hidden shadow-md h-auto sm:h-[240px] min-h-[180px] sm:min-h-[240px] transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl">
              {/* Sección imagen (izquierda) */}
              <div className="w-full sm:w-1/2 min-h-[160px] sm:min-h-[120px] relative flex flex-col justify-end">
                <Image src={a?.imagen ?? ""} alt={a?.titulo ?? ""} fill className="object-cover w-full h-full min-h-[160px] sm:min-h-[120px] absolute inset-0" />
                <div className="relative z-20 flex justify-center pb-4">
                  <Link href={`/articulo/${a?.slug}`} className="bg-green-700 text-white font-semibold px-6 py-2 rounded-full self-center hover:bg-green-900 hover:shadow-lg transition">Leer más</Link>
                </div>
              </div>
              {/* Sección color verde (derecha) */}
              <div className="w-full sm:w-1/2 bg-green-300 flex flex-col justify-between p-4 sm:p-6 relative min-h-[120px] h-full">
                <span className="absolute top-3 left-4 z-20 bg-white/80 text-xs font-bold text-green-700 px-3 py-1 rounded-full shadow">{a?.categoria}</span>
                <div className="flex-1 flex flex-col justify-center">
                  <h2 className="text-green-900 text-xl sm:text-2xl font-bold mb-2 mt-8">{a?.titulo}</h2>
                  <span className="block text-xs text-green-800 font-semibold mb-1">{a?.fecha}</span>
                  <p className="text-green-900 text-base sm:text-lg mb-4 break-words">{a?.descripcion_corta}</p>
                </div>
              </div>
            </div>
          ); })()}
        </div>
        {/* Tercera columna: bloque único con dos secciones */}
        <div className="flex flex-col h-full min-h-0 md:col-span-1 rounded-xl overflow-hidden shadow-md transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl">
          <div className="flex flex-col h-full min-h-0 flex-1">
            <div className="relative flex-1 flex flex-col justify-end h-1/2 min-h-[180px] sm:min-h-0">
              {(() => { const a = bloquesProcessed[4].articulo; if (!a) return null; return (
                <Image src={a?.imagen ?? ""} alt={a?.titulo ?? ""} fill className="absolute inset-0 w-full h-full object-cover min-h-[180px] sm:min-h-0" />
              ); })()}
              <span className="absolute top-3 left-4 z-20 bg-white/80 text-xs font-bold text-yellow-700 px-3 py-1 rounded-full shadow">{bloquesProcessed[4]?.articulo?.categoria}</span>
                              <div className="relative z-10 p-6 flex flex-col justify-end h-full bg-gradient-to-t from-black/60 via-black/20 to-transparent">
                  <Link href={bloquesProcessed[4]?.articulo? `/articulo/${bloquesProcessed[4].articulo.slug}` : "#"} className="bg-white/90 text-black font-semibold px-6 py-2 rounded-full self-start hover:bg-yellow-500 hover:text-white hover:shadow-lg transition">Leer más</Link>
              </div>
            </div>
            <div className="bg-yellow-200 flex flex-col justify-start p-4 sm:p-6 flex-1 h-1/2">
              <h3 className="text-yellow-900 text-xl sm:text-2xl font-bold mb-1 mt-4">{bloquesProcessed[4]?.articulo?.titulo}</h3>
              <span className="block text-xs text-yellow-800 font-semibold mb-2">{bloquesProcessed[4]?.articulo?.fecha}</span>
              <p className="text-yellow-900 text-base sm:text-lg break-words">{bloquesProcessed[4]?.articulo?.descripcion_corta}</p>
            </div>
          </div>
        </div>
      </section>
      {/* Bloque ancho debajo del grid de tres columnas */}
      {(() => { const a = bloquesProcessed[5].articulo; if (!a) return null; return (
        <section className="w-full flex flex-col md:flex-row mt-10 rounded-xl overflow-hidden shadow-md transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl h-auto md:h-[420px] min-h-[320px]">
          {/* Imagen lado izquierdo (desktop), arriba (móvil) */}
          <div className="relative w-full md:w-1/2 h-60 md:h-full min-h-[200px] flex-1">
            <Image src={a?.imagen ?? ""} alt={a?.titulo ?? ""} fill priority className="object-cover w-full h-full" />
          </div>
          {/* Lado derecho: fondo naranja claro y contenido */}
          <div className="w-full md:w-1/2 bg-orange-200 flex flex-col justify-between p-6 md:p-10 h-full min-h-[280px] flex-1">
            <div>
              <span className="text-xs font-bold text-orange-700 bg-white/80 px-3 py-1 rounded-full shadow mb-4 self-start">{a?.categoria}</span>
              <h2 className="text-orange-900 text-2xl md:text-4xl font-extrabold mb-3">{a?.titulo}</h2>
              <span className="block text-xs text-orange-800 font-semibold mb-2">{a?.fecha}</span>
              <p className="text-orange-900 text-base md:text-lg mb-6 break-words">{a?.descripcion_corta}</p>
            </div>
            <div className="flex items-end justify-center md:justify-start pt-4 pb-2 w-full">
              <Link href={`/articulo/${a?.slug}`} className="bg-orange-600 text-white font-semibold px-8 py-3 rounded-full hover:bg-orange-800 hover:shadow-lg transition max-w-xs w-full md:w-auto">Leer más</Link>
            </div>
          </div>
        </section>
      ); })()}
      {/* Nueva sección de dos columnas debajo del bloque especial */}
      <section className="w-full flex flex-col md:grid md:grid-cols-4 md:gap-6 gap-0 mt-10">
        {/* Columna 1: un solo bloque, igual al primer bloque de la primer columna de la primer sección, de alto igual a la primer sección */}
        <div className="flex flex-col w-full md:col-span-1 h-auto min-h-[320px] rounded-xl overflow-hidden shadow-md transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl">
          {/* Bloque fusionado */}
          {(() => { const a = bloquesProcessed[6].articulo; if (!a) return null; return (
            <div className="flex flex-col rounded-xl overflow-hidden shadow-md h-full min-h-[260px] transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl">
              <div className="relative flex-1 min-h-[120px] flex flex-col justify-end">
                <Image src={a?.imagen ?? ""} alt={a?.titulo ?? ""} fill className="absolute inset-0 w-full h-full object-cover" />
                <span className="absolute top-3 left-4 z-20 bg-white/80 text-xs font-bold text-blue-700 px-3 py-1 rounded-full shadow">{a?.categoria}</span>
              </div>
              <div className="bg-blue-500 flex flex-col justify-center p-6 min-h-[80px]">
                <h2 className="text-white text-2xl font-bold mb-2">{a?.titulo}</h2>
                <p className="text-white text-base mb-4">{a?.descripcion_corta}</p>
                <Link href={`/articulo/${a?.slug}`} className="bg-white/90 text-black font-semibold px-6 py-2 rounded-full self-start hover:bg-white transition">Leer más</Link>
              </div>
            </div>
          ); })()}
        </div>
        {/* Columna 2: (igual que antes, pero ahora md:col-span-3) */}
        <div className="flex flex-col h-full w-full md:col-span-3">
          {/* Layout móvil: intercalado, ambos bloques rojos */}
          <div className="flex flex-col gap-6 md:hidden">
            {/* BloqueHorizontal1 (row 1) */}
            <BloqueHorizontal1Real articulo={bloquesProcessed[7].articulo} onEdit={() => {}} />
            {/* BloqueHorizontal2 (row 1) */}
            <BloqueHorizontal2Real articulo={bloquesProcessed[8].articulo} onEdit={() => {}} />
            {/* BloqueHorizontal1 (row 2) con fondo rosa */}
            <BloqueHorizontal1Real articulo={bloquesProcessed[9].articulo} colorFondo="bg-pink-200" onEdit={() => {}} />
            {/* BloqueHorizontal2 (row 2) */}
            <BloqueHorizontal2Real articulo={bloquesProcessed[10].articulo} onEdit={() => {}} />
          </div>
          {/* Layout desktop: dos rows, dos columnas, ambos bloques rojos visibles */}
          <div className="hidden md:flex flex-col h-full w-full gap-3">
            {/* Primer row */}
            <div className="flex flex-row gap-6 h-full w-full mb-6">
              <div className="flex flex-col w-full basis-2/3 max-w-[66%]">
                <BloqueHorizontal1Real articulo={bloquesProcessed[7].articulo} onEdit={() => {}} />
              </div>
              <div className="flex flex-col w-full basis-1/3 max-w-[34%]">
                <BloqueHorizontal2Real articulo={bloquesProcessed[8].articulo} onEdit={() => {}} />
              </div>
            </div>
            {/* Segundo row: fondo rosa e invierte orden en desktop */}
            <div className="flex flex-row gap-6 h-full w-full">
              <div className="flex flex-col w-full basis-1/3 max-w-[34%]">
                <BloqueHorizontal2Real articulo={bloquesProcessed[9].articulo} onEdit={() => {}} />
              </div>
              <div className="flex flex-col w-full basis-2/3 max-w-[66%]">
                <BloqueHorizontal1Real articulo={bloquesProcessed[10].articulo} colorFondo="bg-pink-200" invertirDesktop onEdit={() => {}} />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Duplicado del bloque ancho especial debajo de la sección de dos columnas, con color verde e invertido */}
      {(() => { const a = bloquesProcessed[15].articulo; if (!a) return null; return (
        <section className="w-full flex flex-col md:flex-row-reverse mt-10 rounded-xl overflow-hidden shadow-md transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl h-auto md:h-[420px] min-h-[320px]">
          {/* Imagen lado derecho (desktop), abajo (móvil) */}
          <div className="relative w-full md:w-1/2 h-60 md:h-full min-h-[200px] flex-1">
            <Image src={a?.imagen ?? ""} alt={a?.titulo ?? ""} fill priority className="object-cover w-full h-full" />
          </div>
          {/* Lado izquierdo: fondo verde claro y contenido */}
          <div className="w-full md:w-1/2 bg-green-200 flex flex-col justify-between p-6 md:p-10 h-full min-h-[280px] flex-1">
            <div>
              <span className="text-xs font-bold text-green-700 bg-white/80 px-3 py-1 rounded-full shadow mb-4 self-start">{a?.categoria}</span>
              <h2 className="text-green-900 text-2xl md:text-4xl font-extrabold mb-3">{a?.titulo}</h2>
              <span className="block text-xs text-green-800 font-semibold mb-2">{a?.fecha}</span>
              <p className="text-green-900 text-base md:text-lg mb-6 break-words">{a?.descripcion_corta}</p>
            </div>
            <div className="flex items-end justify-center md:justify-start pt-4 pb-2 w-full">
              <Link href={`/articulo/${a?.slug}`} className="bg-green-600 text-white font-semibold px-8 py-3 rounded-full hover:bg-green-800 hover:shadow-lg transition max-w-xs w-full md:w-auto">Leer más</Link>
            </div>
          </div>
        </section>
      ); })()}
      {/* Réplica de la primer sección de 3 columnas (colores personalizados) */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full mt-10">
        {/* Primera columna: primer artículo destacado y uno más */}
        <div className="flex flex-col h-full gap-6 md:col-span-1">
          {/* Bloque fusionado: primer artículo */}
          {(() => { const a = bloquesProcessed[12].articulo; if (!a) return null; return (
            <div className="flex flex-col rounded-xl overflow-hidden shadow-md h-[320px] min-h-[260px] transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl">
              <div className="relative flex-1 min-h-[120px] flex flex-col justify-end">
                <Image src={a?.imagen ?? ""} alt={a?.titulo ?? ""} fill className="absolute inset-0 w-full h-full object-cover" />
                <span className="absolute top-3 left-4 z-20 bg-white/80 text-xs font-bold text-blue-700 px-3 py-1 rounded-full shadow">{a?.categoria}</span>
              </div>
              <div className="bg-blue-500 flex flex-col justify-center p-6 min-h-[80px]">
                <h2 className="text-white text-2xl font-bold mb-2">{a?.titulo}</h2>
                <p className="text-white text-base mb-4">{a?.descripcion_corta}</p>
                <Link href={`/articulo/${a?.slug}`} className="bg-white/90 text-black font-semibold px-6 py-2 rounded-full self-start hover:bg-white transition">Leer más</Link>
              </div>
            </div>
          ); })()}
          {/* Segundo artículo */}
          {(() => { const a = bloquesProcessed[13].articulo; return (
            <BloqueRojo articulo={a} onEdit={() => {}} />
          ); })()}
        </div>
        {/* Segunda columna: dos bloques apilados, cada uno dividido en dos secciones */}
        <div className="flex flex-col gap-6 md:col-span-2">
          {/* Primer bloque: amarillo igual que admin */}
          {(() => { const a = bloquesProcessed[14].articulo; if (!a) return null; return (
            <div className="flex flex-col md:flex-row h-full min-h-0 flex-1 rounded-2xl overflow-hidden shadow-lg">
              {/* Sección contenido (izquierda) */}
              <div className="w-full md:w-1/2 bg-yellow-200 flex flex-col justify-center p-4 sm:p-6 h-auto md:h-full">
                <h3 className="text-yellow-900 text-xl sm:text-2xl font-bold mb-1 mt-2 md:mt-0">{a?.titulo}</h3>
                <span className="block text-xs text-yellow-800 font-semibold mb-2">{a?.fecha}</span>
                <p className="text-yellow-900 text-base sm:text-lg break-words mb-4">{a?.descripcion_corta}</p>
              </div>
              {/* Sección imagen (derecha) */}
              <div className="w-full md:w-1/2 h-48 md:h-full relative flex flex-col justify-end">
                <Image src={a?.imagen ?? ""} alt={a?.titulo ?? ""} fill className="absolute inset-0 w-full h-full object-cover" />
                <span className="absolute top-3 left-4 z-20 bg-white/80 text-xs font-bold text-yellow-700 px-3 py-1 rounded-full shadow">{a?.categoria}</span>
                <div className="relative z-20 flex justify-center pb-4">
                  <Link href={a ? `/articulo/${a.slug}` : "#"} className="bg-white/90 text-yellow-700 font-semibold px-6 py-2 rounded-full hover:bg-yellow-500 hover:text-white hover:shadow-lg transition">Leer más</Link>
                </div>
              </div>
            </div>
          ); })()}
          {/* Segundo bloque: imagen izquierda, verde derecha (ya correcto) */}
          {(() => { const a = bloquesProcessed[15].articulo; if (!a) return null; return (
            <div className="flex flex-col sm:flex-row rounded-xl overflow-hidden shadow-md h-auto sm:h-[240px] min-h-[180px] sm:min-h-[240px] transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl">
              {/* Sección imagen (izquierda) */}
              <div className="w-full sm:w-1/2 min-h-[160px] sm:min-h-[120px] relative flex flex-col justify-end">
                <Image src={a?.imagen ?? ""} alt={a?.titulo ?? ""} fill className="object-cover w-full h-full min-h-[160px] sm:min-h-[120px] absolute inset-0" />
                <div className="relative z-20 flex justify-center pb-4">
                  <Link href={`/articulo/${a?.slug}`} className="bg-green-700 text-white font-semibold px-6 py-2 rounded-full self-center hover:bg-green-900 hover:shadow-lg transition">Leer más</Link>
                </div>
              </div>
              {/* Sección color verde (derecha) */}
              <div className="w-full sm:w-1/2 bg-green-300 flex flex-col justify-between p-4 sm:p-6 relative min-h-[120px] h-full">
                <span className="absolute top-3 left-4 z-20 bg-white/80 text-xs font-bold text-green-700 px-3 py-1 rounded-full shadow">{a?.categoria}</span>
                <div className="flex-1 flex flex-col justify-center">
                  <h2 className="text-green-900 text-xl sm:text-2xl font-bold mb-2 mt-8">{a?.titulo}</h2>
                  <span className="block text-xs text-green-800 font-semibold mb-1">{a?.fecha}</span>
                  <p className="text-green-900 text-base sm:text-lg mb-4 break-words">{a?.descripcion_corta}</p>
                </div>
              </div>
            </div>
          ); })()}
        </div>
        {/* Tercera columna: bloque único con dos secciones */}
        <div className="flex flex-col h-full min-h-0 md:col-span-1 rounded-xl overflow-hidden shadow-md transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl">
          {/* Primer bloque: azul igual que admin */}
          {(() => { const a = bloquesProcessed[16].articulo; if (!a) return null; return (
            <div className="flex flex-col h-full min-h-0 flex-1">
              <div className="relative flex-1 flex flex-col justify-end h-1/2 min-h-[180px] sm:min-h-0">
                <Image src={a?.imagen ?? ""} alt={a?.titulo ?? ""} fill className="absolute inset-0 w-full h-full object-cover min-h-[180px] sm:min-h-0" />
                <span className="absolute top-3 left-4 z-20 bg-white/80 text-xs font-bold text-blue-700 px-3 py-1 rounded-full shadow">{a?.categoria}</span>
                <div className="relative z-10 p-6 flex flex-col justify-end h-full bg-gradient-to-t from-black/60 via-black/20 to-transparent">
                  <Link href={a ? `/articulo/${a.slug}` : "#"} className="bg-white/90 text-black font-semibold px-6 py-2 rounded-full self-start hover:bg-blue-500 hover:text-white hover:shadow-lg transition">Leer más</Link>
                </div>
              </div>
              <div className="bg-blue-500 flex flex-col justify-start p-4 sm:p-6 flex-1 h-1/2">
                <h3 className="text-blue-100 text-xl sm:text-2xl font-bold mb-1 mt-4">{a?.titulo}</h3>
                <span className="block text-xs text-blue-200 font-semibold mb-2">{a?.fecha}</span>
                <p className="text-blue-100 text-base sm:text-lg break-words">{a?.descripcion_corta}</p>
              </div>
            </div>
          ); })()}
        </div>
      </section>
      {/* Bloque ancho con el mes actual en grande y centrado, fondo verde, con logo en la esquina superior izquierda */}
      <section className="w-full flex items-center justify-center mt-10 rounded-xl overflow-hidden shadow-md transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl bg-green-500 h-[220px] md:h-[320px] relative">
        {/* Logo en la esquina superior izquierda */}
        <div className="absolute top-4 left-4 z-10">
          <Image src="/logo-puntozero.png" alt="Logo Puntozero" width={120} height={40} className="object-contain h-10 w-auto" />
        </div>
        <h2 className="text-white text-4xl md:text-6xl font-extrabold text-center w-full">
          {new Date().toLocaleString('es-ES', { month: 'long' }).toUpperCase()}
        </h2>
      </section>
      </main>
  );
}

// Tipos para los props de los bloques horizontales
interface BloqueHorizontal1Props {
  categoria: string;
  titulo: string;
  fecha: string;
  descripcion: string;
  imagen: string;
  colorFondo?: string; // tailwind class
  invertirDesktop?: boolean;
}
interface BloqueHorizontal2Props {
  fecha: string;
  titulo: string;
}

// Componentes internos para los bloques horizontales
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function BloqueHorizontal1({ categoria, titulo, fecha, descripcion, imagen, slug, colorFondo = 'bg-yellow-200', invertirDesktop = false }: any) {
  const colorTexto = colorFondo === 'bg-pink-200' ? 'text-pink-900' : 'text-yellow-900';
  const colorCategoria = colorFondo === 'bg-pink-200' ? 'text-pink-800' : 'text-yellow-800';
  const colorDescripcion = colorFondo === 'bg-pink-200' ? 'text-pink-900' : 'text-yellow-900';
  const colorCategoriaSpan = colorFondo === 'bg-pink-200' ? 'text-pink-700' : 'text-yellow-700';
  return (
    <div className={`flex flex-col sm:flex-row rounded-xl overflow-hidden shadow-md h-auto min-h-[180px] sm:min-h-[240px] transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl ${invertirDesktop ? 'sm:flex-row-reverse' : ''} sm:items-stretch`}>
      {/* Sección de color y texto */}
      <div className={`w-full sm:w-1/2 ${colorFondo} flex flex-col justify-between p-4 sm:p-6 relative min-h-[140px] sm:min-h-[120px] h-full`}>
        <span className={`absolute top-3 left-4 z-20 bg-white/80 text-xs font-bold ${colorCategoriaSpan} px-3 py-1 rounded-full shadow`}>{categoria}</span>
        <div className="flex-1 flex flex-col justify-center">
          <h2 className={`${colorTexto} text-xl sm:text-2xl font-bold mb-2 mt-8`}>{titulo}</h2>
          <span className={`block text-xs ${colorCategoria} font-semibold mb-1`}>{fecha}</span>
          <p className={`${colorDescripcion} text-base sm:text-lg mb-4 break-words`}>{descripcion}</p>
        </div>
      </div>
      <div className="w-full sm:w-1/2 min-h-[160px] sm:min-h-[120px] relative flex flex-col justify-end h-full">
        <Image src={imagen} alt={titulo} fill className="object-cover w-full h-full min-h-[160px] sm:min-h-[120px] absolute inset-0" />
        <div className="relative z-20 flex justify-center pb-4">
          <Link href={`/articulo/${slug ?? ""}`} className="bg-white/90 text-black font-semibold px-6 py-2 rounded-full hover:bg-yellow-700 hover:text-white hover:shadow-lg transition">Leer más</Link>
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function BloqueHorizontal2({ articulo }: { articulo: any }) {
  return (
    <div className="relative rounded-xl overflow-hidden shadow-md bg-red-600 flex flex-col items-center p-6 h-[240px] min-h-[80px] transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl">
      <span className="absolute top-3 left-4 z-20 bg-white/80 text-xs font-bold text-red-700 px-3 py-1 rounded-full shadow">{articulo.fecha}</span>
      <div className="flex-1 flex flex-col justify-center items-center">
        <h3 className="text-white text-lg font-bold mt-8">{articulo.titulo}</h3>
      </div>
    </div>
  );
}
