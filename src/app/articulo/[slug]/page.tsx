"use client";
import Image from "next/image";
import Link from "next/link";

// Mock de datos de ejemplo
const articulo = {
  titulo: "Tendencias Primavera 2024",
  categoria: "MODA",
  fecha: "16 JUL 2024",
  imagen: "/slider1.jpg",
  contenido: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, nisi eu consectetur consectetur, nisl nisi consectetur nisi, euismod euismod nisi nisi euismod. Pellentesque euismod, nisi eu consectetur consectetur, nisl nisi consectetur nisi, euismod euismod nisi nisi euismod. Pellentesque euismod, nisi eu consectetur consectetur, nisl nisi consectetur nisi, euismod euismod nisi nisi euismod.`
};

const relacionados = [
  {
    titulo: "Colores y Texturas 2024",
    categoria: "MODA",
    imagen: "/slider2.jpg",
    slug: "colores-texturas-2024"
  },
  {
    titulo: "Accesorios imprescindibles",
    categoria: "MODA",
    imagen: "/slider3.jpg",
    slug: "accesorios-imprescindibles"
  },
  {
    titulo: "Estilo urbano",
    categoria: "MODA",
    imagen: "/slider1.jpg",
    slug: "estilo-urbano"
  }
];

export default function ArticuloPage() {
  return (
    <main className="bg-white min-h-screen pb-16">
      {/* Banner principal */}
      <section className="relative w-full h-[320px] md:h-[480px] flex items-center justify-center overflow-hidden mb-10">
        <Image src={articulo.imagen} alt={articulo.titulo} fill priority className="object-cover w-full h-full absolute inset-0" />
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center bg-gradient-to-t from-black/70 via-black/30 to-transparent">
          <span className="text-white text-xs font-bold uppercase mb-4 bg-black/60 px-4 py-2 rounded-full shadow">{articulo.categoria}</span>
          <h1 className="text-white text-4xl md:text-6xl font-extrabold text-center drop-shadow-lg mb-2 px-4">{articulo.titulo}</h1>
          <span className="text-white/80 text-sm font-semibold">{articulo.fecha}</span>
        </div>
      </section>
      {/* Contenido del artículo */}
      <section className="max-w-3xl mx-auto w-full px-4 md:px-0 mb-16">
        <article className="prose prose-lg max-w-none text-neutral-900">
          <p>{articulo.contenido}</p>
          <p>{articulo.contenido}</p>
          <p>{articulo.contenido}</p>
        </article>
      </section>
      {/* Artículos relacionados */}
      <section className="max-w-6xl mx-auto w-full px-4 md:px-0">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-neutral-900">Artículos relacionados</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {relacionados.map((rel) => (
            <Link href={`/articulo/${rel.slug}`} key={rel.slug} className="group rounded-xl overflow-hidden shadow-md bg-white flex flex-col transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl">
              <div className="relative w-full h-48">
                <Image src={rel.imagen} alt={rel.titulo} fill className="object-cover w-full h-full" />
                <span className="absolute top-3 left-4 z-20 bg-white/80 text-xs font-bold text-pink-700 px-3 py-1 rounded-full shadow">{rel.categoria}</span>
              </div>
              <div className="p-6 flex flex-col flex-1 justify-between">
                <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-pink-700 transition-colors">{rel.titulo}</h3>
                <span className="text-xs text-neutral-500 font-semibold">{rel.categoria}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
} 