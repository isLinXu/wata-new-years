
import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Image as ImageIcon, MessageSquare, Star, Trash2, Plus, RefreshCw, ChevronLeft, ChevronRight, X, Heart, BookOpen, Coffee } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppConfig, Wish, Photo } from './types';
import { DEFAULT_GREETINGS, BACKGROUND_PRESETS, WISH_COLORS } from './constants';
import { generateSmartGreeting } from './geminiService';

const App: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>({
    targetDate: '2026-01-01T00:00:00',
    backgroundUrl: BACKGROUND_PRESETS[0],
    currentGreeting: DEFAULT_GREETINGS[0],
    greetingInterval: 8000,
    autoPlayPhoto: true,
  });

  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isCelebration, setIsCelebration] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newWishText, setNewWishText] = useState('');
  const [activeTab, setActiveTab] = useState<'countdown' | 'photos' | 'wishes'>('countdown');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const calculateTimeLeft = useCallback(() => {
    const difference = +new Date(config.targetDate) - +new Date();
    if (difference > 0) {
      setTimeLeft({
        d: Math.floor(difference / (1000 * 60 * 60 * 24)),
        h: Math.floor((difference / (1000 * 60 * 60)) % 24),
        m: Math.floor((difference / 1000 / 60) % 60),
        s: Math.floor((difference / 1000) % 60),
      });
      if (isCelebration) setIsCelebration(false);
    } else {
      setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
      if (!isCelebration) {
        setIsCelebration(true);
        triggerConfetti();
      }
    }
  }, [config.targetDate, isCelebration]);

  useEffect(() => {
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  useEffect(() => {
    const greetingTimer = setInterval(() => {
      setConfig(prev => ({
        ...prev,
        currentGreeting: DEFAULT_GREETINGS[Math.floor(Math.random() * DEFAULT_GREETINGS.length)]
      }));
    }, config.greetingInterval);
    return () => clearInterval(greetingTimer);
  }, [config.greetingInterval]);

  useEffect(() => {
    if (config.autoPlayPhoto && photos.length > 1) {
      const photoTimer = setInterval(() => {
        setCurrentPhotoIndex(prev => (prev + 1) % photos.length);
      }, 5000);
      return () => clearInterval(photoTimer);
    }
  }, [config.autoPlayPhoto, photos.length]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 200,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#d4af37', '#ffffff', '#1b3022']
    });
  };

  const handleAddWish = () => {
    if (!newWishText.trim()) return;
    const newWish: Wish = {
      id: Date.now().toString(),
      content: newWishText,
      color: WISH_COLORS[Math.floor(Math.random() * WISH_COLORS.length)],
      createdAt: Date.now(),
    };
    setWishes([newWish, ...wishes]);
    setNewWishText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    (Array.from(files) as File[]).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newPhoto: Photo = {
            id: Math.random().toString(36).substr(2, 9),
            url: event.target.result as string,
            name: file.name
          };
          setPhotos(prev => [...prev, newPhoto]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSmartGreeting = async () => {
    setIsGenerating(true);
    const greeting = await generateSmartGreeting("关于时间、哲学、新年的感悟");
    setConfig(prev => ({ ...prev, currentGreeting: greeting }));
    setIsGenerating(false);
  };

  const CountdownDisplay = () => (
    <div className="flex flex-col items-center justify-center space-y-12 animate-in fade-in duration-1000">
      <div className="text-center space-y-2">
        <h3 className="font-serif-title text-xl text-gold tracking-widest italic opacity-80">WATA COMMUNITY TAVERN</h3>
        <h2 className="font-serif-title text-4xl md:text-6xl font-black text-white drop-shadow-2xl">
          2026 纪元倒计时
        </h2>
      </div>
      
      <div className="flex space-x-4 md:space-x-10">
        {[
          { label: 'Days', val: timeLeft.d },
          { label: 'Hours', val: timeLeft.h },
          { label: 'Min', val: timeLeft.m },
          { label: 'Sec', val: timeLeft.s }
        ].map((item, idx) => (
          <div key={idx} className="flex flex-col items-center group">
            <div className="brass-border rounded-lg bg-[#2c1b18] w-20 h-28 md:w-36 md:h-48 flex items-center justify-center mb-4 transition-transform group-hover:scale-105 duration-500">
              <span className="font-serif-title text-5xl md:text-8xl font-black text-gold">
                {String(item.val).padStart(2, '0')}
              </span>
            </div>
            <span className="font-serif-title text-xs md:text-sm uppercase tracking-[0.3em] text-gold/60">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center max-w-3xl px-8 relative">
        <div className="absolute -left-4 -top-4 text-gold opacity-20"><BookOpen size={48}/></div>
        <p className="font-serif-title text-2xl md:text-3xl italic text-[#f4ece1] leading-relaxed transition-all duration-700 min-h-[5rem]">
          “ {config.currentGreeting} ”
        </p>
        <button 
          onClick={handleSmartGreeting}
          disabled={isGenerating}
          className="mt-8 flex items-center space-x-2 mx-auto px-6 py-2 rounded-full border border-gold/30 hover:border-gold hover:bg-gold/10 transition-all text-xs text-gold disabled:opacity-50"
        >
          <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
          <span className="tracking-widest uppercase">学术灵感注入</span>
        </button>
      </div>
    </div>
  );

  const PhotoWall = () => (
    <div className="w-full max-w-6xl mx-auto px-4 py-12 animate-in zoom-in-95">
      <div className="flex justify-between items-end mb-12 border-b border-gold/20 pb-6">
        <div>
          <h2 className="font-serif-title text-4xl font-bold text-gold mb-2 italic">回忆沙龙</h2>
          <p className="text-white/40 tracking-wider">瓦塔社区那些闪光的瞬间</p>
        </div>
        <label className="cursor-pointer glass-panel border border-gold/40 px-8 py-3 rounded-md hover:bg-gold/10 transition-all flex items-center space-x-3 text-gold">
          <Plus size={20} />
          <span className="font-serif-title tracking-widest uppercase text-sm">收录瞬间</span>
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>

      {photos.length === 0 ? (
        <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-gold/10 rounded-xl bg-black/20">
          <ImageIcon size={48} className="text-gold/20 mb-4" />
          <p className="text-gold/30 tracking-widest">尚无历史影像记录</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 relative group rounded-xl overflow-hidden shadow-2xl brass-border p-2 bg-[#1a1412]">
            <div className="aspect-video relative overflow-hidden rounded-lg">
              {photos.map((photo, index) => (
                <img
                  key={photo.id}
                  src={photo.url}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${index === currentPhotoIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
                  alt={photo.name}
                />
              ))}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                <span className="font-serif-title text-gold text-sm tracking-[0.2em]">{photos[currentPhotoIndex].name.toUpperCase()}</span>
              </div>
            </div>
            <button onClick={() => setCurrentPhotoIndex(prev => (prev - 1 + photos.length) % photos.length)} className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-gold/20 text-gold transition-all opacity-0 group-hover:opacity-100"><ChevronLeft size={24} /></button>
            <button onClick={() => setCurrentPhotoIndex(prev => (prev + 1) % photos.length)} className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-gold/20 text-gold transition-all opacity-0 group-hover:opacity-100"><ChevronRight size={24} /></button>
          </div>
          
          <div className="grid grid-cols-3 lg:grid-cols-2 gap-4 h-fit max-h-[600px] overflow-y-auto pr-2">
            {photos.map((photo, index) => (
              <div 
                key={photo.id}
                onClick={() => setCurrentPhotoIndex(index)}
                className={`relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all ${index === currentPhotoIndex ? 'border-gold scale-105' : 'border-transparent opacity-40 hover:opacity-100'}`}
              >
                <img src={photo.url} className="w-full h-full object-cover" />
                <button 
                  onClick={(e) => { e.stopPropagation(); setPhotos(photos.filter(p => p.id !== photo.id)); }}
                  className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const WishBoard = () => (
    <div className="w-full max-w-5xl mx-auto px-4 py-12">
      <div className="chalk-board p-8 md:p-12 rounded-lg relative shadow-inner">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="border-l-4 border-gold/40 pl-6">
            <h2 className="font-serif-title text-4xl font-bold text-white mb-2">黑板留言板</h2>
            <p className="text-white/40 font-mono text-sm tracking-tighter">POST-IT YOUR VISIONS FOR 2026</p>
          </div>
          <div className="flex gap-0 group shadow-xl">
            <input
              type="text"
              value={newWishText}
              onChange={(e) => setNewWishText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddWish()}
              placeholder="书写你的2026愿景..."
              className="bg-white/10 text-white placeholder-white/30 px-6 py-3 border border-white/20 focus:outline-none focus:border-gold w-full md:w-80"
            />
            <button 
              onClick={handleAddWish}
              className="bg-gold hover:bg-[#b8962d] text-[#1a1412] px-6 transition-all"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {wishes.map((wish) => (
            <div 
              key={wish.id} 
              className={`${wish.color} p-4 shadow-lg transform rotate-${(Math.random()*4-2).toFixed(1)} hover:scale-110 hover:rotate-0 transition-all duration-300 min-h-[140px] flex flex-col justify-between border-t-8 border-black/10`}
              style={{ transform: `rotate(${(Math.random() * 6 - 3).toFixed(1)}deg)` }}
            >
              <div className="w-full h-2 flex justify-center -mt-6 mb-4">
                <div className="w-4 h-4 rounded-full bg-red-800 border border-white/30 shadow-md"></div>
              </div>
              <p className="text-gray-800 font-bold text-sm leading-snug">
                {wish.content}
              </p>
              <div className="flex justify-between items-center mt-3 border-t border-black/5 pt-2">
                <span className="text-black/30 text-[10px] uppercase font-bold">{new Date(wish.createdAt).toLocaleDateString()}</span>
                <Heart size={10} className="text-red-700" fill="currentColor" />
              </div>
              <button 
                onClick={() => setWishes(wishes.filter(w => w.id !== wish.id))}
                className="absolute -top-1 -right-1 opacity-0 hover:opacity-100 text-black/20"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full relative overflow-hidden transition-all duration-1000 bg-cover bg-fixed bg-center" style={{ backgroundImage: `linear-gradient(rgba(26,20,18,0.85), rgba(26,20,18,0.95)), url(${config.backgroundUrl})` }}>
      
      {/* Brand Header */}
      <header className="fixed top-0 left-0 right-0 z-40 px-10 py-6 flex justify-between items-center bg-transparent">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-sm brass-border bg-[#2c1b18] flex items-center justify-center font-serif-title text-2xl text-gold shadow-2xl">W</div>
          <div className="hidden sm:block">
            <h1 className="font-serif-title text-xl font-bold tracking-[0.2em] text-gold">WATA TAVERN</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-40">Academic Community Lounge</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center space-x-12">
          {[
            { id: 'countdown', label: '紀元', icon: Star },
            { id: 'photos', label: '沙龍', icon: ImageIcon },
            { id: 'wishes', label: '冥想', icon: MessageSquare }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`font-serif-title text-sm tracking-[0.3em] uppercase transition-all flex items-center space-x-2 ${activeTab === item.id ? 'text-gold' : 'text-white/40 hover:text-white'}`}
            >
              <span className={activeTab === item.id ? 'opacity-100' : 'opacity-0'}>◈</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-md border border-gold/20 hover:border-gold/60 text-gold/60 hover:text-gold transition-all"
        >
          <Settings size={20} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="pt-40 pb-32 min-h-screen flex flex-col items-center">
        {activeTab === 'countdown' && <CountdownDisplay />}
        {activeTab === 'photos' && <PhotoWall />}
        {activeTab === 'wishes' && <WishBoard />}
      </main>

      {/* Decorative Overlays */}
      <div className="fixed inset-0 pointer-events-none opacity-5 mix-blend-overlay" style={{ backgroundImage: 'url(https://www.transparenttextures.com/patterns/pinstriped-suit.png)' }}></div>
      
      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="glass-panel border border-gold/40 rounded-full flex space-x-8 px-8 py-3 shadow-2xl">
          {[
            { id: 'countdown', icon: Star },
            { id: 'photos', icon: ImageIcon },
            { id: 'wishes', icon: MessageSquare }
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`${activeTab === item.id ? 'text-gold' : 'text-white/40'}`}>
              <item.icon size={20} />
            </button>
          ))}
        </div>
      </div>

      {/* Celebration */}
      {isCelebration && (
        <div className="absolute inset-0 z-50 pointer-events-none bg-black/60 flex items-center justify-center animate-in fade-in duration-1000">
          <div className="text-center space-y-6">
            <h1 className="font-serif-title text-[10rem] font-black text-gold drop-shadow-2xl animate-pulse">2026</h1>
            <p className="font-serif-title text-4xl text-white tracking-[0.5em] italic">A NEW ERA BEGINS AT WATA</p>
            <div className="flex justify-center space-x-4 text-gold/40 font-serif-title italic">
               <span>◈ RATIONALITY</span>
               <span>◈ ELEGANCE</span>
               <span>◈ COMMUNITY</span>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)} />
          <div className="relative w-full max-w-sm h-full bg-[#1a1412] border-l border-gold/20 p-10 shadow-2xl animate-in slide-in-from-right duration-500">
            <div className="flex justify-between items-center mb-12 border-b border-gold/10 pb-6">
              <h3 className="font-serif-title text-2xl font-bold text-gold flex items-center gap-3">
                <Settings size={20}/> <span>配置館藏</span>
              </h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-gold/40 hover:text-gold"><X size={24} /></button>
            </div>

            <div className="space-y-10">
              <div>
                <label className="text-xs uppercase tracking-widest text-gold/50 mb-4 block">重塑時間坐標</label>
                <input
                  type="datetime-local"
                  value={config.targetDate}
                  onChange={(e) => setConfig({ ...config, targetDate: e.target.value })}
                  className="w-full bg-black/40 border border-gold/20 p-3 text-gold text-sm rounded focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-gold/50 mb-4 block">空間氛围預設</label>
                <div className="grid grid-cols-2 gap-3">
                  {BACKGROUND_PRESETS.map((url, i) => (
                    <button key={i} onClick={() => setConfig({ ...config, backgroundUrl: url })} className={`h-20 rounded border-2 overflow-hidden transition-all ${config.backgroundUrl === url ? 'border-gold' : 'border-transparent opacity-40 hover:opacity-100'}`}><img src={url} className="w-full h-full object-cover" /></button>
                  ))}
                </div>
              </div>

              <div className="pt-10 border-t border-gold/10">
                 <button onClick={() => { if(confirm('確定要封存所有館藏數據嗎？')) { setPhotos([]); setWishes([]); setIsSettingsOpen(false); } }} className="w-full py-4 text-xs tracking-widest uppercase border border-red-900/40 text-red-900 hover:bg-red-900/10 transition-all font-bold">封存當前數據</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
