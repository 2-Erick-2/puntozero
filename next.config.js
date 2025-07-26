module.exports = {
  eslint: {
    // Warning: Esto permite que el build de producción termine aunque haya errores de ESLint.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hveqfsdzisitbsvyjevj.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}; 