"use client";

// Monochrome Liquid Glass Background Component
export default function LiquidGlassBackground() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-slate-800">
      {/* Animated monochrome liquid blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-white/20 to-gray-300/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-gray-200/15 to-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-gradient-to-r from-white/10 to-gray-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-gradient-to-l from-gray-300/15 to-white/12 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-white/8 to-gray-200/10 rounded-full blur-3xl animate-pulse delay-300"></div>
        
        {/* Additional floating elements for more animation */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-bounce delay-200"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gray-300/8 rounded-full blur-2xl animate-bounce delay-1200"></div>
        <div className="absolute top-1/4 right-1/3 w-24 h-24 bg-white/6 rounded-full blur-xl animate-ping delay-800"></div>
      </div>
      
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
      
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-20 mix-blend-overlay" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      >
      </div>
    </div>
  );
}
