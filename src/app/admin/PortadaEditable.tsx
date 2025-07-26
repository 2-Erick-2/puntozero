"use client";
import React from "react";
import Slider from "../components/Slider";
import Image from "next/image";
import Link from "next/link";
import ArticuloSelectorModal from "./components/ArticuloSelectorModal";
import { useState, useMemo } from "react";
import { createSupabaseBrowser } from "../supabaseClient";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PortadaEditable({ bloques, articulos, onRefetch }: { bloques: any[], articulos: any[], onRefetch: () => Promise<void> }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [bloqueEditando, setBloqueEditando] = useState<number|null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bloquesState, setBloquesState] = useState<any[]>(() => [...bloques]);
  // Obtener categorías únicas
  const categorias = useMemo(() => Array.from(new Set(bloques.map(b => b.articulo?.categoria).filter(Boolean))), [bloques]);

  // Handler para abrir modal
  const handleEditar = (bloque: number) => {
    setBloqueEditando(bloque);
    setModalOpen(true);
  };

  // Handler para guardar selección y persistir en Supabase
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectArticulo = async (nuevoArticulo: any) => {
    if (bloqueEditando !== null) {
      const nuevos = [...bloquesState];
      nuevos[bloqueEditando-1] = { ...nuevos[bloqueEditando-1], articulo: nuevoArticulo };
      setBloquesState(nuevos);
      // Persistir en Supabase
      const supabase = createSupabaseBrowser();
      const { data: upsertData, error: upsertError } = await supabase.from('bloques_portada').upsert({
        id: nuevos[bloqueEditando-1].id,
        articulo_id: nuevoArticulo.id,
        nombre: nuevos[bloqueEditando-1].nombre,
        tipo: nuevos[bloqueEditando-1].tipo,
        posicion: nuevos[bloqueEditando-1].posicion
      });
      if (upsertError) {
        console.error('Error al hacer upsert en bloques_portada:', upsertError);
        alert('Error al guardar el cambio en Supabase: ' + upsertError.message);
        return;
      }
      // Recargar bloques desde Supabase solo si el upsert fue exitoso
      const { data, error: fetchError } = await supabase
        .from('bloques_portada')
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
        .order('posicion', { ascending: true });
      if (fetchError) {
        console.error('Error al recargar bloques desde Supabase:', fetchError);
        alert('Error al recargar los bloques: ' + fetchError.message);
        return;
      }
      if (data) setBloquesState(data);
    }
  };

  // Botón flotante de editar con efecto y tooltip
  const EditButton = ({ onClick, bloque }: { onClick: () => void, bloque: number }) => (
    <div className="absolute top-3 right-3 z-30 group">
      <button
        onClick={onClick}
        className="bg-red-600 text-white rounded-full p-2 shadow-lg transition-transform duration-200 hover:bg-red-800 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-400"
        title="Cambiar artículo"
        type="button"
      >
        ✏️
      </button>
      <span className="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
        Cambiar artículo
      </span>
    </div>
  );

  // Bloques helpers con botón de editar
  const BloqueRojo = ({ articulo, onEdit }: { articulo: any, onEdit: () => void }) => (
    <div className="relative rounded-xl overflow-hidden shadow-md bg-red-600 flex flex-col items-center p-6 h-[240px] min-h-[80px] transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl">
      <EditButton onClick={onEdit} bloque={0} />
      <span className="absolute top-3 left-4 z-20 bg-white/80 text-xs font-bold text-red-700 px-3 py-1 rounded-full shadow">{articulo.fecha}</span>
      <div className="flex-1 flex flex-col justify-center items-center">
        <h3 className="text-white text-lg font-bold mt-8">{articulo.titulo}</h3>
      </div>
    </div>
  );

  const BloqueHorizontal1Real = ({ articulo, colorFondo = 'bg-yellow-200', invertirDesktop = false, onEdit }: { articulo: any, colorFondo?: string, invertirDesktop?: boolean, onEdit: () => void }) => (
    <div className={`relative flex flex-col sm:flex-row rounded-xl overflow-hidden shadow-md h-auto sm:h-[320px] min-h-[180px] sm:min-h-[320px] transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl ${invertirDesktop ? 'sm:flex-row-reverse' : ''} sm:items-stretch`}>
      <EditButton onClick={onEdit} bloque={0} />
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

  const BloqueHorizontal2Real = ({ articulo, onEdit }: { articulo: any, onEdit: () => void }) => (
    <div className="relative rounded-xl overflow-hidden shadow-md bg-red-600 flex flex-col items-center p-6 h-[240px] min-h-[80px] transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl">
      <EditButton onClick={onEdit} bloque={0} />
      <span className="absolute top-3 left-4 z-20 bg-white/80 text-xs font-bold text-red-700 px-3 py-1 rounded-full shadow">{articulo.fecha}</span>
      <div className="flex-1 flex flex-col justify-center items-center">
        <h3 className="text-white text-lg font-bold mt-8">{articulo.titulo}</h3>
      </div>
    </div>
  );

  // Slider de portada (idéntico al público)
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

  return (
    <main className="max-w-6xl mx-auto w-full py-8 px-2 md:px-0 bg-white">
      {/* Slider principal */}
      <Slider sliderData={sliderData} />
      {/* Grid de secciones usando artículos de Supabase */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
        {/* Primera columna: primer artículo destacado y uno más */}
        <div className="flex flex-col h-full gap-6 md:col-span-1">
          {/* Bloque fusionado: primer artículo */}
          {(() => { const a = bloquesState[0]; if (!a || !a.articulo) return null; return (
            <div className="flex flex-col rounded-xl overflow-hidden shadow-md h-[320px] min-h-[260px] transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl">
              <div className="relative flex-1 min-h-[120px] flex flex-col justify-end">
                <Image src={a.articulo.imagen} alt={a.articulo.titulo} fill className="absolute inset-0 w-full h-full object-cover" />
                <EditButton onClick={() => handleEditar(1)} bloque={1} />
                <span className="absolute top-3 left-4 z-20 bg-white/80 text-xs font-bold text-blue-700 px-3 py-1 rounded-full shadow">{a.articulo.categoria}</span>
              </div>
              <div className="bg-blue-500 flex flex-col justify-center p-6 min-h-[80px]">
                <h2 className="text-white text-2xl font-bold mb-2">{a.articulo.titulo}</h2>
                <p className="text-white text-base mb-4">{a.articulo.descripcion_corta}</p>
                <Link href={`/articulo/${a.articulo.slug}`} className="bg-white/90 text-black font-semibold px-6 py-2 rounded-full self-start hover:bg-white transition">Leer más</Link>
              </div>
            </div>
          ); })()}
          {/* Segundo artículo */}
          {(() => { const a = bloquesState[1]; if (!a || !a.articulo) return null; return (
            <BloqueRojo articulo={a.articulo} onEdit={() => handleEditar(2)} />
          ); })()}
        </div>
        {/* Segunda columna: dos bloques apilados, cada uno dividido en dos secciones */}
        <div className="flex flex-col gap-6 md:col-span-2">
          {/* Primer bloque: azul claro izquierda, imagen derecha */}
          {(() => { const a = bloquesState[2]; if (!a || !a.articulo) return null; return (
            <div className="flex flex-col sm:flex-row rounded-xl overflow-hidden shadow-md h-auto sm:h-[320px] min-h-[180px] sm:min-h-[320px] transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl">
              <div className="w-full sm:w-1/2 bg-cyan-200 flex flex-col justify-between p-4 sm:p-6 relative min-h-[140px] sm:min-h-[120px]">
                <span className="absolute top-3 left-4 z-20 bg-white/80 text-xs font-bold text-cyan-700 px-3 py-1 rounded-full shadow">{a.articulo.categoria}</span>
                <div className="flex-1 flex flex-col justify-center">
                  <h2 className="text-cyan-900 text-xl sm:text-2xl font-bold mb-2 mt-8">{a.articulo.titulo}</h2>
                  <span className="block text-xs text-cyan-800 font-semibold mb-1">{a.articulo.fecha}</span>
                  <p className="text-cyan-900 text-base sm:text-lg mb-4 break-words">{a.articulo.descripcion_corta}</p>
                  <div className="flex justify-center sm:justify-start">
                    <Link href={`/articulo/${a.articulo.slug}`} className="bg-cyan-700 text-white font-semibold px-6 py-2 rounded-full self-center mt-2 hover:bg-cyan-900 hover:shadow-lg transition">Leer más</Link>
                  </div>
                </div>
              </div>
              <div className="w-full sm:w-1/2 min-h-[160px] sm:min-h-[120px] relative flex flex-col justify-end">
                <Image src={a.articulo.imagen} alt={a.articulo.titulo} fill className="object-cover w-full h-full min-h-[160px] sm:min-h-[120px] absolute inset-0" />
                <EditButton onClick={() => handleEditar(3)} bloque={3} />
              </div>
            </div>
          ); })()}
          {/* Segundo bloque: imagen izquierda, verde derecha */}
          {(() => { const a = bloquesState[3]; if (!a || !a.articulo) return null; return (
            <div className="flex flex-col sm:flex-row rounded-xl overflow-hidden shadow-md h-auto sm:h-[240px] min-h-[180px] sm:min-h-[240px] transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl">
              {/* Sección imagen (izquierda) */}
              <div className="w-full sm:w-1/2 min-h-[160px] sm:min-h-[120px] relative flex flex-col justify-end">
                <Image src={a.articulo.imagen} alt={a.articulo.titulo} fill className="object-cover w-full h-full min-h-[160px] sm:min-h-[120px] absolute inset-0" />
                <EditButton onClick={() => handleEditar(4)} bloque={4} />
                <div className="relative z-20 flex justify-center pb-4">
                  <Link href={`/articulo/${a.articulo.slug}`} className="bg-green-700 text-white font-semibold px-6 py-2 rounded-full self-center hover:bg-green-900 hover:shadow-lg transition">Leer más</Link>
                </div>
              </div>
              {/* Sección color verde (derecha) */}
              <div className="w-full sm:w-1/2 bg-green-300 flex flex-col justify-between p-4 sm:p-6 relative min-h-[120px] h-full">
                <span className="absolute top-3 left-4 z-20 bg-white/80 text-xs font-bold text-green-700 px-3 py-1 rounded-full shadow">{a.articulo.categoria}</span>
                <div className="flex-1 flex flex-col justify-center">
                  <h2 className="text-green-900 text-xl sm:text-2xl font-bold mb-2 mt-8">{a.articulo.titulo}</h2>
                  <span className="block text-xs text-green-800 font-semibold mb-1">{a.articulo.fecha}</span>
                  <p className="text-green-900 text-base sm:text-lg mb-4 break-words">{a.articulo.descripcion_corta}</p>
                </div>
              </div>
            </div>
          ); })()}
        </div>
        {/* Tercera columna: bloque único con dos secciones */}
        <div className="flex flex-col h-full min-h-0 md:col-span-1 rounded-xl overflow-hidden shadow-md transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl">
          <div className="flex flex-col h-full min-h-0 flex-1">
            <div className="relative flex-1 flex flex-col justify-end h-1/2 min-h-[180px] sm:min-h-0">
              {(() => { const a = bloquesState[4]; if (!a || !a.articulo) return null; return (
                <Image src={a.articulo.imagen} alt={a.articulo.titulo} fill className="absolute inset-0 w-full h-full object-cover min-h-[180px] sm:min-h-0" />
              ); })()}
              <EditButton onClick={() => handleEditar(5)} bloque={5} />
              <span className="absolute top-3 left-4 z-20 bg-white/80 text-xs font-bold text-yellow-700 px-3 py-1 rounded-full shadow">{bloquesState[4]?.articulo?.categoria}</span>
              <div className="relative z-10 p-6 flex flex-col justify-end h-full bg-gradient-to-t from-black/60 via-black/20 to-transparent">
                <Link href={bloquesState[4]?.articulo ? `/articulo/${bloquesState[4].articulo.slug}` : "#"} className="bg-white/90 text-black font-semibold px-6 py-2 rounded-full self-start hover:bg-yellow-500 hover:text-white hover:shadow-lg transition">Leer más</Link>
              </div>
            </div>
            <div className="bg-yellow-200 flex flex-col justify-start p-4 sm:p-6 flex-1 h-1/2">
              <h3 className="text-yellow-900 text-xl sm:text-2xl font-bold mb-1 mt-4">{bloquesState[4]?.articulo?.titulo}</h3>
              <span className="block text-xs text-yellow-800 font-semibold mb-2">{bloquesState[4]?.articulo?.fecha}</span>
              <p className="text-yellow-900 text-base sm:text-lg break-words">{bloquesState[4]?.articulo?.descripcion_corta}</p>
            </div>
          </div>
        </div>
      </section>
      {/* Bloque ancho debajo del grid de tres columnas */}
      {(() => { const a = bloquesState[5]; if (!a || !a.articulo) return null; return (
        <section className="w-full flex flex-col md:flex-row mt-10 rounded-xl overflow-hidden shadow-md transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl h-auto md:h-[420px] min-h-[320px]">
          {/* Imagen lado izquierdo (desktop), arriba (móvil) */}
          <div className="relative w-full md:w-1/2 h-60 md:h-full min-h-[200px] flex-1">
            <Image src={a.articulo.imagen} alt={a.articulo.titulo} fill priority className="object-cover w-full h-full" />
            <EditButton onClick={() => handleEditar(6)} bloque={6} />
          </div>
          {/* Lado derecho: fondo naranja claro y contenido */}
          <div className="w-full md:w-1/2 bg-orange-200 flex flex-col justify-between p-6 md:p-10 h-full min-h-[280px] flex-1">
            <div>
              <span className="text-xs font-bold text-orange-700 bg-white/80 px-3 py-1 rounded-full shadow mb-4 self-start">{a.articulo.categoria}</span>
              <h2 className="text-orange-900 text-2xl md:text-4xl font-extrabold mb-3">{a.articulo.titulo}</h2>
              <span className="block text-xs text-orange-800 font-semibold mb-2">{a.articulo.fecha}</span>
              <p className="text-orange-900 text-base md:text-lg mb-6 break-words">{a.articulo.descripcion_corta}</p>
            </div>
            <div className="flex items-end justify-center md:justify-start pt-4 pb-2 w-full">
              <Link href={`/articulo/${a.articulo.slug}`} className="bg-orange-600 text-white font-semibold px-8 py-3 rounded-full hover:bg-orange-800 hover:shadow-lg transition max-w-xs w-full md:w-auto">Leer más</Link>
            </div>
          </div>
        </section>
      ); })()}
      {/* Nueva sección de dos columnas debajo del bloque especial */}
      <section className="w-full flex flex-col md:grid md:grid-cols-4 md:gap-6 gap-0 mt-10">
        {/* Columna 1: un solo bloque, igual al primer bloque de la primer columna de la primer sección, de alto igual a la primer sección */}
        <div className="flex flex-col w-full md:col-span-1 h-auto min-h-[320px] rounded-xl overflow-hidden shadow-md transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl">
          {/* Bloque fusionado */}
          {(() => { const a = bloquesState[6]; if (!a || !a.articulo) return null; return (
            <div className="flex flex-col rounded-xl overflow-hidden shadow-md h-full min-h-[260px] transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl">
              <div className="relative flex-1 min-h-[120px] flex flex-col justify-end">
                <Image src={a.articulo.imagen} alt={a.articulo.titulo} fill className="absolute inset-0 w-full h-full object-cover" />
                <EditButton onClick={() => handleEditar(7)} bloque={7} />
                <span className="absolute top-3 left-4 z-20 bg-white/80 text-xs font-bold text-blue-700 px-3 py-1 rounded-full shadow">{a.articulo.categoria}</span>
              </div>
              <div className="bg-blue-500 flex flex-col justify-center p-6 min-h-[80px]">
                <h2 className="text-white text-2xl font-bold mb-2">{a.articulo.titulo}</h2>
                <p className="text-white text-base mb-4">{a.articulo.descripcion_corta}</p>
                <Link href={`/articulo/${a.articulo.slug}`} className="bg-white/90 text-black font-semibold px-6 py-2 rounded-full self-start hover:bg-white transition">Leer más</Link>
              </div>
            </div>
          ); })()}
        </div>
        {/* Columna 2: (igual que antes, pero ahora md:col-span-3) */}
        <div className="flex flex-col h-full w-full md:col-span-3">
          {/* Layout móvil: intercalado, ambos bloques rojos */}
          <div className="flex flex-col gap-6 md:hidden">
            {/* BloqueHorizontal1 (row 1) */}
            {bloquesState[7] && bloquesState[7].articulo && <BloqueHorizontal1Real articulo={bloquesState[7].articulo} onEdit={() => handleEditar(8)} />}
            {/* BloqueHorizontal2 (row 1) */}
            {bloquesState[8] && bloquesState[8].articulo && <BloqueHorizontal2Real articulo={bloquesState[8].articulo} onEdit={() => handleEditar(9)} />}
            {/* BloqueHorizontal1 (row 2) con fondo rosa */}
            {bloquesState[9] && bloquesState[9].articulo && <BloqueHorizontal1Real articulo={bloquesState[9].articulo} colorFondo="bg-pink-200" onEdit={() => handleEditar(10)} />}
            {/* BloqueHorizontal2 (row 2) */}
            {bloquesState[10] && bloquesState[10].articulo && <BloqueHorizontal2Real articulo={bloquesState[10].articulo} onEdit={() => handleEditar(11)} />}
          </div>
          {/* Layout desktop: dos rows, dos columnas, ambos bloques rojos visibles */}
          <div className="hidden md:flex flex-col h-full w-full gap-3">
            {/* Primer row */}
            <div className="flex flex-row gap-6 h-full w-full mb-6">
              <div className="flex flex-col w-full basis-2/3 max-w-[66%]">
                {bloquesState[7] && bloquesState[7].articulo && <BloqueHorizontal1Real articulo={bloquesState[7].articulo} onEdit={() => handleEditar(8)} />}
              </div>
              <div className="flex flex-col w-full basis-1/3 max-w-[34%]">
                {bloquesState[8] && bloquesState[8].articulo && <BloqueHorizontal2Real articulo={bloquesState[8].articulo} onEdit={() => handleEditar(9)} />}
              </div>
            </div>
            {/* Segundo row: fondo rosa e invierte orden en desktop */}
            <div className="flex flex-row gap-6 h-full w-full">
              <div className="flex flex-col w-full basis-1/3 max-w-[34%]">
                {bloquesState[9] && bloquesState[9].articulo && <BloqueHorizontal2Real articulo={bloquesState[9].articulo} onEdit={() => handleEditar(10)} />}
              </div>
              <div className="flex flex-col w-full basis-2/3 max-w-[66%]">
                {bloquesState[10] && bloquesState[10].articulo && <BloqueHorizontal1Real articulo={bloquesState[10].articulo} colorFondo="bg-pink-200" invertirDesktop onEdit={() => handleEditar(11)} />}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Duplicado del bloque ancho especial debajo de la sección de dos columnas, con color verde e invertido */}
      {(() => { const a = bloquesState[11]; if (!a || !a.articulo) return null; return (
        <section className="w-full flex flex-col md:flex-row-reverse mt-10 rounded-xl overflow-hidden shadow-md transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl h-auto md:h-[420px] min-h-[320px]">
          {/* Imagen lado derecho (desktop), abajo (móvil) */}
          <div className="relative w-full md:w-1/2 h-60 md:h-full min-h-[200px] flex-1">
            <Image src={a.articulo.imagen} alt={a.articulo.titulo} fill priority className="object-cover w-full h-full" />
            <EditButton onClick={() => handleEditar(12)} bloque={12} />
          </div>
          {/* Lado izquierdo: fondo verde claro y contenido */}
          <div className="w-full md:w-1/2 bg-green-200 flex flex-col justify-between p-6 md:p-10 h-full min-h-[280px] flex-1">
            <div>
              <span className="text-xs font-bold text-green-700 bg-white/80 px-3 py-1 rounded-full shadow mb-4 self-start">{a.articulo.categoria}</span>
              <h2 className="text-green-900 text-2xl md:text-4xl font-extrabold mb-3">{a.articulo.titulo}</h2>
              <span className="block text-xs text-green-800 font-semibold mb-2">{a.articulo.fecha}</span>
              <p className="text-green-900 text-base md:text-lg mb-6 break-words">{a.articulo.descripcion_corta}</p>
            </div>
            <div className="flex items-end justify-center md:justify-start pt-4 pb-2 w-full">
              <Link href={`/articulo/${a.articulo.slug}`} className="bg-green-600 text-white font-semibold px-8 py-3 rounded-full hover:bg-green-800 hover:shadow-lg transition max-w-xs w-full md:w-auto">Leer más</Link>
            </div>
          </div>
        </section>
      ); })()}
      {/* Sección final de bloques de 3 columnas (idéntica a la portada pública) */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full mt-10">
        {/* Primera columna: primer artículo destacado y uno más */}
        <div className="flex flex-col h-full gap-6 md:col-span-1">
          {/* Bloque fusionado: primer artículo */}
          {(() => { const a = bloquesState[12]; if (!a || !a.articulo) return null; return (
            <div className="flex flex-col rounded-xl overflow-hidden shadow-md h-[320px] min-h-[260px] transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl">
              <div className="relative flex-1 min-h-[120px] flex flex-col justify-end">
                <Image src={a.articulo.imagen} alt={a.articulo.titulo} fill className="absolute inset-0 w-full h-full object-cover" />
                <EditButton onClick={() => handleEditar(13)} bloque={13} />
                <span className="absolute top-3 left-4 z-20 bg-white/80 text-xs font-bold text-blue-700 px-3 py-1 rounded-full shadow">{a.articulo.categoria}</span>
              </div>
              <div className="bg-blue-500 flex flex-col justify-center p-6 min-h-[80px]">
                <h2 className="text-white text-2xl font-bold mb-2">{a.articulo.titulo}</h2>
                <p className="text-white text-base mb-4">{a.articulo.descripcion_corta}</p>
                <Link href={`/articulo/${a.articulo.slug}`} className="bg-white/90 text-black font-semibold px-6 py-2 rounded-full self-start hover:bg-white transition">Leer más</Link>
              </div>
            </div>
          ); })()}
          {/* Segundo artículo */}
          {(() => { const a = bloquesState[13]; if (!a || !a.articulo) return null; return (
            <BloqueRojo articulo={a.articulo} onEdit={() => handleEditar(14)} />
          ); })()}
        </div>
        {/* Segunda columna: dos bloques apilados, cada uno dividido en dos secciones */}
        <div className="flex flex-col gap-6 md:col-span-2">
          {/* Primer bloque: azul claro izquierda, imagen derecha */}
          {(() => { const a = bloquesState[14]; if (!a || !a.articulo) return null; return (
            <div className="sm:h-[320px]">
              <BloqueHorizontal1Real articulo={a.articulo} colorFondo="bg-yellow-200" onEdit={() => handleEditar(15)} />
            </div>
          ); })()}
          {/* Segundo bloque: imagen izquierda, verde derecha (final de portada) */}
          {(() => { const a = bloquesState[15]; if (!a || !a.articulo) return null; return (
            <div className="flex flex-col sm:flex-row rounded-xl overflow-hidden shadow-md h-auto sm:h-[240px] min-h-[180px] sm:min-h-[240px] transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl">
              {/* Sección imagen (izquierda) */}
              <div className="w-full sm:w-1/2 min-h-[160px] sm:min-h-[120px] relative flex flex-col justify-end">
                <Image src={a.articulo.imagen} alt={a.articulo.titulo} fill className="object-cover w-full h-full min-h-[160px] sm:min-h-[120px] absolute inset-0" />
                <EditButton onClick={() => handleEditar(16)} bloque={16} />
                <div className="relative z-20 flex justify-center pb-4">
                  <Link href={`/articulo/${a.articulo.slug}`} className="bg-green-700 text-white font-semibold px-6 py-2 rounded-full self-center hover:bg-green-900 hover:shadow-lg transition">Leer más</Link>
                </div>
              </div>
              {/* Sección color verde (derecha) */}
              <div className="w-full sm:w-1/2 bg-green-300 flex flex-col justify-between p-4 sm:p-6 relative min-h-[120px] h-full">
                <span className="absolute top-3 left-4 z-20 bg-white/80 text-xs font-bold text-green-700 px-3 py-1 rounded-full shadow">{a.articulo.categoria}</span>
                <div className="flex-1 flex flex-col justify-center">
                  <h2 className="text-green-900 text-xl sm:text-2xl font-bold mb-2 mt-8">{a.articulo.titulo}</h2>
                  <span className="block text-xs text-green-800 font-semibold mb-1">{a.articulo.fecha}</span>
                  <p className="text-green-900 text-base sm:text-lg mb-4 break-words">{a.articulo.descripcion_corta}</p>
                </div>
              </div>
            </div>
          ); })()}
        </div>
        {/* Tercera columna: bloque único con dos secciones */}
        <div className="flex flex-col h-full min-h-0 md:col-span-1 rounded-xl overflow-hidden shadow-md transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl">
          <div className="flex flex-col h-full min-h-0 flex-1">
            <div className="relative flex-1 flex flex-col justify-end h-1/2 min-h-[180px] sm:min-h-0">
              {(() => { const a = bloquesState[16]; if (!a || !a.articulo) return null; return (
                <Image src={a.articulo.imagen} alt={a.articulo.titulo} fill className="absolute inset-0 w-full h-full object-cover min-h-[180px] sm:min-h-0" />
              ); })()}
              <EditButton onClick={() => handleEditar(17)} bloque={17} />
              <span className="absolute top-3 left-4 z-20 bg-white/80 text-xs font-bold text-blue-700 px-3 py-1 rounded-full shadow">{bloquesState[16]?.articulo?.categoria}</span>
              <div className="relative z-10 p-6 flex flex-col justify-end h-full bg-gradient-to-t from-black/60 via-black/20 to-transparent">
                <Link href={bloquesState[16]?.articulo ? `/articulo/${bloquesState[16].articulo.slug}` : "#"} className="bg-white/90 text-black font-semibold px-6 py-2 rounded-full self-start hover:bg-blue-500 hover:text-white hover:shadow-lg transition">Leer más</Link>
              </div>
            </div>
            <div className="bg-blue-500 flex flex-col justify-start p-4 sm:p-6 flex-1 h-1/2">
              <h3 className="text-blue-100 text-xl sm:text-2xl font-bold mb-1 mt-4">{bloquesState[16]?.articulo?.titulo}</h3>
              <span className="block text-xs text-blue-200 font-semibold mb-2">{bloquesState[16]?.articulo?.fecha}</span>
              <p className="text-blue-100 text-base sm:text-lg break-words">{bloquesState[16]?.articulo?.descripcion_corta}</p>
            </div>
          </div>
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
      {/* Modal de selección de artículo */}
      <ArticuloSelectorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        articulos={articulos}
        categorias={categorias}
        articuloActual={bloqueEditando ? bloquesState[bloqueEditando-1]?.articulo : null}
        onSelect={handleSelectArticulo}
        onRefetch={onRefetch}
      />
    </main>
  );
} 