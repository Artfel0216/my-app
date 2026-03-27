"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Great_Vibes } from "next/font/google";

const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400" });

// ==========================================
// CONFIGURAÇÕES
// ==========================================
const PUZZLE_PHOTO_URL = "/Lv7.jpg"; 
const GRID_SIZE = 3; 
const TILE_COUNT = GRID_SIZE * GRID_SIZE;
const DATA_SENHA = "15/11/2025"; 

// FRASE DOS BALÕES
const BALLOON_SECRET_PHRASE = "Você,é,o,amor,da,minha,vida";
const BALOES_FRASES = BALLOON_SECRET_PHRASE.split(',');

// DATA DA CÁPSULA DO TEMPO
const DATA_CAPSULA = "2026-11-15T00:00:00";

// ==========================================
// COMPONENTE: CHUVA DE CORAÇÕES
// ==========================================
const FloatingHearts = () => {
  const [particles, setParticles] = useState<{ id: number; left: number; delay: number; duration: number; size: number; symbol: string }[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, 
      delay: Math.random() * 10, 
      duration: 10 + Math.random() * 15, 
      size: 15 + Math.random() * 20, 
      symbol: ['💖', '🤍', '✨', '🌸', '💕'][Math.floor(Math.random() * 5)]
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: -50, opacity: 0, rotate: 0 }}
          animate={{ y: '110vh', x: Math.random() * 100 - 50, opacity: [0, 1, 1, 0], rotate: 360 }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
          style={{ position: 'absolute', left: `${p.left}vw`, fontSize: `${p.size}px` }}
        >
          {p.symbol}
        </motion.div>
      ))}
    </div>
  );
};

