"use client";
import { useState, useRef } from 'react';
import { createSupabaseBrowser } from '../supabaseClient';

function slugify(text: string) {
  return text
    .toString()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function CrearArticuloModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  const [categoria, setCategoria] = useState('');
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [imagenFile, setImagenFile] = useState<File|null>(null);
  const [imagenPreview, setImagenPreview] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Limpiar formulario al cerrar
  const handleClose = () => {
    setCategoria(''); setTitulo(''); setContenido(''); setImagenFile(null); setImagenPreview(null); setLoading(false); onClose();
  };

  // Preview imagen
  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImagenFile(file || null);
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setImagenPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagenPreview(null);
    }
  };

  // Guardar artículo
  const handleGuardar = async () => {
    if (!categoria.trim() || !titulo.trim() || !contenido.trim() || !imagenFile) {
      alert('Completa todos los campos y selecciona una imagen.');
      return;
    }
    setLoading(true);
    const categoriaMayus = categoria.trim().toUpperCase();
    const slug = slugify(titulo);
    const descripcion_corta = contenido.replace(/<[^>]+>/g, '').slice(0, 120);
    const fecha = new Date();
    const fechaStr = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    const created_at = fecha.toISOString();
    const updated_at = created_at;
    let imagenUrl = '';
    try {
      // Subir imagen a Supabase Storage
      const supabase = createSupabaseBrowser();
      const fileExt = imagenFile.name.split('.').pop();
      const fileName = `${slug}-${Date.now()}.${fileExt}`;
      const { data: imgData, error: imgError } = await supabase.storage.from('articulos').upload(fileName, imagenFile, { upsert: true });
      console.log('Resultado upload imagen:', imgData, imgError);
      if (imgError) {
        alert('Error al subir imagen: ' + (imgError.message || JSON.stringify(imgError)));
        throw imgError;
      }
      const { data: urlData } = supabase.storage.from('articulos').getPublicUrl(fileName);
      imagenUrl = urlData.publicUrl;
      // Insertar artículo
      const { data, error } = await supabase.from('articulos').insert([{
        titulo,
        slug,
        categoria: categoriaMayus,
        imagen: imagenUrl,
        descripcion_corta,
        fecha: fechaStr,
        created_at,
        updated_at,
        contenido
      }]);
      console.log('Resultado insert articulo:', data, error);
      if (error) throw error;
      alert('Artículo creado correctamente.');
      handleClose();
    } catch (err: any) {
      console.error('Error al guardar artículo:', err);
      alert('Error al guardar el artículo: ' + (err.message || err));
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-8 relative animate-fadeIn">
        <button
          className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-red-600 font-bold"
          onClick={handleClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-6 text-red-700">Crear Artículo</h2>
        {/* Selector/creador de categoría (mayúsculas) */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Categoría</label>
          <input type="text" className="border rounded px-3 py-2 w-full uppercase" placeholder="Escribe o selecciona una categoría" value={categoria} onChange={e => setCategoria(e.target.value.toUpperCase())} />
        </div>
        {/* Título */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Título</label>
          <input type="text" className="border rounded px-3 py-2 w-full" placeholder="Título del artículo" value={titulo} onChange={e => setTitulo(e.target.value)} />
        </div>
        {/* Editor de texto enriquecido sencillo */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Contenido</label>
          <textarea className="border rounded px-3 py-2 w-full min-h-[300px] max-h-[400px] font-sans resize-y overflow-auto" placeholder="Contenido del artículo" value={contenido} onChange={e => setContenido(e.target.value)} />
        </div>
        {/* Uploader de imagen */}
        <div className="mb-6">
          <label className="block font-semibold mb-1">Imagen</label>
          <input type="file" accept="image/*" className="block mb-2" ref={fileInputRef} onChange={handleImagenChange} />
          {imagenPreview && <img src={imagenPreview} alt="Preview" className="max-h-40 rounded shadow" />}
        </div>
        <button disabled={loading} onClick={handleGuardar} className="w-full bg-red-700 text-white py-2 rounded font-bold hover:bg-red-800 transition disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? 'Guardando...' : 'Guardar Artículo'}
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [openMenu, setOpenMenu] = useState(false);
  const [modalCrear, setModalCrear] = useState(false);
  return (
    <>
      <header className="w-full flex items-center justify-between py-4 px-4 bg-white shadow-md sticky top-0 z-50">
        <span className="font-bold text-lg text-gray-700">Panel Admin</span>
        <div className="relative">
          <button
            onClick={() => setOpenMenu((v) => !v)}
            className="text-red-600 font-bold px-4 py-2 rounded hover:bg-red-50 transition"
            aria-label="Abrir menú de herramientas"
          >
            Herramientas
          </button>
          {openMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-50">
              <button
                className="block w-full text-left px-4 py-2 text-black hover:bg-red-100 hover:text-red-700 transition-colors"
                onClick={() => { setModalCrear(true); setOpenMenu(false); }}
              >
                Crear Artículo
              </button>
            </div>
          )}
        </div>
      </header>
      <CrearArticuloModal open={modalCrear} onClose={() => setModalCrear(false)} />
      <main>{children}</main>
    </>
  );
} 