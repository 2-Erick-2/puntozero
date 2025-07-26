"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const [openMenu, setOpenMenu] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  // Para swipe
  const menuTouch = useRef({ x: 0, y: 0 });
  const searchTouch = useRef({ x: 0, y: 0 });

  const session = useSession();
  const supabase = useSupabaseClient();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  // Solo mostrar el botón en /admin o /login y si hay sesión
  const showLogout = session && (pathname.startsWith('/admin') || pathname.startsWith('/login'));

  // Handlers para swipe en menú hamburguesa
  const handleMenuTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    menuTouch.current.x = e.touches[0].clientX;
    menuTouch.current.y = e.touches[0].clientY;
  };
  const handleMenuTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const dx = e.changedTouches[0].clientX - menuTouch.current.x;
    if (dx > 60) setOpenMenu(false); // swipe derecha
  };

  // Handlers para swipe en panel de búsqueda
  const handleSearchTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    searchTouch.current.x = e.touches[0].clientX;
    searchTouch.current.y = e.touches[0].clientY;
  };
  const handleSearchTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const dx = e.changedTouches[0].clientX - searchTouch.current.x;
    if (dx < -60) setOpenSearch(false); // swipe izquierda
  };

  return (
    <header className="w-full flex items-center justify-between py-4 px-4 sm:px-8 bg-white shadow-md sticky top-0 z-50 relative">
      {/* Menú hamburguesa a la izquierda en móvil */}
      <div className="flex items-center w-1/3 sm:w-auto">
        <div className="sm:hidden flex items-center">
          <button onClick={() => setOpenMenu(!openMenu)} className="focus:outline-none">
            <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      {/* Logo perfectamente centrado en móvil usando absolute */}
      <div className="flex-1 flex justify-center sm:justify-start relative">
        <Image src="/logo-puntozero.png" alt="Logo Puntozero" width={120} height={40} className="h-10 w-auto object-contain mx-auto sm:static absolute left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-0 top-1/2 -translate-y-1/2 sm:top-auto sm:translate-y-0" />
      </div>
      {/* Lupa a la derecha en móvil */}
      <div className="flex items-center w-1/3 justify-end sm:hidden">
        <button className="focus:outline-none" onClick={() => setOpenSearch(true)}>
          <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>
      {/* Menú horizontal en desktop */}
      <nav className="hidden sm:flex gap-6 flex-1 justify-center">
        <Link href="/" className="text-lg font-semibold text-black hover:text-blue-600 transition-colors">Inicio</Link>
        <Link href="/articulos" className="text-lg font-semibold text-black hover:text-blue-600 transition-colors">Artículos</Link>
        <Link href="/contacto" className="text-lg font-semibold text-black hover:text-blue-600 transition-colors">Contacto</Link>
      </nav>
      <form className="hidden sm:flex items-center flex-1 justify-end" action="/buscar" method="get">
        <input
          type="text"
          name="q"
          placeholder="Buscar artículos..."
          className="border rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 transition-colors">Buscar</button>
      </form>
      {/* Menú desplegable en móvil con animación moderna y swipe */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${openMenu ? 'visible opacity-100' : 'invisible opacity-0'}`} style={{background: openMenu ? 'rgba(0,0,0,0.25)' : 'transparent'}} onClick={() => setOpenMenu(false)}>
        <div
          className={`absolute top-0 left-0 w-4/5 max-w-xs h-full bg-white shadow-2xl transform transition-transform duration-300 ${openMenu ? 'translate-x-0' : '-translate-x-full'} flex flex-col items-start gap-4 py-8 px-6`}
          onClick={e => e.stopPropagation()}
          onTouchStart={handleMenuTouchStart}
          onTouchEnd={handleMenuTouchEnd}
        >
          <button onClick={() => setOpenMenu(false)} className="mb-4 self-end">
            <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <Link href="/" className="text-lg font-semibold text-black hover:text-blue-600 transition-colors w-full">Inicio</Link>
          <Link href="/articulos" className="text-lg font-semibold text-black hover:text-blue-600 transition-colors w-full">Artículos</Link>
          <Link href="/contacto" className="text-lg font-semibold text-black hover:text-blue-600 transition-colors w-full">Contacto</Link>
        </div>
      </div>
      {/* Panel de búsqueda slide-in desde la derecha en móvil con swipe */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${openSearch ? 'visible opacity-100' : 'invisible opacity-0'}`} style={{background: openSearch ? 'rgba(0,0,0,0.25)' : 'transparent'}} onClick={() => setOpenSearch(false)}>
        <div
          className={`absolute top-0 right-0 w-4/5 max-w-xs h-full bg-white shadow-2xl transform transition-transform duration-300 ${openSearch ? 'translate-x-0' : 'translate-x-full'} flex flex-col items-start gap-4 py-8 px-6`}
          onClick={e => e.stopPropagation()}
          onTouchStart={handleSearchTouchStart}
          onTouchEnd={handleSearchTouchEnd}
        >
          <button onClick={() => setOpenSearch(false)} className="mb-4 self-end">
            <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <form action="/buscar" method="get" className="w-full">
            <input
              type="text"
              name="q"
              placeholder="Buscar artículos..."
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoFocus
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded mt-2 hover:bg-blue-700 transition-colors"
            >
              Buscar
            </button>
          </form>
        </div>
      </div>
      {showLogout && (
        <button
          onClick={handleLogout}
          className="fixed top-4 right-4 z-50 bg-pink-700 text-white px-4 py-2 rounded shadow hover:bg-pink-800 transition"
        >
          Cerrar sesión
        </button>
      )}
    </header>
  );
} 