

export function HeroSection() {
  return (
    <div className="relative bg-black text-white py-12 px-4 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="hellmap-gradient w-full h-full"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <div className="mb-4">
          <span className="text-6xl">🔥</span>
          <span className="text-6xl mx-4" style={{ color: 'var(--hellmap-hot-pink)' }}>HELLMAP</span>
          <span className="text-6xl">🔥</span>
        </div>
        
        <h1 
          className="text-5xl mb-6 hellmap-text-shadow"
          style={{ color: 'var(--hellmap-neon-yellow)' }}
        >
          오늘도 헬하게 살아남자
        </h1>
        
        <p className="text-xl mb-8 text-gray-300">
          당신만 겪는 일이 아니에요, 모두가 보고 있어요.
        </p>
        
        <div className="flex justify-center gap-4 text-4xl">
          <span className="animate-bounce">😱</span>
          <span className="animate-bounce delay-150">😡</span>
          <span className="animate-bounce delay-300">🤣</span>
        </div>
      </div>
    </div>
  );
}