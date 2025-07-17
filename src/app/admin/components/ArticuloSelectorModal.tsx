"use client";
import { useEffect, useState } from "react";

export default function ArticuloSelectorModal({
  open,
  onClose,
  articulos,
  categorias,
  articuloActual,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  articulos: any[];
  categorias: string[];
  articuloActual: any;
  onSelect: (articulo: any) => void;
}) {
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("");
  const [orden, setOrden] = useState("creado"); // "creado" o "modificado"
  const [seleccionado, setSeleccionado] = useState<any>(null);
  const [articulosFiltrados, setArticulosFiltrados] = useState<any[]>([]);

  useEffect(() => {
    let filtrados = articulos;
    if (busqueda) {
      filtrados = filtrados.filter(a =>
        a.titulo.toLowerCase().includes(busqueda.toLowerCase())
      );
    }
    if (categoria) {
      filtrados = filtrados.filter(a => a.categoria === categoria);
    }
    filtrados = [...filtrados].sort((a, b) => {
      if (orden === "creado") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });
    setArticulosFiltrados(filtrados);
  }, [busqueda, categoria, orden, articulos]);

  useEffect(() => {
    setSeleccionado(null);
    setBusqueda("");
    setCategoria("");
    setOrden("creado");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 relative animate-fadeIn">
        {/* Botón cerrar */}
        <button
          className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-red-600 font-bold"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        {/* Artículo actual */}
        <div className="mb-6">
          <div className="text-xs text-gray-500 mb-1">Artículo actual de este bloque:</div>
          <div className="flex items-center gap-4 p-3 bg-gray-100 rounded">
            {articuloActual?.imagen && (
              <img src={articuloActual.imagen} alt={articuloActual.titulo} className="w-16 h-16 object-cover rounded" />
            )}
            <div>
              <div className="font-bold text-lg">{articuloActual?.titulo}</div>
              <div className="text-xs text-gray-600">{articuloActual?.categoria} | {articuloActual?.fecha}</div>
            </div>
          </div>
        </div>
        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Buscar por título..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="border rounded px-3 py-2 w-full md:w-1/2"
          />
          <select
            value={categoria}
            onChange={e => setCategoria(e.target.value)}
            className="border rounded px-3 py-2 w-full md:w-1/4"
          >
            <option value="">Todas las categorías</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={orden}
            onChange={e => setOrden(e.target.value)}
            className="border rounded px-3 py-2 w-full md:w-1/4"
          >
            <option value="creado">Último creado</option>
            <option value="modificado">Último modificado</option>
          </select>
        </div>
        {/* Lista de artículos */}
        <div className="max-h-64 overflow-y-auto border rounded divide-y">
          {articulosFiltrados.length === 0 && (
            <div className="p-4 text-center text-gray-500">No hay artículos que coincidan.</div>
          )}
          {articulosFiltrados.map(a => (
            <div
              key={a.id}
              className={`flex items-center gap-4 p-3 cursor-pointer transition-colors ${seleccionado?.id === a.id ? 'bg-red-100' : 'hover:bg-gray-100'}`}
              onClick={() => setSeleccionado(a)}
            >
              {a.imagen && (
                <img src={a.imagen} alt={a.titulo} className="w-12 h-12 object-cover rounded" />
              )}
              <div className="flex-1">
                <div className="font-semibold">{a.titulo}</div>
                <div className="text-xs text-gray-600">{a.categoria} | {a.fecha}</div>
              </div>
              {seleccionado?.id === a.id && (
                <span className="text-red-600 font-bold">✓</span>
              )}
            </div>
          ))}
        </div>
        {/* Botón guardar */}
        {seleccionado && seleccionado.id !== articuloActual?.id && (
          <button
            className="mt-6 w-full bg-red-700 text-white py-2 rounded font-bold hover:bg-red-800 transition"
            onClick={() => {
              onSelect(seleccionado);
              onClose();
            }}
          >
            Guardar
          </button>
        )}
      </div>
    </div>
  );
} 