import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    // Refresca la sesión si es necesario para mantener las cookies activas
    await supabase.auth.getSession()

    return res
}

// Especifica en qué rutas debe correr el middleware
export const config = {
    matcher: [
        '/admin/:path*',
        '/login',
    ],
}