export default function Home() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Estados
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passInput, setPassInput] = useState("");
  const [passError, setPassError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCinemaMode, setIsCinemaMode] = useState(false); 

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [timeTogether, setTimeTogether] = useState({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isBirthday, setIsBirthday] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [heartbeat, setHeartbeat] = useState(false);
  const [openLetter, setOpenLetter] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [motivoAtual, setMotivoAtual] = useState<string | null>(null);

  // Estados do Quebra-cabeça e Balões
  const [tiles, setTiles] = useState<number[]>([]);
  const [isPuzzleSolved, setIsPuzzleSolved] = useState(false);
  const [puzzleStarted, setPuzzleStarted] = useState(false);
  const [poppedBalloons, setPoppedBalloons] = useState<boolean[]>(new Array(BALOES_FRASES.length).fill(false));

  // Estados da Cápsula do Tempo
  const [capsuleShake, setCapsuleShake] = useState(false);
  const [capsuleErrorMsg, setCapsuleErrorMsg] = useState(false);
  const [openCapsuleMessage, setOpenCapsuleMessage] = useState(false);

  // Lógicas de Interface
  const handleUnlock = () => {
    if (passInput === DATA_SENHA || passInput.replace(/\D/g, "") === "15112025") {
      setIsUnlocked(true);
      if (audioRef.current) audioRef.current.play().catch(() => {});
    } else {
      setPassError(true);
      setTimeout(() => setPassError(false), 2000);
    }
  };

  const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ""); 
    if (val.length > 2) val = val.slice(0, 2) + "/" + val.slice(2);
    if (val.length > 5) val = val.slice(0, 5) + "/" + val.slice(5, 9);
    setPassInput(val);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) { audioRef.current.play(); setIsMuted(false); } 
      else { audioRef.current.pause(); setIsMuted(true); }
    }
  };

  const handleVideoPlay = () => {
    setIsCinemaMode(true);
    if (audioRef.current && !isMuted) { audioRef.current.pause(); setIsMuted(true); }
  };

  const handleVideoPause = () => setIsCinemaMode(false);

  const popBalloon = (index: number) => {
    if (!poppedBalloons[index]) {
      const newPopped = [...poppedBalloons];
      newPopped[index] = true;
      setPoppedBalloons(newPopped);
    }
  };

  const checkSolved = useCallback((currentTiles: number[]) => {
    for (let i = 0; i < TILE_COUNT - 1; i++) { if (currentTiles[i] !== i) return false; } return true;
  }, []);

  const moveTile = (index: number) => {
    if (isPuzzleSolved || !puzzleStarted) return;
    const emptyIndex = tiles.indexOf(TILE_COUNT - 1);
    const row = Math.floor(index / GRID_SIZE); const col = index % GRID_SIZE;
    const emptyRow = Math.floor(emptyIndex / GRID_SIZE); const emptyCol = emptyIndex % GRID_SIZE;
    const isAdjacent = (Math.abs(row - emptyRow) === 1 && col === emptyCol) || (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (isAdjacent) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);
      if (checkSolved(newTiles)) setIsPuzzleSolved(true);
    }
  };

  const shufflePuzzle = useCallback(() => {
    let currentTiles = Array.from(Array(TILE_COUNT).keys());
    let emptyIndex = TILE_COUNT - 1;
    for (let i = 0; i < 200; i++) {
      const row = Math.floor(emptyIndex / GRID_SIZE); const col = emptyIndex % GRID_SIZE;
      let possibleMoves: number[] = [];
      if (row > 0) possibleMoves.push(emptyIndex - GRID_SIZE); if (row < GRID_SIZE - 1) possibleMoves.push(emptyIndex + GRID_SIZE);
      if (col > 0) possibleMoves.push(emptyIndex - 1); if (col < GRID_SIZE - 1) possibleMoves.push(emptyIndex + 1);
      const moveIndex = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      [currentTiles[emptyIndex], currentTiles[moveIndex]] = [currentTiles[moveIndex], currentTiles[emptyIndex]];
      emptyIndex = moveIndex;
    }
    setTiles(currentTiles); setIsPuzzleSolved(false); setPuzzleStarted(true);
  }, [checkSolved]);

  useEffect(() => { setTiles(Array.from(Array(TILE_COUNT).keys())); }, []);

  const gerarNovoMotivo = () => {
    const motivosParaAmar = [ "Pelo seu sorriso lindo logo de manhã.", "Porque você me entende só com um olhar.", "Pelo seu abraço, que é o meu lugar favorito no mundo.", "Porque com você, até os dias chatos ficam incríveis.", "Pela forma carinhosa como você cuida de mim.", "Porque você ilumina qualquer lugar que chega.", "Pelas nossas risadas e todas as nossas palhaçadas.", "Porque você é minha melhor companhia, sempre.", "Pelo seu cheirinho que eu sou viciado.", "Porque você me inspira a ser uma pessoa melhor todos os dias." ];
    let novoIndex;
    do { novoIndex = Math.floor(Math.random() * motivosParaAmar.length); } while (motivosParaAmar[novoIndex] === motivoAtual && motivosParaAmar.length > 1);
    setMotivoAtual(motivosParaAmar[novoIndex]);
  };

  const handleCapsuleClick = () => {
    const agora = new Date();
    const dataAlvo = new Date(DATA_CAPSULA);
    
    if (agora >= dataAlvo) {
      setOpenCapsuleMessage(true);
    } else {
      setCapsuleShake(true);
      setCapsuleErrorMsg(true);
      setTimeout(() => setCapsuleShake(false), 500);
      setTimeout(() => setCapsuleErrorMsg(false), 3000);
    }
  };

  const letterText = `Hoje é um dia especial, daqueles que fazem o coração bater mais forte e os olhos brilharem.\n\nHoje celebramos você, uma pessoa incrível, cheia de luz e amor.\n\nDesde que você entrou na minha vida, tudo mudou para melhor.\nVocê trouxe alegria, paz e um sentimento que eu nunca tinha vivido antes.\n\nVocê é especial não só pra mim, mas para toda sua família.\nTodos enxergam o quanto você é importante, o quanto você ilumina tudo ao seu redor.\n\nSeu jeito, seu sorriso, sua forma de amar… tudo em você é único.\n\nEu sou muito grato por ter você ao meu lado.\nVocê é meu presente todos os dias.\n\nHoje é o seu dia, mas quem ganha sou eu por ter você.\n\nFeliz aniversário, meu amor. 💖`;

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined" && !audioRef.current) {
      audioRef.current = new Audio("/Tribalistas-Velha Infância.mp3"); audioRef.current.loop = true; audioRef.current.volume = 0.5;
    }

    const interval = setInterval(() => {
      const now = new Date();
      let year = now.getFullYear();
      let nextDate = new Date(`${year}-03-29T00:00:00`);
      if (now > nextDate) { nextDate = new Date(`${year + 1}-03-29T00:00:00`); }
      const diff = nextDate.getTime() - now.getTime();
      setTimeLeft({ days: Math.floor(diff / (1000 * 60 * 60 * 24)), hours: Math.floor((diff / (1000 * 60 * 60)) % 24), minutes: Math.floor((diff / 1000 / 60) % 60), seconds: Math.floor((diff / 1000) % 60) });

      const startDate = new Date('2025-11-15T00:00:00');
      let tYears = now.getFullYear() - startDate.getFullYear(); let tMonths = now.getMonth() - startDate.getMonth(); let tDays = now.getDate() - startDate.getDate(); let tHours = now.getHours() - startDate.getHours(); let tMinutes = now.getMinutes() - startDate.getMinutes(); let tSeconds = now.getSeconds() - startDate.getSeconds();

      if (tSeconds < 0) { tSeconds += 60; tMinutes--; } if (tMinutes < 0) { tMinutes += 60; tHours--; } if (tHours < 0) { tHours += 24; tDays--; } if (tDays < 0) { const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0); tDays += prevMonth.getDate(); tMonths--; } if (tMonths < 0) { tMonths += 12; tYears--; }
      setTimeTogether({ years: tYears, months: tMonths, days: tDays, hours: tHours, minutes: tMinutes, seconds: tSeconds });

      setHeartbeat((prev) => !prev);
      if (now.getDate() === 29 && now.getMonth() === 2) { setIsBirthday(true); if (navigator.vibrate) { navigator.vibrate([200, 100, 200]); } } else { setIsBirthday(false); }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (openLetter) { let i = 0; const interval = setInterval(() => { setTypedText(letterText.slice(0, i)); i++; if (i > letterText.length) clearInterval(interval); }, 25); }
  }, [openLetter]);

  const photos = [
    { title: "Viagem", rotate: -8, img: "/Lv1.jpeg" }, { title: "Natal juntos", rotate: 5, img: "/Lv2.jpg" }, { title: "Nossa primeira foto juntos", rotate: -4, img: "/Lv3.jpg" }, { title: "Casa de vó", rotate: 7, img: "/Lv4.jpg" }, { title: "Nossas graças né", rotate: -5, img: "/Lv5.jpg" },
  ];

  if (!isMounted) return null;

  return (
    <div className="min-h-screen flex flex-col items-center text-gray-700 relative overflow-hidden scroll-smooth font-sans pb-20">
      
      {/* Fundos e Overlays */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-pink-100 via-white to-pink-200" />
      <AnimatePresence>
        {isCinemaMode && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} className="fixed inset-0 bg-black/85 z-[100] pointer-events-none" />}
      </AnimatePresence>

      {isUnlocked && <FloatingHearts />}

      {/* 🔐 TELA DE BLOQUEIO */}
      <AnimatePresence>
        {!isUnlocked && (
          <motion.div key="lock-screen" exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }} transition={{ duration: 1 }} className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gradient-to-br from-pink-200 via-white to-pink-100 p-6">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white/50 backdrop-blur-xl p-8 rounded-[32px] border border-white/40 shadow-2xl flex flex-col items-center text-center max-w-sm w-full">
              <div className="text-6xl mb-4">🔒</div>
              <h1 className={`text-4xl text-pink-500 mb-2 ${greatVibes.className}`}>Uma pergunta...</h1>
              <p className="text-gray-600 mb-6 font-medium">Quando a nossa história começou?</p>
              <motion.div animate={passError ? { x: [-10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }}>
                <input type="text" maxLength={10} placeholder="DD/MM/AAAA" value={passInput} onChange={handlePassChange} className={`w-full text-center text-xl p-4 rounded-xl border-2 bg-white/60 focus:outline-none transition-colors ${passError ? 'border-red-400 text-red-500' : 'border-pink-300 focus:border-pink-500 text-gray-700'}`} />
              </motion.div>
              {passError && <p className="text-red-400 text-sm mt-2">Ops, data incorreta! Tente de novo. 😉</p>}
              <button onClick={handleUnlock} className="mt-6 bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105 active:scale-95 w-full">Entrar ✨</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isUnlocked && (
        <>
          {/* Botões Flutuantes */}
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={toggleMute} className={`fixed top-6 right-6 z-[150] bg-white/60 backdrop-blur-md p-3 rounded-full shadow-md border border-white/40 text-xl hover:bg-pink-100 transition-all duration-300 ${isCinemaMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            {isMuted ? '🔇' : '🔊'}
          </motion.button>
          <motion.button onClick={() => document.getElementById("timeline")?.scrollIntoView({ behavior: "smooth" })} className={`fixed bottom-8 right-8 bg-pink-500/80 backdrop-blur-sm text-white p-5 rounded-full shadow-lg z-50 border border-white/20 transition-opacity duration-500 ${isCinemaMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} animate={{ y: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }} whileHover={{ scale: 1.1, backgroundColor: "rgb(236 72 153)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          </motion.button>

          {/* Cartas e Corações do Níver */}
          <AnimatePresence>
            {isBirthday && (<motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: heartbeat ? 1.1 : 1, opacity: 0.8 }} exit={{ scale: 0 }} transition={{ duration: 0.8, ease: "easeInOut" }} className="fixed inset-0 flex items-center justify-center z-10 pointer-events-none"><div className="text-[200px] md:text-[300px] filter blur-sm">💖</div></motion.div>)}
          </AnimatePresence>
          <AnimatePresence>
            {isBirthday && !openLetter && (<motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`fixed bottom-24 z-50 cursor-pointer ${isCinemaMode ? 'hidden' : ''}`} onClick={() => setOpenLetter(true)} whileHover={{ scale: 1.1 }}><div className="w-40 h-28 bg-white/40 backdrop-blur-lg rounded-2xl shadow-xl flex items-center justify-center text-5xl border border-white/20">💌</div></motion.div>)}
          </AnimatePresence>
          <AnimatePresence>
            {openLetter && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[150] p-6" onClick={() => setOpenLetter(false)}><motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white/60 backdrop-blur-xl rounded-[32px] p-8 max-w-lg text-base leading-relaxed overflow-y-auto max-h-[80vh] whitespace-pre-wrap border border-white/30 shadow-2xl text-gray-800 relative" onClick={(e) => e.stopPropagation()}><button className="absolute top-4 right-4 text-gray-500 hover:text-pink-500 text-xl" onClick={() => setOpenLetter(false)}>✕</button>{typedText}</motion.div></motion.div>)}
          </AnimatePresence>

          {/* Hero Section */}
          <section id="hero" className="w-full flex flex-col items-center justify-center pt-24 pb-12 text-center px-6 z-20 relative">
            <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className={`text-7xl md:text-8xl text-pink-500 mb-6 ${greatVibes.className}`}>Lauana Vitória</motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }} className="text-xl max-w-2xl bg-white/30 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-inner">O dia mais bonito do ano está chegando. <br /> Preparamos este cantinho para celebrar você.</motion.p>
          </section>

          {/* ⏳ NOSSA HISTÓRIA */}
          <section className="w-full flex justify-center py-10 px-6 z-20 relative">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="backdrop-blur-lg bg-white/40 rounded-[32px] p-8 text-center w-full max-w-3xl border border-white/30 shadow-xl">
              <h2 className={`text-4xl md:text-5xl text-pink-500 mb-6 ${greatVibes.className}`}>Nossa história começou há...</h2>
              <div className="flex flex-wrap justify-center gap-3 md:gap-4 text-gray-800 font-bold">
                {[ { label: "Anos", value: timeTogether.years }, { label: "Meses", value: timeTogether.months }, { label: "Dias", value: timeTogether.days }, { label: "Horas", value: timeTogether.hours }, { label: "Minutos", value: timeTogether.minutes }, { label: "Segundos", value: timeTogether.seconds } ].map((item, idx) => (
                  <div key={idx} className="bg-white/50 backdrop-blur-sm p-3 md:p-4 rounded-xl border border-white/20 shadow-sm flex flex-col items-center min-w-[70px] md:min-w-[90px]"><span className="text-2xl md:text-3xl text-pink-600 tabular-nums">{item.value}</span><span className="text-[10px] md:text-xs uppercase tracking-wider text-gray-500 mt-1">{item.label}</span></div>
                ))}
              </div>
              <p className="mt-6 text-sm text-gray-500 italic">Desde 15 de Novembro de 2025</p>
            </motion.div>
          </section>

          {/* 🗺️ NOVO: NOSSO MAPA DE COORDENADAS (Opção 2) */}
          <section className="w-full flex justify-center py-12 px-6 z-20 relative">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="backdrop-blur-lg bg-white/40 rounded-[32px] p-8 text-center w-full max-w-2xl border border-white/40 shadow-xl relative overflow-hidden">
              <h2 className={`text-4xl md:text-5xl text-pink-500 mb-2 ${greatVibes.className}`}>A Distância Não Importa</h2>
              <p className="text-gray-600 mb-8 font-medium">De Limoeiro a Recife, nossos corações batem juntos.</p>
              
              <div className="flex items-center justify-between w-full relative h-24 max-w-lg mx-auto">
                {/* Ponto 1: Limoeiro */}
                <div className="flex flex-col items-center z-10 bg-white/70 backdrop-blur-md p-3 md:p-4 rounded-2xl shadow-lg border border-pink-200">
                  <span className="text-2xl mb-1">📍</span>
                  <span className="text-xs md:text-sm font-bold text-gray-700">Limoeiro, PE</span>
                </div>

                {/* Linha Tracejada */}
                <div className="absolute left-10 right-10 h-0.5 border-t-2 border-dashed border-pink-400 opacity-60 z-0 top-[40%]" />
                
                {/* Coração Animado no Meio */}
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} className="z-10 absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow border border-pink-100 text-pink-500 text-xl md:text-2xl">
                  💖
                </motion.div>

                {/* Ponto 2: Recife */}
                <div className="flex flex-col items-center z-10 bg-white/70 backdrop-blur-md p-3 md:p-4 rounded-2xl shadow-lg border border-pink-200">
                  <span className="text-2xl mb-1">📍</span>
                  <span className="text-xs md:text-sm font-bold text-gray-700">Recife, PE</span>
                </div>
              </div>

              <div className="mt-8 bg-pink-100/50 p-4 rounded-2xl text-pink-700 italic border border-pink-200/50">
                "Cerca de 77 km separam nossas cidades, mas pro nosso amor, a distância é zero."
              </div>
            </motion.div>
          </section>

          {/* Timeline Section */}
          <section id="timeline" className="w-full flex justify-center py-16 px-6 z-20 relative">
            <div className="relative border-l-4 border-pink-300 pl-10 space-y-20 max-w-xl">
              {photos.map((item, i) => (
                <motion.div key={i} className="relative" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.8, delay: i * 0.2 }}>
                  <div className="absolute -left-[54px] top-2 w-8 h-8 bg-pink-500 rounded-full border-4 border-white shadow-md z-10" />
                  <motion.p className="font-bold text-lg text-gray-700 mb-4 max-w-[16rem] leading-tight break-words text-center bg-white/40 backdrop-blur-sm p-3 rounded-xl border border-white/20">{item.title}</motion.p>
                  <motion.div initial={{ rotate: item.rotate }} whileHover={{ rotate: 0, scale: 1.05, zIndex: 30 }} onClick={() => setSelectedImage(item.img)} className="backdrop-blur-lg bg-white/50 border border-white/30 rounded-[32px] p-5 shadow-xl cursor-pointer relative z-20 transition-all duration-300 ease-out"><img src={item.img} alt={item.title} className="rounded-2xl mb-2 w-full h-auto object-cover aspect-[4/3]" /><div className="absolute inset-0 rounded-[32px] bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" /></motion.div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Modal da Imagem */}
          <AnimatePresence>
            {selectedImage && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[150] p-4" onClick={() => setSelectedImage(null)}><motion.img src={selectedImage} alt="Imagem ampliada" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="max-w-full max-h-[92vh] rounded-[32px] object-contain shadow-2xl border-4 border-white/20" /></motion.div>)}
          </AnimatePresence>

          {/* 🧩 SEÇÃO: QUEBRA-CABEÇA */}
          <section className="w-full flex justify-center py-16 px-6 z-20 relative">
             <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="backdrop-blur-lg bg-white/30 rounded-[32px] p-8 md:p-10 text-center w-full max-w-2xl border border-white/40 shadow-xl flex flex-col items-center">
              <h2 className={`text-4xl text-pink-500 mb-6 ${greatVibes.className}`}>Um Desafio para Você</h2>
              <p className="text-gray-600 mb-8 max-w-md">Monte o quebra-cabeça clicando nas peças para revelar nossa foto especial!</p>
              {!puzzleStarted ? (
                <button onClick={shufflePuzzle} className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-4 px-10 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"><span>Começar Jogo</span><span className="text-xl">🧩</span></button>
              ) : (
                <div className="relative flex flex-col items-center">
                  <AnimatePresence mode="wait">
                    {!isPuzzleSolved ? (
                      <motion.div key="puzzle-grid" exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }} transition={{ duration: 0.8 }} className="grid gap-1 bg-white/20 p-2 rounded-2xl shadow-inner border border-white/10" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, width: '300px', height: '300px', maxWidth: '100%', aspectRatio: '1/1' }}>
                        {tiles.map((tile, index) => { const isEmpty = tile === TILE_COUNT - 1; if (isEmpty) return <div key={`empty-${index}`} className="bg-transparent" />; const originalRow = Math.floor(tile / GRID_SIZE); const originalCol = tile % GRID_SIZE; const sizePercent = 100 * GRID_SIZE; return <motion.div key={`tile-${tile}`} layout transition={{ type: "spring", stiffness: 300, damping: 30 }} onClick={() => moveTile(index)} className="bg-cover bg-no-repeat cursor-pointer rounded-lg shadow border border-white/20 active:scale-95 transition-transform" style={{ backgroundImage: `url(${PUZZLE_PHOTO_URL})`, backgroundSize: `${sizePercent}% ${sizePercent}%`, backgroundPosition: `${(originalCol / (GRID_SIZE - 1)) * 100}% ${(originalRow / (GRID_SIZE - 1)) * 100}%` }} />; })}
                      </motion.div>
                    ) : (
                      <motion.div key="puzzle-solved" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.5, type: 'spring', bounce: 0.4 }} className="flex flex-col items-center overflow-hidden"><div className="backdrop-blur-xl bg-white/60 p-4 rounded-3xl border-4 border-pink-300 shadow-2xl relative"><img src={PUZZLE_PHOTO_URL} alt="Foto Resolvida" className="rounded-xl w-[300px] h-[300px] object-cover" /><div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-pink-300/40 via-white/20 to-pink-300/40 animate-pulse -z-10" /></div><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="mt-8 text-center"><h3 className={`text-5xl text-pink-600 ${greatVibes.className}`}>Parabéns!</h3><p className="text-xl text-gray-800 mt-3 font-medium">Você montou nossa foto! Ficou linda, né? 🥰</p></motion.div></motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </section>

          {/* 💖 GERADOR DE MOTIVOS */}
          <section className="w-full flex justify-center py-16 px-6 z-20 relative">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="backdrop-blur-lg bg-white/30 rounded-[32px] p-10 text-center w-full max-w-2xl border border-white/40 shadow-xl flex flex-col items-center">
              <h2 className={`text-4xl text-pink-500 mb-6 ${greatVibes.className}`}>Por que eu te amo?</h2>
              <button onClick={gerarNovoMotivo} className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-4 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 mb-8"><span>Descobrir um motivo</span><span className="text-xl">✨</span></button>
              <AnimatePresence mode="wait">{motivoAtual && (<motion.div key={motivoAtual} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.4 }} className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-pink-200 shadow-inner w-full relative"><span className="text-4xl text-pink-300 absolute top-2 left-4 font-serif">"</span><p className="text-lg md:text-xl text-gray-700 italic font-medium px-6 py-2">{motivoAtual}</p><span className="text-4xl text-pink-300 absolute -bottom-2.5 right-4 font-serif">"</span></motion.div>)}</AnimatePresence>
            </motion.div>
          </section>

          {/* 🎈 BALÕES SURPRESA */}
          <section className="w-full flex justify-center py-16 px-6 z-20 relative">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="backdrop-blur-lg bg-white/30 rounded-[32px] p-8 md:p-10 text-center w-full max-w-4xl border border-white/40 shadow-xl flex flex-col items-center relative">
              <h2 className={`text-4xl md:text-5xl text-pink-500 mb-8 ${greatVibes.className}`}>Estoure para uma surpresa! 🎈</h2>
              <div className="flex flex-wrap justify-center gap-6 relative min-h-[160px] w-full items-center">
                {BALOES_FRASES.map((palavra, index) => (
                  <div key={index} className="relative w-24 h-32 flex items-center justify-center">
                    <AnimatePresence mode="popLayout">
                      {!poppedBalloons[index] ? (
                        <motion.div key={`balloon-${index}`} initial={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 1.6, y: -30, opacity: 0, filter: 'blur(5px)' }} transition={{ duration: 0.3, ease: 'easeOut' }} whileHover={{ y: -10, scale: 1.1, transition: { repeat: Infinity, repeatType: 'reverse', duration: 0.6 } }} onClick={() => popBalloon(index)} className={`w-24 h-32 bg-gradient-to-b from-pink-300 to-pink-500 rounded-full shadow-lg cursor-pointer flex flex-col items-center justify-center border-4 border-white relative`}><div className="text-white text-5xl">🎈</div>{[...Array(5)].map((_, i) => (<motion.span key={i} className="absolute text-xl opacity-0" animate={poppedBalloons[index] ? { opacity: [1, 0], y: [-20, -100], x: [-10, 10, -10], transition: { duration: 1, delay: i * 0.1 } } : {}}>💖</motion.span>))}</motion.div>
                      ) : (
                        <motion.div key={`word-${index}`} initial={{ opacity: 0, y: 20, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 20 }} className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border-2 border-pink-300 shadow-md text-center"><span className="text-xl md:text-2xl font-bold text-gray-800 uppercase tracking-wider">{palavra}</span></motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
              {poppedBalloons.every(b => b) && (<motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1, type: 'spring' }} className="mt-12 p-6 bg-pink-100/60 rounded-3xl border-2 border-pink-300 w-full max-w-md"><p className="text-xl text-gray-800 font-medium">Você estourou todos! A nossa frase é: </p><p className={`text-4xl text-pink-600 mt-3 font-bold ${greatVibes.className}`}>Você é o Amor da Minha Vida!</p></motion.div>)}
            </motion.div>
          </section>

          {/* 🔒 NOVO: CÁPSULA DO TEMPO (Opção 3) */}
          <section className="w-full flex justify-center py-16 px-6 z-20 relative">
             <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="backdrop-blur-lg bg-white/40 rounded-[32px] p-8 md:p-12 text-center w-full max-w-2xl border border-white/40 shadow-2xl flex flex-col items-center">
              <h2 className={`text-4xl md:text-5xl text-pink-500 mb-4 ${greatVibes.className}`}>Cápsula do Tempo ⏳</h2>
              <p className="text-gray-600 mb-8 max-w-md">Uma surpresa guardada a sete chaves para o nosso aniversário de 1 ano de namoro.</p>
              
              <motion.div 
                animate={capsuleShake ? { x: [-10, 10, -10, 10, 0] } : {}} 
                transition={{ duration: 0.4 }}
                onClick={handleCapsuleClick}
                whileHover={{ scale: 1.05 }}
                className="bg-white/80 backdrop-blur-xl border-4 border-pink-300 p-8 rounded-3xl shadow-[0_10px_40px_rgba(236,72,153,0.3)] cursor-pointer flex flex-col items-center relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="text-7xl mb-4 relative z-10">🗃️</span>
                <span className="text-2xl font-bold text-gray-800 relative z-10">Tente Abrir</span>
                <div className="mt-4 bg-pink-100 px-4 py-1 rounded-full text-pink-600 text-sm font-semibold border border-pink-200">
                  Data: 15/11/2026
                </div>
              </motion.div>

              {capsuleErrorMsg && (
                <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 font-medium mt-6 bg-red-100/80 px-4 py-2 rounded-xl">
                  Calma apressadinha! 🤭 O cadeado só vai abrir no dia 15/11/2026!
                </motion.p>
              )}
             </motion.div>
          </section>

          {/* Modal da Cápsula do Tempo (Caso chegue a data) */}
          <AnimatePresence>
            {openCapsuleMessage && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[200] p-6" onClick={() => setOpenCapsuleMessage(false)}>
                <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-white/90 backdrop-blur-xl rounded-[32px] p-8 max-w-lg w-full text-center border-4 border-pink-400 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-pink-500 text-2xl" onClick={() => setOpenCapsuleMessage(false)}>✕</button>
                  <h2 className={`text-5xl text-pink-500 mb-6 ${greatVibes.className}`}>Feliz Aniversário de Namoro!</h2>
                  <p className="text-gray-700 text-lg leading-relaxed font-medium">
                    Se você está lendo isso, significa que nosso primeiro ano juntos (oficialmente) chegou! <br/><br/>
                    Eu guardei essa mensagem desde o começo, só para te lembrar que meu amor por você só cresceu a cada dia. Você é meu lar, minha paz e a dona do meu coração.<br/><br/>
                    Te amo daqui até a eternidade! ❤️
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 🎬 VÍDEO COM MODO CINEMA */}
          <section id="video-section" className={`w-full flex justify-center py-16 px-6 relative transition-all duration-1000 ${isCinemaMode ? 'z-[110]' : 'z-20'}`}>
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }} className={`backdrop-blur-xl bg-white/40 p-6 md:p-8 rounded-[32px] border shadow-2xl max-w-full transition-colors duration-1000 ${isCinemaMode ? 'border-pink-500/50 shadow-[0_0_50px_rgba(236,72,153,0.3)] bg-black/50' : 'border-white/30'}`}>
              <video controls onPlay={handleVideoPlay} onPause={handleVideoPause} onEnded={handleVideoPause} className="w-[36rem] max-w-full rounded-2xl shadow-inner border-2 border-white/20">
                <source src="/Lv6.mp4" type="video/mp4" />
                Seu navegador não suporta a tag de vídeo.
              </video>
            </motion.div>
          </section>

          {/* CONTAGEM FINAL */}
          <section id="message-section" className="w-full flex justify-center pt-16 px-6 z-20 relative relative mb-20">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="backdrop-blur-lg bg-white/50 rounded-[40px] p-10 md:p-12 text-center w-full max-w-3xl border border-white/30 shadow-2xl">
              {isBirthday ? (
                <><h2 className={`text-6xl text-pink-500 mb-6 ${greatVibes.className}`}>HOJE É O DIA! 🎉</h2><p className="mt-4 text-xl text-gray-800 leading-relaxed">Você é a melhor coisa que já me aconteceu, eu sou eternamente grato por ter você! 💖</p></>
              ) : (
                <><h2 className={`text-5xl md:text-6xl text-pink-500 mb-8 ${greatVibes.className}`}>Seu Aniversário Chega em...</h2>
                  {isMounted && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-gray-800 font-bold">
                      {[ { label: "dias", value: timeLeft.days }, { label: "horas", value: timeLeft.hours }, { label: "min", value: timeLeft.minutes }, { label: "seg", value: timeLeft.seconds }, ].map((item) => (
                        <div key={item.label} className="bg-white/60 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-white/20 shadow-md"><div className="text-4xl md:text-5xl text-pink-600 tabular-nums">{item.value}</div><div className="text-xs md:text-sm uppercase tracking-wider text-gray-600 mt-2">{item.label}</div></div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </section>
        </>
      )}
    </div>
  );
}