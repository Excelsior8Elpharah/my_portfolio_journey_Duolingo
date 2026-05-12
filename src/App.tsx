/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from "react";
import { 
  TrendingUp, 
  Calendar, 
  Award, 
  BookOpen, 
  Flame, 
  Trophy, 
  Target, 
  CheckCircle2,
  ChevronRight,
  Info,
  ShieldCheck,
  Shield,
  Crown,
  AlertTriangle,
  Lightbulb,
  Zap,
  History,
  Activity,
  ShoppingBag,
  FileSearch,
  MessageSquareQuote,
  Maximize2,
  X,
  Mic2,
  Headphones,
  FileText,
  ArrowRight,
  Image as ImageIcon
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { fetchCSV, getTierName, TIER_COLORS } from "./services/dataService";
import { LanguageData, LeaderboardData, InventoryData, SummaryStats, TestData, ClassLogData, TimelineEvent } from "./types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function SmartImage({ src, alt, className, objectFit = "cover", ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { objectFit?: "cover" | "contain" }) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  return (
    <div className={cn("relative w-full h-full bg-zinc-950 overflow-hidden flex items-center justify-center", className)}>
      {!error ? (
        <>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 animate-pulse">
              <ImageIcon className="w-8 h-8 text-zinc-700 animate-bounce" />
            </div>
          )}
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            onLoad={() => setLoading(false)}
            onError={() => setError(true)}
            className={cn(
              "w-full h-full transition-all duration-700",
              objectFit === "cover" ? "object-cover" : "object-contain",
              "object-center",
              loading ? "opacity-0" : "opacity-100"
            )}
            {...props}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner">
            <ImageIcon className="w-8 h-8 text-zinc-700" />
          </div>
          <div>
            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Pendente de Upload</div>
            <div className="text-[10px] text-zinc-600 font-bold italic lowercase leading-tight max-w-[120px]">
              {src?.split('/').pop()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [languages, setLanguages] = useState<LanguageData[]>([]);
  const [leaderboards, setLeaderboards] = useState<LeaderboardData[]>([]);
  const [inventory, setInventory] = useState<InventoryData[]>([]);
  const [tests, setTests] = useState<TestData[]>([]);
  const [classroom, setClassroom] = useState<any[]>([]);
  const [notifyData, setNotifyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const EVIDENCIAS = [
    { src: "/evidencias/conclusao_curso.jpeg", title: "Certificação Final", caption: "Snapshot oficial do encerramento integral da grade de Inglês Profissional em 07/05/2026." },
    { src: "/evidencias/det_score_130.jpeg", title: "DET Score: 130", caption: "Nível Intermediário Superior (B2 Iniciante) validado pelo Duolingo English Test." },
    { src: "/evidencias/perfil_overview.jpeg", title: "Visão Geral do Perfil", caption: "Métricas consolidadas: 357k+ XP e status persistente na Liga Diamante." },
    { src: "/evidencias/triunfos_galeria.jpeg", title: "Framework de Triunfos", caption: "Status 'Level 10/10' em conquistas críticas como XP Olímpico e Missão Cumprida." },
    { src: "/evidencias/persistencial_kpi.jpeg", title: "KPIs de Persistência", caption: "Recorde histórico de 375 dias de ofensiva e picos de 2.3k XP/dia." },
    { src: "/evidencias/lideranca_rank.jpeg", title: "Liderança Competitiva", caption: "Alcance do 1º lugar no prestigiado Clube dos Campeões." },
    { src: "/evidencias/resumo_2025.jpeg", title: "Analytics 2025", caption: "Top 1% Global: 114k XP e mais de 5.000 minutos de imersão ativa." },
    { src: "/evidencias/resumo_2024.jpeg", title: "Analytics 2024", caption: "Consistência no Top 1% Global with 103k XP e 6.6k minutos de estudo." },
    { src: "/evidencias/medalhas_2026.jpeg", title: "Ciclo 2026 (WIP)", caption: "Progressão de medalhas do ano corrente, mantendo a cadência de elite." },
    { src: "/evidencias/medalhas_2025.jpeg", title: "Medalhas 2025", caption: "Coleção anual completa, demonstrando disciplina mensal ininterrupta." },
    { src: "/evidencias/medalhas_2024.jpeg", title: "Medalhas 2024", caption: "Histórico consolidado de conquistas cíclicas durante o ano de 2024." },
    { src: "/evidencias/medalhas_2023.jpeg", title: "Medalhas 2023", caption: "O alicerce do hábito: 12 meses de engajamento contínuo." },
    { src: "/evidencias/medalhas_2022_2021.jpeg", title: "Histórico 2021-2022", caption: "As origens da minha jornada: primeiros registros de proficiência e o início do meu hábito." },
  ];

  useEffect(() => {
    async function loadAllData() {
      try {
        const [langData, leaderData, invData, testData, classroomData, notify] = await Promise.all([
          fetchCSV<LanguageData>("/data/languages.csv"),
          fetchCSV<LeaderboardData>("/data/leaderboards.csv"),
          fetchCSV<InventoryData>("/data/inventory.csv"),
          fetchCSV<TestData>("/data/duolingo-english-test-tests.csv"),
          fetchCSV<any>("/data/ClassroomSummaries.csv"),
          fetchCSV<any>("/data/duolingo-notify-data.csv"),
        ]);
        setLanguages(langData || []);
        setLeaderboards(leaderData || []);
        setInventory(invData || []);
        setTests(testData || []);
        setClassroom(classroomData || []);
        setNotifyData(notify || []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, []);

  const studyMinutesData = useMemo(() => [
    { year: "2021", minutes: 1200, label: "Gênese", avg: 100 },
    { year: "2022", minutes: 2450, label: "Hábito", avg: 204 },
    { year: "2023", minutes: 3840, label: "Foco", avg: 320 },
    { year: "2024", minutes: 6628, label: "Peak (Pico)", avg: 552 },
    { year: "2025", minutes: 5029, label: "Elite", avg: 419 },
    { year: "2026", minutes: 3080, label: "Legend", avg: 616 }
  ], []);

  const stats = useMemo<SummaryStats | null>(() => {
    if (languages.length === 0) return null;
    const mainLang = languages[0];
    const bestScore = Math.max(...leaderboards.map(l => l.score || 0));
    const lastLeaderboard = leaderboards[leaderboards.length - 1];
    
    const streakFreezes = inventory.filter(i => (i.item_type || "").toLowerCase().includes("streak freeze")).length;

    return {
      totalXP: 357922, // Extraído de 1000041617.jpeg
      totalLessons: mainLang.total_lessons,
      daysActive: mainLang.days_active,
      currentTier: "Diamante", 
      bestScore: 2374, // Recorde real de 1000041608.jpeg
      lastActive: mainLang.last_active,
      completionRate: 100, // Validado por 1000041610.jpeg
      totalTests: tests.length,
      streakFreezesUsed: streakFreezes,
      learningLang: "Inglês",
      baseLang: "Português",
      skillsLearned: mainLang.skills_learned || 80,
      priorProficiency: 5, // A1 em 2021
      maxStreak: 375, // Recorde real de 1000041608.jpeg
      englishScore: 130, // Score real de 1000041612.jpeg
      studyMinutes2026: 3080,
      studyMinutes2025: 5029, // De 1000041619.jpeg
      studyMinutes2024: 6628, // De 1000041620.jpeg
      studyMinutes2023: 3840,
      studyMinutes2022: 2450,
      studyMinutes2021: 1200,
      xpPerYear: {
        "2021": 5400,
        "2022": 18200,
        "2023": 45600,
        "2024": 103595,
        "2025": 114843,
        "2026": 70284
      }
    };
  }, [languages, inventory, tests]);

  const chartData = useMemo(() => {
    return [...leaderboards]
      .filter(l => l.timestamp)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(-40) 
      .map(l => {
        try {
          const timestamp = String(l.timestamp);
          let dateObj = parseISO(timestamp);
          if (isNaN(dateObj.getTime())) {
            dateObj = new Date(timestamp);
          }
          
          return {
            date: !isNaN(dateObj.getTime()) ? format(dateObj, "dd/MM/yy", { locale: ptBR }) : "N/A",
            fullDate: !isNaN(dateObj.getTime()) ? format(dateObj, "dd/MM/yyyy", { locale: ptBR }) : "N/A",
            score: l.score || 0,
            tier: getTierName(l.tier),
            tierColor: TIER_COLORS[getTierName(l.tier)] || "#58cc02"
          };
        } catch (e) {
          return {
            date: "N/A",
            fullDate: "N/A",
            score: l.score || 0,
            tier: getTierName(l.tier),
            tierColor: "#58cc02"
          };
        }
      });
  }, [leaderboards]);

  const monthlyXPData = useMemo(() => {
    const yearlyXPTotals: Record<string, number> = {
      "2021": 5400,
      "2022": 18200,
      "2023": 45600,
      "2024": 103595,
      "2025": 114843,
      "2026": 70284
    };

    const monthsGrouped: Record<string, number> = {};
    const yearlyLoggedXP: Record<string, number> = {};
    
    leaderboards.forEach(l => {
      const timestamp = l.timestamp ? String(l.timestamp) : "";
      const score = Number(l.score) || 0;
      
      if (timestamp && score > 0) {
        let date = parseISO(timestamp);
        if (isNaN(date.getTime())) date = new Date(timestamp);

        if (!isNaN(date.getTime())) {
          const year = format(date, "yyyy");
          const monthKey = format(date, "yyyy-MM");
          monthsGrouped[monthKey] = (monthsGrouped[monthKey] || 0) + score;
          yearlyLoggedXP[year] = (yearlyLoggedXP[year] || 0) + score;
        }
      }
    });

    const years = ["2021", "2022", "2023", "2024", "2025", "2026"];
    const result: any[] = [];
    const currentMonth = 4; // May
    const currentYear = 2026;

    years.forEach(year => {
      const targetYearXP = yearlyXPTotals[year] || 0;
      const loggedYearXP = yearlyLoggedXP[year] || 0;
      const isCurrentYear = parseInt(year) === currentYear;
      const maxMonths = isCurrentYear ? currentMonth + 1 : 12;

      for (let m = 0; m < maxMonths; m++) {
        if (year === "2021" && m < 9) continue;

        const dateObj = new Date(parseInt(year), m, 1);
        const monthKey = format(dateObj, "yyyy-MM");
        let xp = 0;

        if (loggedYearXP > 0) {
          const monthLoggedXP = monthsGrouped[monthKey] || 0;
          // Calibrate based on official yearly total proportionally to logged data
          xp = Math.round(targetYearXP * (monthLoggedXP / loggedYearXP));
          
          // Fallback if a specific month has 0 logs but year has target XP
          if (xp === 0 && targetYearXP > 0) {
             xp = Math.round(targetYearXP / maxMonths);
          }
        } else {
          // Linear distribution if no logs for that year
          xp = Math.round(targetYearXP / (year === "2021" ? 3 : 12));
        }

        result.push({
          name: format(dateObj, "MMM yy", { locale: ptBR }),
          xp,
          fullDate: format(dateObj, "MMMM yyyy", { locale: ptBR }),
          year
        });
      }
    });

    return result;
  }, [leaderboards]);

  const monthlyMinutesData = useMemo(() => {
    const yearlyMinutes: Record<string, number> = {
      "2021": 1200,
      "2022": 2450,
      "2023": 3840,
      "2024": 6628,
      "2025": 5029,
      "2026": 3080
    };
    
    const yearlyXPWeight: Record<string, number> = {};
    const monthsGrouped: Record<string, number> = {};
    
    leaderboards.forEach(l => {
      const timestamp = l.timestamp ? String(l.timestamp) : "";
      const score = Number(l.score) || 0;
      if (timestamp && score > 0) {
        let date = parseISO(timestamp);
        if (isNaN(date.getTime())) date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
          const year = format(date, "yyyy");
          const monthKey = format(date, "yyyy-MM");
          monthsGrouped[monthKey] = (monthsGrouped[monthKey] || 0) + score;
          yearlyXPWeight[year] = (yearlyXPWeight[year] || 0) + score;
        }
      }
    });
    const years = ["2021", "2022", "2023", "2024", "2025", "2026"];
    const result: any[] = [];
    const currentMonth = 4; // May (0-indexed)
    const currentYear = 2026;

    years.forEach(year => {
      const yearTotalMinutes = yearlyMinutes[year] || 0;
      const yearXPWeight = yearlyXPWeight[year] || 0;
      const isCurrentYear = parseInt(year) === currentYear;
      const maxMonths = isCurrentYear ? currentMonth + 1 : 12;

      for (let m = 0; m < maxMonths; m++) {
        if (year === "2021" && m < 9) continue; // Iniciou em Outubro de 2021

        const dateObj = new Date(parseInt(year), m, 1);
        const monthKey = format(dateObj, "yyyy-MM");
        let minutes = 0;

        if (year === "2021") {
          // 2021: Distribuição entre Out, Nov, Dez (3 meses)
          // Pesamos um pouco mais Dezembro pelo efeito de empolgação inicial
          const weights = [0.25, 0.35, 0.40]; // Out, Nov, Dez
          minutes = Math.round(yearTotalMinutes * weights[m - 9]);
        } else if (yearXPWeight > 0) {
          const monthXP = monthsGrouped[monthKey] || 0;
          const xpWeight = (monthXP / yearXPWeight);
          
          // Compondo: 30% base linear (consistência) + 70% pico XP (intensidade)
          // Isso evita que meses sem dados de XP na base fiquem "zerados" se houve estudo real
          const baseComponent = (yearTotalMinutes * 0.3) / 12;
          const xpComponent = (yearTotalMinutes * 0.7) * xpWeight;
          minutes = Math.round(baseComponent + xpComponent);
          
          // Ajuste Proativo para Dezembro de 2022 (conforme timeline: "Salto de intensidade")
          if (year === "2022") {
            if (m === 11) minutes = Math.max(minutes, Math.round(yearTotalMinutes * 0.22)); // Spike em Dez
            else minutes = minutes * 0.9; // Leve suavização nos outros meses para compensar o spike
          }
        } else {
          minutes = Math.round(yearTotalMinutes / 12);
        }

        result.push({
          name: format(dateObj, "MMM yy", { locale: ptBR }),
          minutes,
          fullDate: format(dateObj, "MMMM yyyy", { locale: ptBR }),
          year
        });
      }
    });

    // Normalização final para garantir que a soma dos meses bata com o ano exatamente
    years.forEach(year => {
      const yearItems = result.filter(r => r.year === year);
      const currentTotal = yearItems.reduce((acc, curr) => acc + curr.minutes, 0);
      const targetTotal = yearlyMinutes[year];
      if (currentTotal > 0 && targetTotal > 0) {
        const factor = targetTotal / currentTotal;
        yearItems.forEach(item => { item.minutes = Math.round(item.minutes * factor); });
      }
    });

    return result;
  }, [leaderboards]);

  const timelineEvents = useMemo<TimelineEvent[]>(() => [
    { date: "2021", title: "Nível A1 (Gênese)", description: "Início absoluto do zero. Fase de sobrevivência com foco em frases simples e construção da fundação gramatical básica.", type: "milestone" },
    { date: "2022", title: "Ciclo da Consistência", description: "Fase de construção de disciplina competitiva. Salto de intensidade em Dezembro (8k+ XP/semana) e alicerce de 3.5k lições.", type: "milestone" },
    { date: "2023", title: "Consolidação Robusta", description: "O ano da sustentação em alto nível. Volume competitivo semanal regular com scores frequentes entre 7k e 9k XP.", type: "milestone" },
    { date: "2024", title: "Performance de Elite", description: "O ano da intensidade. Nível de alto rendimento sustentado com densidade competitiva em praticamente todo o calendário.", type: "milestone" },
    { date: "2025", title: "Legitimidade de Elite", description: "Maturidade e Imersão. Fase de força prática massiva, recordes de ofensiva e preparação final para a conclusão da grade.", type: "competitive" },
    { date: "2026", title: "Conclusão e Sustentação", description: "O grande marco: Conclusão Integral do Curso em 07/05/2026. Preservação do ritmo competitivo mesmo após finalizar a grade acadêmica.", type: "milestone" }
  ], []);

  const itemStats = useMemo(() => {
    const counts: Record<string, number> = {};
    inventory.forEach(item => {
      const type = item.item_type || "Item";
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).slice(0, 5);
  }, [inventory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#09090b]">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-green-500">DUO</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-green-500/30 selection:text-green-400 pb-20">
      {/* Background FX */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-500/5 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <nav className="sticky top-0 z-50 border-b border-zinc-800/50 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/10 rotate-3">
              <ShieldCheck className="text-white w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div>
              <div className="font-black tracking-tight text-sm md:text-base leading-none">DuoJourney <span className="text-green-500">PORTFOLIO</span></div>
              <div className="text-[8px] md:text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1 hidden sm:block">Meu Portfólio de Inglês &bull; v2.4</div>
              <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-1 sm:hidden">Meu Portfólio &bull; v2.4</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
            <a href="#overview" className="hover:text-green-500 transition-colors">Quem Sou</a>
            <a href="#evolution" className="hover:text-green-500 transition-colors">Minha Evolução</a>
            <a href="#historical-2022" className="hover:text-green-500 transition-colors">Meu 2022</a>
            <a href="#historical-2023" className="hover:text-green-500 transition-colors">Meu 2023</a>
            <a href="#historical-2024" className="hover:text-green-500 transition-colors">Meu 2024</a>
            <a href="#historical-2025" className="hover:text-green-500 transition-colors">Meu 2025</a>
            <a href="#historical-2026" className="hover:text-green-500 transition-colors">Meu 2026</a>
            <a href="#levels" className="hover:text-green-500 transition-colors">Proficiência</a>
            <a href="#swot" className="hover:text-green-500 transition-colors">Minhas Metas</a>
            <a href="#timeline" className="hover:text-green-500 transition-colors">Jornada</a>
            <a href="#evidencias" className="hover:text-green-500 transition-colors">Conquistas</a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-12 md:pt-16 relative">
        {/* CASE INTRODUCTION & PROFILE SNAPSHOT */}
        <section id="overview" className="mb-16 md:mb-24 border-b border-zinc-800/50 pb-16 md:pb-20">
          <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] uppercase tracking-[0.2em] font-black text-green-500 mb-8 shadow-inner">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                Meu Portfólio de Inglês
              </div>
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] italic">
                RAPHAEL <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-600 uppercase">SERAFIM.</span>
              </h1>
              <div className="space-y-6 text-zinc-400 font-medium leading-relaxed max-w-xl">
                <p>
                  Olá! Eu sou <span className="text-zinc-100 italic">Raphael Henrique Silva Serafim</span> e este é o registro da minha jornada no domínio do idioma inglês. Mais do que um simples progresso, este portfólio reflete minha disciplina diária, minha resiliência competitiva e o hábito que construí ao longo de anos de dedicação.
                </p>
                <p>
                  Aqui, apresento meus dados reais e as evidências que validam minha fluência B2 Iniciante e a conclusão integral do currículo acadêmico do Duolingo.
                </p>
              </div>
              <div className="mt-10 flex gap-4">
                <a href="#evidencias" className="px-8 py-4 bg-green-500 text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-green-400 transition-all shadow-lg shadow-green-500/20">
                  Minhas Conquistas
                </a>
                <a href="#evolution" className="px-8 py-4 bg-zinc-900 border border-zinc-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-zinc-800 transition-all">
                  Minha Evolução
                </a>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative group"
              onClick={() => setSelectedImage("/evidencias/perfil_overview.jpeg")}
            >
              <div className="absolute -inset-4 bg-gradient-to-br from-green-500/20 to-blue-500/20 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative aspect-[4/3] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-zinc-800 bg-zinc-900 cursor-pointer shadow-2xl transition-all hover:border-green-500/30 group">
                 <SmartImage 
                    src="/evidencias/perfil_overview.jpeg" 
                    alt="Perfil Raphael Serafim" 
                    className="group-hover:scale-105" 
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-6 md:p-10 pointer-events-none">
                    <div className="text-[9px] md:text-[10px] font-black text-green-500 uppercase tracking-[0.4em] mb-2">Visão Geral do Perfil</div>
                    <div className="flex items-center justify-between">
                       <div>
                         <div className="text-xl md:text-2xl font-black text-white italic">@RAPHANTOM777</div>
                         <div className="text-[10px] md:text-xs text-zinc-400 font-medium">Status: Liga Diamante</div>
                       </div>
                       <div className="text-right">
                         <div className="text-2xl md:text-3xl font-black text-white">{stats?.totalXP.toLocaleString()}</div>
                         <div className="text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest">XP ACUMULADO</div>
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* PERFORMANCE KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
           {/* Card 'Persistência' */}
             <motion.div 
               whileHover={{ y: -10 }}
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="relative p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-zinc-900 border border-zinc-800 overflow-hidden group cursor-pointer"
               onClick={() => setSelectedImage("/evidencias/persistencial_kpi.jpeg")}
             >
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Flame className="w-24 h-24 md:w-32 md:h-32 text-orange-500" />
               </div>
               <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 md:gap-8 text-center sm:text-left">
                  <div className="w-24 md:w-28 h-32 md:h-40 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl shrink-0 bg-zinc-950">
                     <SmartImage src="/evidencias/persistencial_kpi.jpeg" alt="KPI Persistência" className="object-center" />
                  </div>
                  <div>
                    <h4 className="text-[9px] md:text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] mb-3 md:mb-4">Minha Persistência</h4>
                    <div className="text-4xl md:text-5xl font-black text-white italic mb-2">{stats?.maxStreak} <span className="text-base md:text-lg text-zinc-500 not-italic">DIAS</span></div>
                    <p className="text-[11px] md:text-xs text-zinc-400 font-medium leading-relaxed">Meu recorde de ofensiva ininterrupta. Uma prova da minha constância diária no aprendizado.</p>
                  </div>
               </div>
             </motion.div>

           {/* Card 'Liderança' */}
           <motion.div 
             whileHover={{ y: -10 }}
             initial={{ opacity: 0, x: 20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="relative p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-zinc-900 border border-zinc-800 overflow-hidden group cursor-pointer"
             onClick={() => setSelectedImage("/evidencias/lideranca_rank.jpeg")}
           >
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Trophy className="w-24 h-24 md:w-32 md:h-32 text-blue-500" />
             </div>
             <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 md:gap-8 text-center sm:text-left">
                <div className="w-24 md:w-28 h-32 md:h-40 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl shrink-0 bg-zinc-950">
                   <SmartImage src="/evidencias/lideranca_rank.jpeg" alt="KPI Liderança" className="object-center" />
                </div>
                <div>
                  <h4 className="text-[9px] md:text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-3 md:mb-4">Minha Liderança</h4>
                  <div className="text-4xl md:text-5xl font-black text-white italic mb-2">#1 <span className="text-base md:text-lg text-zinc-500 not-italic">LUGAR</span></div>
                  <p className="text-[11px] md:text-xs text-zinc-400 font-medium leading-relaxed">Alcancei o topo do Clube dos Campeões, reforçando meu engajamento e competitividade saudável.</p>
                </div>
             </div>
           </motion.div>
        </section>

        {/* DOSSIÊ DE VERIFICAÇÃO (PROFICIENCY SPOTLIGHT) */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden group bg-zinc-900 border border-zinc-800 rounded-[3.5rem] p-12"
          >
            <div className="grid lg:grid-cols-2 gap-10 md:gap-12 items-center relative z-10">
              <div className="text-center lg:text-left">
                <h2 className="text-[9px] md:text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-4 md:mb-6">Minha Proficiência</h2>
                <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 md:mb-8">Meu Score Verificado <span className="text-zinc-500">Duolingo.</span></h3>
                <p className="text-zinc-400 font-medium leading-relaxed mb-8 md:mb-10 max-w-lg mx-auto lg:mx-0">
                  Meus registros oficiais confirmam um score de <span className="text-zinc-100 font-bold">130</span> no DET. Minha trajetória reflete um alto desempenho, com foco total em consolidar meu nível B2 Iniciante de compreensão e fluência.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedImage("/evidencias/triunfos_galeria.jpeg")}
                    className="w-full sm:w-fit px-8 py-4 rounded-2xl bg-zinc-800 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-zinc-700 transition-colors border border-zinc-700"
                  >
                    <Award className="w-5 h-5 text-yellow-500" /> Meus Triunfos Completos
                  </motion.button>
                </div>
              </div>
              
              <div className="flex justify-center">
                 <motion.div 
                   whileHover={{ scale: 1.05 }}
                   className="relative cursor-pointer group"
                   onClick={() => setSelectedImage("/evidencias/det_score_130.jpeg")}
                 >
                    <div className="absolute inset-0 bg-blue-500/10 blur-[80px] rounded-full group-hover:bg-blue-500/20 transition-all" />
                    <div className="relative w-64 aspect-[3/4] rounded-3xl overflow-hidden border-8 border-zinc-800 shadow-2xl transition-all hover:border-blue-500/20 bg-zinc-950">
                       <SmartImage src="/evidencias/det_score_130.jpeg" alt="DET Score Certificate" className="object-top" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6 pointer-events-none">
                          <div className="text-4xl font-black text-white italic">{stats?.englishScore}</div>
                          <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">DET SCORE VERIFICADO</div>
                       </div>
                    </div>
                 </motion.div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ACHIEVEMENTS GRID (TRIUNFOS) */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.4em] mb-4">Minhas Conquistas</h2>
              <h3 className="text-3xl font-bold tracking-tight italic uppercase">Galeria de Meus Triunfos e Marcos.</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AchievementBadge 
              title="Coruja de Ouro" 
              subtitle="Curso Finalizado"
              icon={<Award className="w-5 h-5 text-yellow-500" />}
              status="Completed"
            />
            <AchievementBadge 
              title="XP Olímpico" 
              subtitle="30.000 XP"
              icon={<Zap className="w-5 h-5 text-blue-500" />}
              status="Level 10/10"
            />
            <AchievementBadge 
              title="Missão Cumprida" 
              subtitle="750 Missões"
              icon={<Target className="w-5 h-5 text-green-500" />}
              status="Level 10/10"
            />
            <AchievementBadge 
              title="Não Tem Erro" 
              subtitle="1.000 Lições S/ Erro"
              icon={<ShieldCheck className="w-5 h-5 text-purple-500" />}
              status="Level 10/10"
            />
             <AchievementBadge 
              title="Força Titânica" 
              subtitle="250 Titan"
              icon={<Shield className="w-5 h-5 text-orange-500" />}
              status="Level 10/10"
            />
            <AchievementBadge 
              title="Clube dos Campeões" 
              subtitle="Status #1"
              icon={<Trophy className="w-5 h-5 text-yellow-400" />}
              status="Alcançado"
            />
            <AchievementBadge 
              title="Elite Global" 
              subtitle="Top 1%"
              icon={<Crown className="w-5 h-5 text-yellow-500" />}
              status="Recorrente"
            />
            <AchievementBadge 
              title="Ofensiva Recorde" 
              subtitle="375 Dias"
              icon={<Flame className="w-5 h-5 text-orange-500" />}
              status="Snapshot 2025"
            />
          </div>
        </section>

        {/* IMMERSION ANALYTICS */}
        <section className="mb-20">
          <div className="bg-gradient-to-br from-blue-900/10 to-purple-900/10 border border-zinc-800 rounded-[3rem] p-6 md:p-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
               <History className="w-64 h-64 text-blue-500" />
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row items-center gap-12 mb-12">
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-[9px] md:text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-4 md:mb-6">Deep Work & Engagement</h2>
                  <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 md:mb-8">Minha Imersão Analítica <span className="text-zinc-500">(2021-2026).</span></h3>
                  <p className="text-zinc-400 font-medium leading-relaxed mb-8 md:mb-10 max-w-lg mx-auto lg:mx-0">
                    Acredito que meu sucesso no idioma é proporcional ao meu tempo de imersão deliberada. Meus dados revelam um compromisso massivo com a fluência, totalizando milhares de minutos de exposição direta ao inglês ao longo da minha jornada.
                  </p>
                  
                  <div className="hidden lg:grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-4 shadow-xl">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                          <History className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Tempo Total Acumulado</div>
                          <div className="text-lg font-bold text-white tracking-tight">
                            {( studyMinutesData.reduce((acc, curr) => acc + curr.minutes, 0) ).toLocaleString()} min
                          </div>
                        </div>
                    </div>
                    <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-4 shadow-xl">
                        <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
                          <Crown className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Status de Dedicação</div>
                          <div className="text-lg font-bold text-white tracking-tight italic">Top 1% Global</div>
                        </div>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-[60%] bg-zinc-950/50 border border-zinc-800/50 rounded-[2.5rem] p-6 md:p-8 backdrop-blur-sm self-stretch flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1 italic">Evolução Anual</div>
                      <div className="text-sm font-bold text-white">Minutos Estudados</div>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-bold">
                       <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> <span className="text-zinc-400">Total Ano</span></div>
                       <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-purple-500" /> <span className="text-zinc-400">Média Mensal</span></div>
                    </div>
                  </div>
                  
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={studyMinutesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                        <XAxis 
                          dataKey="year" 
                          stroke="#3f3f46" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false} 
                          dy={10}
                        />
                        <YAxis stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#09090b", borderRadius: "16px", border: "1px solid #18181b", fontSize: "11px", padding: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
                          itemStyle={{ color: "#fff" }}
                          labelStyle={{ color: "#71717a", fontWeight: "bold", marginBottom: "4px" }}
                          cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                          labelFormatter={(label) => `Ano: ${label}`}
                        />
                        <Bar 
                          dataKey="minutes" 
                          name="Minutos Totais" 
                          radius={[6, 6, 0, 0]}
                          maxBarSize={50}
                        >
                          {studyMinutesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.year === "2024" || entry.year === "2025" || entry.year === "2026" ? "#3b82f6" : "#27272a"} />
                          ))}
                        </Bar>
                        <Bar 
                          dataKey="avg" 
                          name="Média Mensal" 
                          fill="#a855f7" 
                          radius={[4, 4, 0, 0]}
                          maxBarSize={20}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                {studyMinutesData.map((item) => (
                  <div key={item.year} className={cn(
                    "p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg transition-all hover:border-zinc-700 group",
                    (item.year === "2024" || item.year === "2025" || item.year === "2026") && "bg-zinc-800 border-zinc-700/50 scale-[1.02]"
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[8px] md:text-[9px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-zinc-400">{item.year}</div>
                      {item.year === "2024" && <div className="text-[7px] font-black px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 uppercase tracking-tighter">Peak</div>}
                      {item.year === "2025" && <div className="text-[7px] font-black px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 uppercase tracking-tighter">Elite</div>}
                      {item.year === "2026" && <div className="text-[7px] font-black px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500 uppercase tracking-tighter">Legend</div>}
                    </div>
                    <div className={cn(
                      "text-lg md:text-xl font-black italic",
                      (item.year === "2024" || item.year === "2025" || item.year === "2026") ? "text-blue-400" : "text-zinc-400"
                    )}>
                      {item.minutes.toLocaleString()} m
                    </div>
                    <div className="mt-1 text-[8px] text-zinc-600 font-bold uppercase tracking-wider">
                      ~{item.avg} m/mês
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        {/* YEARLY SUMMARIES (RESUMOS DO ANO) */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-[10px] font-black text-purple-500 uppercase tracking-[0.4em] mb-4">Meus Retrospectivos Oficiais</h2>
              <h3 className="text-3xl font-bold tracking-tight italic uppercase">Destaques Consolidados pelo Duolingo.</h3>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div 
               whileHover={{ y: -10 }}
               className="relative rounded-[3rem] overflow-hidden border border-zinc-800 bg-zinc-900 group cursor-pointer"
               onClick={() => setSelectedImage("/evidencias/resumo_2025.jpeg")}
            >
              <SmartImage src="/evidencias/resumo_2025.jpeg" alt="Resumo 2025" className="group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end p-10">
                 <div>
                    <div className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] mb-2">Relatório Elite</div>
                    <div className="text-2xl font-black text-white italic">FULL YEAR 2025</div>
                 </div>
              </div>
            </motion.div>
            <motion.div 
               whileHover={{ y: -10 }}
               className="relative rounded-[3rem] overflow-hidden border border-zinc-800 bg-zinc-900 group cursor-pointer"
               onClick={() => setSelectedImage("/evidencias/resumo_2024.jpeg")}
            >
              <SmartImage src="/evidencias/resumo_2024.jpeg" alt="Resumo 2024" className="group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end p-10">
                 <div>
                    <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-2">Relatório Elite</div>
                    <div className="text-2xl font-black text-white italic">FULL YEAR 2024</div>
                 </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="evolution" className="mb-16 md:mb-20 grid lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-4">
             <motion.div 
               initial={{ opacity: 0, scale: 0.98 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="bg-[#0c0c0e] border border-zinc-800/80 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 backdrop-blur-sm"
             >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 md:mb-10">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
                       <Activity className="w-5 h-5 text-green-500" /> Meu Histórico de Performance
                    </h3>
                    <p className="text-[10px] md:text-xs text-zinc-500 mt-1 font-medium italic">Minha evolução de score nas últimas 30 sessões competitivas</p>
                  </div>
                  <div className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-[9px] md:text-[10px] font-black text-zinc-400 tracking-widest uppercase">
                    Liga {stats?.currentTier}
                  </div>
                </div>

                <div className="h-[250px] sm:h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#58cc02" stopOpacity={0.15}/>
                          <stop offset="100%" stopColor="#58cc02" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        stroke="#3f3f46" 
                        fontSize={9} 
                        tickLine={false} 
                        axisLine={false} 
                        dy={15}
                        interval={2} 
                      />
                      <YAxis stroke="#3f3f46" fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#09090b", borderRadius: "16px", border: "1px solid #18181b", fontSize: "12px", padding: "12px" }}
                        itemStyle={{ color: "#58cc02", fontWeight: "bold" }}
                        labelStyle={{ color: "#71717a", marginBottom: "4px", fontSize: "10px" }}
                        labelFormatter={(label, data) => data[0]?.payload?.fullDate || label}
                      />
                      <Area type="monotone" dataKey="score" stroke="#58cc02" strokeWidth={3} fill="url(#scoreGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </motion.div>

             <motion.div 
               initial={{ opacity: 0, scale: 0.98 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="bg-[#0c0c0e] border border-zinc-800/80 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 backdrop-blur-sm"
             >
                <div className="flex items-center justify-between mb-8 md:mb-10">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
                       <Calendar className="w-5 h-5 text-blue-500" /> Minha Evolução Mensal (XP)
                    </h3>
                    <p className="text-[10px] md:text-xs text-zinc-500 mt-1 font-medium italic">Meu volume total de XP acumulado por mês ao longo dos anos</p>
                  </div>
                </div>

                <div className="h-[250px] sm:h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyXPData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#3f3f46" 
                        fontSize={9} 
                        tickLine={false} 
                        axisLine={false} 
                        dy={15}
                        interval={4}
                      />
                      <YAxis stroke="#3f3f46" fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#09090b", borderRadius: "16px", border: "1px solid #18181b", fontSize: "12px", padding: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
                        itemStyle={{ color: "#3b82f6", fontWeight: "bold" }}
                        labelStyle={{ color: "#71717a", marginBottom: "4px", fontSize: "10px" }}
                        labelFormatter={(label, data) => data[0]?.payload?.fullDate || label}
                        cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                      />
                      <Bar dataKey="xp" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                        {monthlyXPData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#3b82f6" : "#60a5fa"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </motion.div>

             <motion.div 
               initial={{ opacity: 0, scale: 0.98 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="bg-[#0c0c0e] border border-zinc-800/80 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 backdrop-blur-sm lg:col-span-3"
             >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 md:mb-10">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
                       <History className="w-5 h-5 text-purple-500" /> Detalhamento Mensal de Imersão (Minutos)
                    </h3>
                    <p className="text-[10px] md:text-xs text-zinc-500 mt-1 font-medium italic">Estimativa de minutos estudados por mês baseada na distribuição de XP anual</p>
                  </div>
                </div>

                <div className="h-[250px] sm:h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyMinutesData}>
                      <defs>
                        <linearGradient id="minGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#a855f7" stopOpacity={0.2}/>
                          <stop offset="100%" stopColor="#a855f7" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#3f3f46" 
                        fontSize={9} 
                        tickLine={false} 
                        axisLine={false} 
                        dy={15}
                        interval={4}
                      />
                      <YAxis stroke="#3f3f46" fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#09090b", borderRadius: "16px", border: "1px solid #18181b", fontSize: "12px", padding: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
                        itemStyle={{ color: "#a855f7", fontWeight: "bold" }}
                        labelStyle={{ color: "#71717a", marginBottom: "4px", fontSize: "10px" }}
                        labelFormatter={(label, data) => data[0]?.payload?.fullDate || label}
                      />
                      <Area type="monotone" dataKey="minutes" name="Minutos" stroke="#a855f7" strokeWidth={3} fill="url(#minGrad)" activeDot={{ r: 6, stroke: '#09090b', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </motion.div>

             {/* GANTT CHART EVOLUTION */}
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="bg-[#0c0c0e] border border-zinc-800/80 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 backdrop-blur-sm lg:col-span-3"
             >
                <div className="mb-8 md:mb-10 text-center sm:text-left">
                  <h3 className="text-lg md:text-xl font-bold flex items-center justify-center sm:justify-start gap-2">
                    <Target className="w-5 h-5 text-blue-500" /> Roadmap de Proficiência (CEFR)
                  </h3>
                  <p className="text-[10px] md:text-xs text-zinc-500 mt-1 font-medium italic">Evolução temporal por níveis de proficiência europeus</p>
                </div>

                <div className="space-y-5 md:space-y-6">
                  <GanttRow label="A1" years="2021" progress={100} color="bg-blue-800" delay={0.1} />
                  <GanttRow label="A2" years="2022 - 2023" progress={100} color="bg-blue-700" delay={0.2} />
                  <GanttRow label="B1" years="2024" progress={100} color="bg-blue-600" delay={0.3} />
                  <GanttRow label="B2" years="2025 - 2026" progress={85} color="bg-green-600" delay={0.4} isCurrent />
                  
                  {/* Next Step */}
                  <div className="pt-8 mt-8 border-t border-zinc-800/50">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center animate-pulse">
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                          <div className="text-sm font-black text-white italic">CONTINUAR NO DUOLINGO</div>
                          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Foco em Manutenção e Fluência</div>
                        </div>
                      </div>
                      
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="p-6 rounded-[2rem] bg-gradient-to-r from-blue-600/20 to-green-600/20 border border-blue-500/30 flex items-center gap-6 shadow-xl"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                          <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">PRÓXIMO GRANDE PASSO</div>
                          <div className="text-lg font-black text-white italic tracking-tight">DUOLINGO ENGLISH TEST (DET)</div>
                          <div className="text-[9px] text-zinc-400 font-medium">Certification & Academic validation level B2 Initial</div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
             </motion.div>
          </div>

          {/* 2022 DEEP DIVE ANALYSIS */}
          <section id="historical-2022" className="lg:col-span-3 mt-8 md:mt-12">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="bg-gradient-to-br from-zinc-900 to-[#0c0c0e] border border-zinc-800 rounded-[2.5rem] md:rounded-[3rem] p-6 sm:p-10 md:p-12 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                 <History className="w-64 h-64 md:w-80 md:h-80 text-green-500" />
              </div>
              
              <div className="relative z-10">
                <div className="mb-8 md:mb-12 text-center md:text-left">
                  <h2 className="text-[9px] md:text-[10px] font-black text-green-500 uppercase tracking-[0.4em] mb-4">Deep-Dive Histórico</h2>
                  <h3 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase mb-6">2022: Meu Ciclo da Consistência.</h3>
                  <p className="text-sm md:text-zinc-400 font-medium leading-relaxed max-w-3xl">
                    Em 2022, minha trajetória no Duolingo foi marcada pela construção de consistência competitiva. Comecei a entender o ecossistema e foquei na base técnica necessária para as fases seguintes.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 md:gap-8 text-center md:text-left">
                  <div className="p-6 md:p-8 rounded-[2rem] bg-zinc-950/50 border border-zinc-800/50 hover:border-green-500/20 transition-all group flex flex-col items-center md:items-start">
                    <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6">
                      <Trophy className="w-6 h-6 text-green-500" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-4 italic">Minha Competitividade</h4>
                    <p className="text-[11px] md:text-xs text-zinc-500 leading-relaxed font-medium">
                      Iniciei 2022 com registros progressivos, subindo gradualmente de nível e entrando estrategicamente no ritmo das ligas.
                    </p>
                  </div>

                  <div className="p-6 md:p-8 rounded-[2rem] bg-zinc-950/50 border border-zinc-800/50 hover:border-blue-500/20 transition-all group flex flex-col items-center md:items-start">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
                      <Zap className="w-6 h-6 text-blue-500" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-4 italic">Virada do Ano</h4>
                    <p className="text-[11px] md:text-xs text-zinc-500 leading-relaxed font-medium">
                      Reta final agressiva em dezembro: scores saltando para 8k+ semanais. Transição de adaptação para aceleração real com volume de disputa de elite.
                    </p>
                  </div>

                  <div className="p-6 md:p-8 rounded-[2rem] bg-zinc-950/50 border border-zinc-800/50 hover:border-purple-500/20 transition-all group flex flex-col items-center md:items-start">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6">
                      <Target className="w-6 h-6 text-purple-500" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-4 italic">Leitura Estratégica</h4>
                    <p className="text-[11px] md:text-xs text-zinc-500 leading-relaxed font-medium">
                      Ano de fundação da disciplina. Transição da presença básica para uma lógica de competição de alta performance, elevando o patamar semanal.
                    </p>
                  </div>
                </div>

                <div className="mt-8 md:mt-12 p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] bg-green-500/5 border border-green-500/10 flex flex-col md:flex-row items-center gap-8 md:gap-12 text-center md:text-left">
                   <div className="flex-1">
                      <div className="text-[9px] md:text-[10px] font-black text-green-500 uppercase tracking-widest mb-4">Métricas de Consolidação Final (Snapshot 2022)</div>
                      <p className="text-[13px] md:text-sm text-zinc-400 font-medium italic leading-relaxed">
                        "O histórico permite tratar 2022 como o início mensurável da sua escalada. Foram 343.368 pontos acumulados e 3.525 lições concluídas, servindo como a base técnica para a fluência B2 atingida nos anos subsequentes."
                      </p>
                   </div>
                   <div className="grid grid-cols-2 gap-4 shrink-0 w-full md:w-auto">
                      <div className="px-4 py-3 md:px-6 md:py-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex-1">
                         <div className="text-[8px] md:text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Pontos</div>
                         <div className="text-lg md:text-xl font-black text-white italic">343k+</div>
                      </div>
                      <div className="px-4 py-3 md:px-6 md:py-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex-1">
                         <div className="text-[8px] md:text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Lições</div>
                         <div className="text-lg md:text-xl font-black text-white italic">3.5k+</div>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </section>
          
          {/* 2023 DEEP DIVE ANALYSIS */}
          <section id="historical-2023" className="lg:col-span-3 mt-8 md:mt-12 pb-16 md:pb-20 border-b border-zinc-800/50">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="bg-gradient-to-br from-zinc-900 to-[#0c0c0e] border border-zinc-800 rounded-[2.5rem] md:rounded-[3rem] p-6 sm:p-10 md:p-12 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                 <History className="w-64 h-64 md:w-80 md:h-80 text-blue-500" />
              </div>
              
              <div className="relative z-10">
                <div className="mb-8 md:mb-12 text-center md:text-left">
                  <h2 className="text-[9px] md:text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-4">Deep-Dive Histórico</h2>
                  <h3 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase mb-6">2023: Minha Sustentação em Alto Nível.</h3>
                  <p className="text-sm md:text-zinc-400 font-medium leading-relaxed max-w-3xl">
                    Em 2023, minha jornada entrou em uma fase de presença forte e soberana. Mantive pontuações altas consistentemente, provando que meu hábito estava consolidado e robusto.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 md:gap-8 text-center md:text-left">
                  <div className="p-6 md:p-8 rounded-[2rem] bg-zinc-950/50 border border-zinc-800/50 hover:border-blue-500/20 transition-all group flex flex-col items-center md:items-start">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
                      <Trophy className="w-6 h-6 text-blue-500" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-4 italic">Ritmo Competitivo</h4>
                    <p className="text-[11px] md:text-xs text-zinc-500 leading-relaxed font-medium">
                      Estabilidade semanal elevada: scores entre 7k e 8.4k XP. Presença ininterrupta entre Maio e Setembro com regularidade de elite.
                    </p>
                  </div>

                  <div className="p-6 md:p-8 rounded-[2rem] bg-zinc-950/50 border border-zinc-800/50 hover:border-orange-500/20 transition-all group flex flex-col items-center md:items-start">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6">
                      <TrendingUp className="w-6 h-6 text-orange-500" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-4 italic">Oscilações Curadas</h4>
                    <p className="text-[11px] md:text-xs text-zinc-500 leading-relaxed font-medium">
                      Breve desaceleração em Outubro/Novembro, seguida de recuperação em Dezembro, mantendo a rotina viva e blindando o hábito contra baixas.
                    </p>
                  </div>

                  <div className="p-6 md:p-8 rounded-[2rem] bg-zinc-950/50 border border-zinc-800/50 hover:border-green-500/20 transition-all group flex flex-col items-center md:items-start">
                    <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6">
                      <Award className="w-6 h-6 text-green-500" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-4 italic">Medalhas Ativas</h4>
                    <p className="text-[11px] md:text-xs text-zinc-500 leading-relaxed font-medium">
                      Snapshot visual com medalhas em Jan, Mai, Jun, Ago, Set e Dez. Conquistas espalhadas que validam a continuidade estratégica do curso.
                    </p>
                  </div>
                </div>

                <div className="mt-8 md:mt-12 p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] bg-blue-500/5 border border-blue-500/10 flex flex-col md:flex-row items-center gap-8 md:gap-12 text-center md:text-left">
                   <div className="flex-1">
                      <div className="text-[9px] md:text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">Leitura Estratégica Transversal</div>
                      <p className="text-[13px] md:text-sm text-zinc-400 font-medium italic leading-relaxed">
                        "Enquanto 2022 foi o ano da escalada, 2023 foi o ano da soberania. Através dos logs, vemos que a jornada deixou de ser por 'descoberta' e passou a ser por 'domínio', com registros sustentados de alta performance."
                      </p>
                   </div>
                   <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-950 cursor-pointer" onClick={() => setSelectedImage("/evidencias/medalhas_2023.jpeg")}>
                      <SmartImage src="/evidencias/medalhas_2023.jpeg" alt="Medalhas 2023" />
                   </div>
                </div>
              </div>
            </motion.div>
          </section>
          
          {/* 2024 DEEP DIVE ANALYSIS */}
          <section id="historical-2024" className="lg:col-span-3 mt-12 pb-20 border-b border-zinc-800/50">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="bg-gradient-to-br from-zinc-900 to-[#0c0c0e] border border-zinc-800 rounded-[3rem] p-12 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                 <History className="w-80 h-80 text-emerald-500" />
              </div>
              
              <div className="relative z-10">
                <div className="mb-12">
                  <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-4">Deep-Dive Histórico</h2>
                  <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-6">2024: Minha Performance de Elite.</h3>
                  <p className="text-zinc-400 font-medium leading-relaxed max-w-3xl">
                    Em 2024, saí de um padrão forte para um nível de alto rendimento sustentado. Foi um ano de intensidade fora do comum, onde minha constância dominou o ecossistema global.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-8 rounded-[2rem] bg-zinc-950/50 border border-zinc-800/50 hover:border-emerald-500/20 transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
                      <Zap className="w-6 h-6 text-emerald-500" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-4 italic">Arranque & Escalada</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                      Início em aceleração (560 a 2.1k XP). A partir de Março, saltos consistentes para a faixa de 2.8k XP, adensando a rotina agressiva.
                    </p>
                  </div>

                  <div className="p-8 rounded-[2rem] bg-zinc-950/50 border border-zinc-800/50 hover:border-blue-500/20 transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
                      <Activity className="w-6 h-6 text-blue-500" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-4 italic">Coração Competitivo</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                      Maio a Agosto: o pico da jornada. Repetição de semanas altíssimas, atingindo recordes de 5.8k e 5.9k XP semanais.
                    </p>
                  </div>

                  <div className="p-8 rounded-[2rem] bg-zinc-950/50 border border-zinc-800/50 hover:border-purple-500/20 transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6">
                      <Calendar className="w-6 h-6 text-purple-500" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-4 italic">Segundo Semestre</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                      Continuidade sem colapso. Manutenção de tração com registros estáveis entre 2.5k e 6k XP até o fim do ciclo anual.
                    </p>
                  </div>

                  <div className="p-8 rounded-[2rem] bg-zinc-950/50 border border-zinc-800/50 hover:border-green-500/20 transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6">
                      <Award className="w-6 h-6 text-green-500" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-4 italic">Trajeto Visual</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                      Conquistas em 8 meses do ano (Fev, Mar, Abr, Jun, Jul, Ago, Out, Dez). Intensidade traduzida em marcos visuais recorrentes.
                    </p>
                  </div>
                </div>

                <div className="mt-12 p-10 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/10 flex flex-col md:flex-row items-center gap-12">
                   <div className="flex-1">
                      <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4">Análise de Performance de Elite</div>
                      <p className="text-sm text-zinc-400 font-medium italic leading-relaxed">
                        "2024 foi o ano da consolidação em alto nível. Com densidade competitiva e permanência em ritmo elevado por todo o calendário, a trajetória ganhou cara de performance de elite, transformando disciplina em resultados visíveis e dominantes."
                      </p>
                   </div>
                   <div className="w-48 h-32 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-950 cursor-pointer" onClick={() => setSelectedImage("/evidencias/medalhas_2024.jpeg")}>
                      <SmartImage src="/evidencias/medalhas_2024.jpeg" alt="Medalhas 2024" />
                   </div>
                </div>
              </div>
            </motion.div>
          </section>
          
          {/* 2025 DEEP DIVE ANALYSIS */}
          <section id="historical-2025" className="lg:col-span-3 mt-12 pb-20 border-b border-zinc-800/50">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="bg-gradient-to-br from-zinc-900 to-[#0c0c0e] border border-zinc-800 rounded-[3rem] p-12 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                 <History className="w-80 h-80 text-purple-500" />
              </div>
              
              <div className="relative z-10">
                <div className="mb-12">
                  <h2 className="text-[10px] font-black text-purple-500 uppercase tracking-[0.4em] mb-4">Deep-Dive Histórico</h2>
                  <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-6">2025: Minha Legitimidade de Elite.</h3>
                  <p className="text-zinc-400 font-medium leading-relaxed max-w-3xl">
                    Em 2025, consolidei minha soberania técnica. Foi o ano em que validei meu nível com o DET (score 130), mantive minha posição de destaque nos circuitos de elite e me preparei para a reta final do curso.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-8 rounded-[2rem] bg-zinc-950/50 border border-zinc-800/50 hover:border-purple-500/20 transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6">
                      <Zap className="w-6 h-6 text-purple-500" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-4 italic">Arranque & Torneios</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                      Janeiro with pico de 8k XP e entrada imediata no Torneio de Diamante. Sustentação de volume de elite em ambientes altamente competitivos.
                    </p>
                  </div>

                  <div className="p-8 rounded-[2rem] bg-zinc-950/50 border border-zinc-800/50 hover:border-blue-500/20 transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
                      <Flame className="w-6 h-6 text-blue-500" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-4 italic">Recordes Pessoais</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                      Pura Perfeição (Maio) e Recorde de Ofensiva (375 dias em Março). Top XP do dia de 2.3k validado em Janeiro.
                    </p>
                  </div>

                  <div className="p-8 rounded-[2rem] bg-zinc-950/50 border border-zinc-800/50 hover:border-orange-500/20 transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6">
                      <Target className="w-6 h-6 text-orange-500" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-4 italic">Retomada Estratégica</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                      Vale temporário em Março seguido de forte recuperação em Abril/Maio (picos de 5.3k XP), blindando o hábito contra desistências.
                    </p>
                  </div>

                  <div className="p-8 rounded-[2rem] bg-zinc-950/50 border border-zinc-800/50 hover:border-green-500/20 transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6">
                      <Crown className="w-6 h-6 text-green-500" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-4 italic">Status de Prestígio</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                      Presença efetiva no 'Clube dos Campeões' em Outubro. Medalhas ativas em 8 meses, comprovando a legitimidade do esforço anual.
                    </p>
                  </div>
                </div>

                <div className="mt-12 p-10 rounded-[2.5rem] bg-purple-500/5 border border-purple-500/10 flex flex-col md:flex-row items-center gap-12">
                   <div className="flex-1">
                      <div className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-4">O Veredito da Maestria</div>
                      <p className="text-sm text-zinc-400 font-medium italic leading-relaxed">
                        "2025 marca o ápice operacional da jornada. Mais do que XP acumulado, o score 130 no DET e a consistência nas ligas elevaram meu perfil para a categoria de 'Liderança Acadêmica', preparando o terreno para minha graduação."
                      </p>
                   </div>
                   <div className="w-48 h-32 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-950 cursor-pointer" onClick={() => setSelectedImage("/evidencias/medalhas_2025.jpeg")}>
                      <SmartImage src="/evidencias/medalhas_2025.jpeg" alt="Medalhas 2025" />
                   </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* 2026 DEEP DIVE ANALYSIS */}
          <section id="historical-2026" className="lg:col-span-3 mt-12 pb-20 border-b border-zinc-800/50">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="bg-gradient-to-br from-zinc-900 to-[#0c0c0e] border border-zinc-800 rounded-[3rem] p-12 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                 <History className="w-80 h-80 text-yellow-500" />
              </div>
              
              <div className="relative z-10">
                <div className="mb-12">
                  <h2 className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.4em] mb-4">Deep-Dive Histórico</h2>
                  <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-6">2026: Conclusão e Sustentação.</h3>
                  <p className="text-zinc-400 font-medium leading-relaxed max-w-3xl">
                    O ano da vitória definitiva. Em 07/05/2026, atingi o marco final ao concluir 100% da grade de inglês. Mesmo após a conquista, preservo meu ritmo de elite e minha dedicação diária.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-8 rounded-[2rem] bg-zinc-950/50 border border-zinc-800/50 hover:border-yellow-500/20 transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center mb-6">
                      <Zap className="w-6 h-6 text-yellow-500" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-4 italic">Arranque Variável</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                      Janeiro com picos de 4.1k XP, seguido por variação operacional e recuperação imediata, mantendo-se longe de um uso casual.
                    </p>
                  </div>

                  <div className="p-8 rounded-[2rem] bg-zinc-950/50 border border-zinc-800/50 hover:border-blue-500/20 transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
                      <TrendingUp className="w-6 h-6 text-blue-500" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-4 italic">Estabilização Sólida</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                      Fevereiro apresenta retomada gradual e estabilização patamar sólido (3.4k - 4k XP), reencontrando o ritmo com agilidade.
                    </p>
                  </div>

                  <div className="p-8 rounded-[2rem] bg-zinc-950/50 border border-zinc-800/50 hover:border-emerald-500/20 transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
                      <Target className="w-6 h-6 text-emerald-500" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-4 italic">Consistência de Março</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                      O ponto mais forte do ano (WIP): sequência estável entre 2.1k e 3.5k XP sem perda de tração competitiva.
                    </p>
                  </div>

                  <div className="p-8 rounded-[2rem] bg-zinc-950/50 border border-zinc-800/50 hover:border-purple-500/20 transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6">
                      <History className="w-6 h-6 text-purple-500" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-4 italic">Circuito Avançado</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                      Presença recorrente em Torneios de Diamante em Abril e manutenção de atividade até Maio, consolidando o hábito como estável.
                    </p>
                  </div>
                </div>

                <div className="mt-12 p-10 rounded-[2.5rem] bg-yellow-500/5 border border-yellow-500/10 flex flex-col md:flex-row items-center gap-12">
                   <div className="flex-1">
                      <div className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-4">Análise de Manutenção</div>
                      <p className="text-sm text-zinc-400 font-medium italic leading-relaxed">
                        "Em 2026, o desafio deixou de ser sobre 'provar capacidade' e passou a ser sobre 'habitar a excelência'. O perfil mostra que, mesmo após atingir os maiores marcos da plataforma, a disciplina permanece como o pilar central."
                      </p>
                   </div>
                   <div className="w-48 h-32 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-950 cursor-pointer" onClick={() => setSelectedImage("/evidencias/medalhas_2026.jpeg")}>
                      <SmartImage src="/evidencias/medalhas_2026.jpeg" alt="Medalhas 2026" />
                   </div>
                </div>
              </div>
            </motion.div>
          </section>

          <div className="space-y-4">
             <motion.div 
               initial={{ opacity: 0, x: 20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="bg-zinc-900/50 border border-zinc-800/50 rounded-[2.5rem] p-10 h-full flex flex-col"
             >
                <h3 className="text-xl font-bold mb-8 flex items-center gap-2 italic">
                  <MessageSquareQuote className="w-5 h-5 text-blue-500" /> Insight Executivo
                </h3>
                <div className="flex-1 space-y-6 text-sm text-zinc-400 font-medium leading-[1.8]">
                  <p className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-green-500 before:rounded-full">
                    A análise de <span className="text-zinc-100 italic">Leaderboards</span> demonstra um padrão sustentado de alta performance, com score médio que supera em 240% a média de usuários casuais.
                  </p>
                  <p className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-blue-500 before:rounded-full">
                    A transição recorrente para o <span className="text-zinc-100 italic">Diamond Tournament</span> indica não apenas o domínio do idioma, mas uma estratégia de gamificação avançada.
                  </p>
                  <p className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-yellow-500 before:rounded-full">
                    A disciplina é o ativo principal: 724 dias ativos representam um comprometimento de nível superior, raramente observado em usuários autônomos.
                  </p>
                </div>
                <div className="mt-10 p-6 rounded-3xl bg-green-500/5 border border-green-500/20 text-center">
                   <div className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1">Veredito</div>
                   <div className="text-zinc-100 font-bold italic text-lg">Fluência em Manutenção.</div>
                </div>
             </motion.div>
          </div>
        </section>

        {/* YEARLY XP DISTRIBUTION */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black text-green-500 uppercase tracking-[0.4em]">Volume de Aprendizado por Ciclo</h3>
            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Distribuição Proporcional (XP)</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {["2021", "2022", "2023", "2024", "2025", "2026"].map((year) => {
              const yearXp = stats?.xpPerYear?.[year] || 0;
              const maxYearXp = Math.max(...Object.values(stats?.xpPerYear || {}).map(v => Number(v)), 1);
              return (
                <motion.div
                  key={year}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 hover:border-green-500/30 transition-all group"
                >
                  <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1 group-hover:text-green-500 transition-colors">{year}</div>
                  <div className="text-2xl font-black text-white italic">{yearXp > 1000 ? `${(yearXp / 1000).toFixed(1)}k` : yearXp}</div>
                  <div className="mt-4 h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }}
                       whileInView={{ width: `${(yearXp / maxYearXp) * 100}%` }}
                       transition={{ duration: 1, delay: 0.2 }}
                       className="h-full bg-gradient-to-r from-green-500 to-emerald-500" 
                     />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* SWOT ANALYSIS */}
        <section id="swot" className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-[10px] font-black text-green-500 uppercase tracking-[0.4em] mb-4">Minha Análise Estratégica</h2>
            <h3 className="text-4xl font-black italic tracking-tighter uppercase">Minha Análise SWOT.</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <SwotCard 
              type="STRENGTHS" 
              title="Forças" 
              icon={<ShieldCheck className="w-6 h-6" />}
              items={[
                "Consistência Absoluta: 375+ dias de ofensiva ininterrupta.",
                "Volume Massivo: Mais de 357.000 XP acumulado.",
                "Stamina Competitiva: Estabilidade crônica na Liga Diamante.",
                "Dedicação Acadêmica: Conclusão de 100% da grade curricular."
              ]}
              color="text-green-500"
              borderColor="border-green-500/20"
              bgColor="bg-green-500/5"
            />
            <SwotCard 
              type="WEAKNESSES" 
              title="Fraquezas" 
              icon={<AlertTriangle className="w-6 h-6" />}
              items={[
                "Gap de Speaking: Menor exposição a conversação em tempo real.",
                "Dependência de Gamification: Foco intenso em métricas de XP.",
                "Vocabulário Específico: Necessidade de expansão em nichos técnicos fora da grade standard."
              ]}
              color="text-orange-500"
              borderColor="border-orange-500/20"
              bgColor="bg-orange-500/5"
            />
            <SwotCard 
              type="OPPORTUNIDADES" 
              title="Oportunidades" 
              icon={<Lightbulb className="w-6 h-6" />}
              items={[
                "Certificação DET: Validação oficial de nível B2 Iniciante.",
                "Imersão Profissional: Aplicação prática em ambientes corporativos internacionais.",
                "Networking: Utilização do inglês como ponte para comunidades globais."
              ]}
              color="text-blue-500"
              borderColor="border-blue-500/20"
              bgColor="bg-blue-500/5"
            />
            <SwotCard 
              type="THREATS" 
              title="Ameaças" 
              icon={<Zap className="w-6 h-6" />}
              items={[
                "Platô de Aprendizado: Risco de estagnação após conclusão do curso.",
                "Burnout Digital: Cansaço do modelo repetitivo de lições.",
                "Perda de Cadência: Desconstrução do hábito sem novos marcos claros."
              ]}
              color="text-red-500"
              borderColor="border-red-500/20"
              bgColor="bg-red-500/5"
            />
          </div>
        </section>

        {/* TIMELINE */}
        <section id="timeline" className="mb-20">
          <h2 className="text-sm font-black text-zinc-500 uppercase tracking-[0.4em] mb-12 text-center">Trajectory Stages</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {timelineEvents.map((event, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-8 hover:bg-zinc-800/20 transition-all cursor-default"
              >
                <div className="text-green-500 text-[10px] font-black mb-3">{event.date}</div>
                <h4 className="font-bold text-base mb-3 tracking-tight">{event.title}</h4>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">{event.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* YEARLY MEDALS HISTORY */}
        <section id="medals-history" className="mb-20">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-4">Historical Achievements</h2>
              <h3 className="text-3xl font-bold tracking-tight italic uppercase">Trajetória Cronológica de Conquistas.</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            <YearMedalCard 
              year="2026" 
              status="Conclusão Integral" 
              description="O marco final: Encerramento completo do curso em 07/05/2026. Preservação do ritmo competitivo em torneios avançados."
              image="/evidencias/medalhas_2026.jpeg"
              onSelect={setSelectedImage}
            />
            <YearMedalCard 
              year="2025" 
              status="Legitimidade de Elite" 
              description="Consolidação técnica: Score 130 no DET, presença constante no Clube dos Campeões e reta final da grade acadêmica."
              image="/evidencias/medalhas_2025.jpeg"
              onSelect={setSelectedImage}
            />
            <YearMedalCard 
              year="2024" 
              status="B1 / B1+" 
              description="O ano do rendimento sustentado: picos frequentes de 5.9k XP semanais e marcos visuais em 8 meses do ano."
              image="/evidencias/medalhas_2024.jpeg"
              onSelect={setSelectedImage}
            />
            <YearMedalCard 
              year="2023" 
              status="A2 Forte" 
              description="O ano da sustentação: records visuais de medalhas em 6 meses chave e volume robusto de disputa semanal."
              image="/evidencias/medalhas_2023.jpeg"
              onSelect={setSelectedImage}
            />
            <YearMedalCard 
              year="2021-2022" 
              status="A1 → A2" 
              description="A gênese: transição da presença básica para uma lógica de competição consistente, somando 343.368 pontos e 3.5k lições."
              image="/evidencias/medalhas_2022_2021.jpeg"
              onSelect={setSelectedImage}
            />
          </div>
        </section>

        {/* CURSO CONCLUÍDO - EVIDÊNCIA MÁXIMA */}
        <section className="mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-12 overflow-hidden relative group cursor-pointer"
            onClick={() => setSelectedImage("/evidencias/conclusao_curso.jpeg")}
          >
            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
               <Trophy className="w-64 h-64 text-yellow-500" />
            </div>
            <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
               <div className="flex-1">
                  <h2 className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.4em] mb-6">Final Milestone</h2>
                  <h3 className="text-4xl font-bold tracking-tight mb-8 italic">Conclusão Integral em 07/05/2026.</h3>
                  <p className="text-zinc-400 font-medium leading-relaxed max-w-2xl mb-8">
                     O fechamento do meu ciclo de excelência. Em 07/05/2026, finalizei integralmente todas as unidades do curso, consolidando meu domínio sobre todas as competências propostas pelo Duolingo.
                  </p>
                  <div className="flex gap-4">
                     <div className="px-6 py-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-black uppercase tracking-widest">Destaque Platinum</div>
                     <div className="px-6 py-3 rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-black uppercase tracking-widest">100% Completo</div>
                  </div>
               </div>
               <div className="w-full lg:w-72 aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 bg-zinc-950 group-hover:rotate-2 transition-transform duration-500">
                  <SmartImage src="/evidencias/conclusao_curso.jpeg" alt="Conclusão de Curso" className="group-hover:scale-105 object-center" />
               </div>
            </div>
          </motion.div>
        </section>

        {/* EVIDENCIAS VISUAIS (DOSSIÊ CONSOLIDADO) */}
        <section id="evidencias" className="mb-20">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-[10px] font-black text-green-500 uppercase tracking-[0.4em] mb-4">Evidence Repository</h2>
              <h3 className="text-3xl font-bold tracking-tight italic uppercase">Dossiê de Verificação Visual.</h3>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
               <ImageIcon className="w-4 h-4 text-zinc-600" /> {EVIDENCIAS.length} Provas Legíveis
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {EVIDENCIAS.map((ev, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -10, rotate: idx % 2 === 0 ? 1 : -1 }}
                onClick={() => setSelectedImage(ev.src)}
                className="aspect-[3/4] relative overflow-hidden rounded-[2.5rem] border border-zinc-800 bg-zinc-900 cursor-pointer shadow-xl group"
              >
                <SmartImage src={ev.src} alt={ev.title} className="group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                  <div className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1">{ev.title}</div>
                  <div className="text-[9px] text-white font-medium leading-tight">{ev.caption}</div>
                  <div className="mt-3 w-8 h-8 rounded-xl bg-green-500 flex items-center justify-center text-black">
                     <Maximize2 className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* INVENTORY & RESOURCES */}
        <div id="inventory">
           <div className="grid lg:grid-cols-2 gap-8 mb-20">
              {/* Inventory/Intensity */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-[#0c0c0e] border border-zinc-800/80 rounded-[2.5rem] p-10"
              >
                 <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-orange-500" /> Intensidade e Gestão de Recursos
                 </h3>
                 <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1 space-y-4">
                       <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800">
                          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Streak Freezes Úteis</div>
                          <div className="text-3xl font-black text-orange-500 italic">{stats?.streakFreezesUsed} x</div>
                          <p className="text-[10px] text-zinc-500 mt-2 font-medium italic">Sinal de proteção estratégica de hábito em períodos de alta carga externa.</p>
                       </div>
                       <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800">
                          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Itens Adquiridos</div>
                          <div className="text-3xl font-black text-blue-500 italic">{inventory.length} total</div>
                       </div>
                    </div>
                    <div className="w-48 h-48">
                       <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={itemStats}>
                           <Bar dataKey="value" fill="#ff9900" radius={[4, 4, 4, 4]}>
                              {itemStats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#58cc02" : "#2563eb"} />
                              ))}
                           </Bar>
                         </BarChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
              </motion.div>

              {/* Test Attempts */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-zinc-900/50 border border-zinc-800/50 rounded-[2.5rem] p-10 flex flex-col"
              >
                 <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <FileSearch className="w-5 h-5 text-purple-500" /> Registro de Testes (DET)
                 </h3>
                 <div className="space-y-4 flex-1">
                    {tests.length > 0 ? tests.map((t, i) => (
                      <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 group hover:border-zinc-700 transition-colors">
                         <div>
                           <div className="text-xs font-bold text-zinc-100">{t["Test Type"]}</div>
                           <div className="text-[10px] text-zinc-500 font-medium italic mt-1">{t["Test Datetime"]}</div>
                         </div>
                         <div className="text-right">
                           <div className="text-[10px] font-black px-3 py-1 rounded-full bg-zinc-800 text-zinc-500 uppercase mb-1">Status: {t["Test Status"]}</div>
                           <div className="text-[9px] text-zinc-600 font-bold italic tracking-tighter">Tentativa registrada s/ certificação</div>
                         </div>
                      </div>
                    )) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-zinc-600">
                         <FileSearch className="w-12 h-12 opacity-10 mb-4" />
                         <p className="text-xs font-bold italic">Nenhum teste registrado nesta fase.</p>
                      </div>
                    )}
                 </div>
              </motion.div>
           </div>
        </div>

        {/* CEFR EVOLUTION TABLE */}
        <section className="mb-20 overflow-x-auto pb-4">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 min-w-[600px] lg:min-w-0">
            <h2 className="text-[9px] md:text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-8 md:mb-10 text-center">Minha Evolução CEFR & Performance</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Ano Ciclo</th>
                    <th className="py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Nível CEFR</th>
                    <th className="py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Nota</th>
                    <th className="py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Foco de Melhoria / Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                    <td className="py-6 text-zinc-100">2026 (WIP)</td>
                    <td className="py-6"><span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black uppercase">Manutenção Elite</span></td>
                    <td className="py-6 text-center text-zinc-100 font-bold italic">8.5</td>
                    <td className="py-6 text-zinc-400">Preservação de Ritmo & Speaking Practice.</td>
                  </tr>
                  <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                    <td className="py-6 text-zinc-100">2025</td>
                    <td className="py-6"><span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase">B2 Inicial</span></td>
                    <td className="py-6 text-center text-zinc-100 font-bold italic">7.8</td>
                    <td className="py-6 text-zinc-400">Imersão Massiva & Supremacia Competitiva.</td>
                  </tr>
                  <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                    <td className="py-6 text-zinc-100">2024</td>
                    <td className="py-6"><span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-500 text-[10px] font-black uppercase">B1 / B1+</span></td>
                    <td className="py-6 text-center text-zinc-100 font-bold italic">6.5</td>
                    <td className="py-6 text-zinc-400">Transição para Intermediário & Conforto de Leitura.</td>
                  </tr>
                  <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                    <td className="py-6 text-zinc-100">2023</td>
                    <td className="py-6"><span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase">A2 Forte</span></td>
                    <td className="py-6 text-center text-zinc-100 font-bold italic">5.2</td>
                    <td className="py-6 text-zinc-400">Consolidação de Vocabulário & Autonomia Base.</td>
                  </tr>
                  <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                    <td className="py-6 text-zinc-100">2022</td>
                    <td className="py-6"><span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase">A2 Inicial</span></td>
                    <td className="py-6 text-center text-zinc-100 font-bold italic">4.0</td>
                    <td className="py-6 text-zinc-400">Consistência Competitiva & Aceleração Final.</td>
                  </tr>
                  <tr className="hover:bg-zinc-800/20 transition-colors">
                    <td className="py-6 text-zinc-100">2021</td>
                    <td className="py-6"><span className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black uppercase">A1 (Gênese)</span></td>
                    <td className="py-6 text-center text-zinc-100 font-bold italic">2.5</td>
                    <td className="py-6 text-zinc-400">Sobrevivência & Fundações Absolutas do Zero.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-12 p-8 rounded-[2rem] bg-blue-500/5 border border-blue-500/10 text-center">
               <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Minha Reflexão Final</div>
               <p className="text-zinc-400 text-sm font-medium italic leading-relaxed">
                 "Minha transformação de A1 para B2 Iniciante em 5 anos é um marco de disciplina férrea. O gap atual entre Leitura (Nível Elite) e Speaking (Em desenvolvimento) é meu próximo grande desafio para atingir o nível C1+."
               </p>
            </div>
          </div>
        </section>

        {/* FINAL CLOSING */}
        <section className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-[2.5rem] md:rounded-[4rem] p-8 sm:p-12 md:p-20 text-center max-w-5xl mx-auto mb-24 relative overflow-hidden shadow-2xl">
           <div className="absolute inset-0 bg-green-500/5 blur-[120px] pointer-events-none" />
           <Trophy className="w-16 h-16 md:w-20 md:h-20 text-yellow-500 mx-auto mb-8 md:mb-10 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)] relative z-10" />
           <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 md:mb-8 italic uppercase relative z-10">Missão Cumprida.</h2>
           <p className="text-zinc-400 text-base md:text-xl leading-relaxed font-medium mb-12 md:mb-16 relative z-10 max-w-3xl mx-auto">
             Minha jornada é a prova cabal de que a disciplina, quando aliada à gamificação, transcende o entretenimento e se torna uma ferramenta de educação de elite. O encerramento integral da grade de Inglês é o meu marco final de um ciclo de excelência.
           </p>
           <div className="flex flex-wrap gap-4 md:gap-8 justify-center relative z-10">
              <div className="px-6 md:px-10 py-4 md:py-6 rounded-[1.5rem] md:rounded-[2rem] bg-zinc-900 border border-zinc-800 shadow-xl min-w-[140px]">
                <div className="text-[9px] md:text-[11px] font-black uppercase text-zinc-500 mb-2 tracking-[0.2em]">Caminho</div>
                <div className="font-bold text-green-500 text-xl md:text-2xl italic">100% Fim</div>
              </div>
              <div className="px-6 md:px-10 py-4 md:py-6 rounded-[1.5rem] md:rounded-[2rem] bg-zinc-900 border border-zinc-800 shadow-xl min-w-[140px]">
                <div className="text-[9px] md:text-[11px] font-black uppercase text-zinc-500 mb-2 tracking-[0.2em]">Fluência</div>
                <div className="font-bold text-blue-500 text-xl md:text-2xl italic">DET (130)</div>
              </div>
              <div className="px-6 md:px-10 py-4 md:py-6 rounded-[1.5rem] md:rounded-[2rem] bg-zinc-900 border border-zinc-800 shadow-xl min-w-[140px]">
                <div className="text-[9px] md:text-[11px] font-black uppercase text-zinc-500 mb-2 tracking-[0.2em]">Patamar</div>
                <div className="font-bold text-purple-500 text-xl md:text-2xl italic">Top 1%</div>
              </div>
           </div>
        </section>
      </main>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-[#09090b]/95 backdrop-blur-2xl cursor-zoom-out"
            onClick={() => setSelectedImage(null)}
          >
            {/* Close Button - Fixed strictly to avoid container overflow */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
              className="fixed top-6 right-6 z-[110] p-4 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all active:scale-95 shadow-2xl backdrop-blur-md pointer-events-auto"
            >
              <X className="w-8 h-8" />
            </button>

            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full h-full max-w-6xl flex flex-col items-center justify-center gap-6 pointer-events-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden">
                <SmartImage 
                  src={selectedImage || undefined}
                  alt="Expanded evidence"
                  objectFit="contain"
                  className="rounded-3xl border border-zinc-800 shadow-2xl pointer-events-auto bg-transparent shadow-[0_0_100px_rgba(34,197,94,0.1)]"
                />
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="pointer-events-auto px-6 py-3 rounded-full bg-zinc-900/90 border border-zinc-800 text-sm font-bold italic text-zinc-300 shadow-2xl backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-green-500" /> Registro Visual Autêntico • Raphael Serafim
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-40 max-w-7xl mx-auto px-6 border-t border-zinc-800 py-12 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black text-zinc-600 tracking-widest uppercase">
          <div>© 2026 Duoling Analytics & bull; Serafim Master Journey</div>
          <div className="flex gap-10">
            <a href="#" className="hover:text-zinc-400 transition-colors">Analytical Engine v2.4</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Privacy & Data Governance</a>
          </div>
      </footer>
      <MobileNav />
    </div>
  );
}

function MobileNav() {
  const [activeTab, setActiveTab] = useState("overview");

  const menuItems = [
    { id: "overview", label: "Geral", icon: ShieldCheck },
    { id: "evolution", label: "Stats", icon: Activity },
    { id: "swot", label: "Perfil", icon: Target },
    { id: "evidencias", label: "Provas", icon: ImageIcon },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] md:hidden">
      <div className="flex items-center gap-1 p-2 rounded-full bg-zinc-900 shadow-2xl border border-white/5 backdrop-blur-xl">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300",
                isActive ? "bg-green-500 text-black shadow-lg shadow-green-500/20" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "stroke-[3px]" : "stroke-2")} />
              {isActive && <span className="text-[10px] font-black uppercase tracking-tight">{item.label}</span>}
            </a>
          );
        })}
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon, sub }: { label: string, value: string, icon: React.ReactNode, sub: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-6 group hover:border-zinc-700/50 transition-all duration-300 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-green-500/0 group-hover:via-green-500/40 to-transparent transition-all" />
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{label}</span>
        <div className="p-2 rounded-xl bg-zinc-800/50 group-hover:bg-zinc-800 transition-colors">
          {icon}
        </div>
      </div>
      <div className="text-4xl font-black tracking-tighter mb-1 italic italic">{value}</div>
      <p className="text-[10px] font-bold text-zinc-500 lowercase tracking-wide">{sub}</p>
    </motion.div>
  );
}

function GanttRow({ label, years, progress, color, delay, isCurrent }: { label: string, years: string, progress: number, color: string, delay: number, isCurrent?: boolean }) {
  return (
    <div className="flex items-center gap-3 sm:gap-6 group">
      <div className="w-8 sm:w-12 text-[11px] sm:text-sm font-black text-zinc-500 group-hover:text-white transition-colors">{label}</div>
      <div className="flex-1 h-8 sm:h-9 bg-zinc-900/50 rounded-full border border-zinc-800/50 overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${progress}%` }}
          transition={{ duration: 1, delay }}
          className={cn("h-full relative", color, isCurrent && "shadow-[0_0_20px_rgba(34,197,94,0.3)]")}
        >
          {isCurrent && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          )}
        </motion.div>
        <div className="absolute inset-0 flex items-center px-4 justify-between">
          <span className="text-[8px] sm:text-[9px] font-black text-white/50 uppercase tracking-widest">{years}</span>
          {isCurrent && <span className="text-[8px] sm:text-[9px] font-black text-green-400 uppercase tracking-widest">Atual</span>}
        </div>
      </div>
    </div>
  );
}

function SwotCard({ type, title, items, icon, color, borderColor, bgColor }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn("p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border bg-opacity-50 backdrop-blur-sm flex flex-col", borderColor, bgColor)}
    >
      <div className={cn("inline-flex items-center gap-3 mb-6", color)}>
        <div className={cn("p-3 rounded-2xl bg-zinc-900/50 border", borderColor)}>
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] md:text-[10px] font-black opacity-50 tracking-[0.2em] uppercase">{type}</span>
          <span className="text-lg md:text-xl font-bold tracking-tight">{title}</span>
        </div>
      </div>
      <ul className="space-y-3 md:space-y-4">
        {items.map((item: string, idx: number) => (
          <li key={idx} className="flex gap-3 text-[13px] md:text-sm font-medium text-zinc-400 leading-relaxed">
            <span className={cn("mt-2 w-1.5 h-1.5 rounded-full shrink-0", color.replace('text-', 'bg-'))} />
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function AchievementBadge({ title, subtitle, icon, status }: { title: string, subtitle: string, icon: React.ReactNode, status: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] bg-zinc-900 shadow-xl border border-zinc-800/80 group transition-all hover:bg-zinc-800/50 flex flex-col items-center sm:items-start text-center sm:text-left"
    >
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="text-[8px] sm:text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{status}</div>
      <div className="text-[12px] sm:text-sm font-bold text-zinc-100 mb-1 leading-tight">{title}</div>
      <div className="text-[8px] sm:text-[10px] font-bold text-zinc-500 uppercase">{subtitle}</div>
    </motion.div>
  );
}

function YearMedalCard({ year, status, description, image, onSelect }: { year: string, status: string, description: string, image: string, onSelect: (img: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-zinc-900/50 border border-zinc-800/80 p-6 sm:p-8 hover:border-zinc-700 transition-all cursor-pointer"
      onClick={() => onSelect(image)}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{status}</div>
          <h4 className="text-xl md:text-2xl font-black italic tracking-tight">{year}</h4>
        </div>
        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
          <Award className="w-5 h-5" />
        </div>
      </div>
      <p className="text-[11px] md:text-xs text-zinc-400 font-medium leading-relaxed mb-6 md:mb-8">{description}</p>
      
      <div className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950">
        <SmartImage
          src={image} 
          alt={`Medals ${year}`} 
          className="transition-all duration-700 object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent flex items-end p-4 md:p-6 pointer-events-none">
           <div className="text-[8px] md:text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
             <Maximize2 className="w-3 h-3 text-green-500" /> Registro Consolidado
           </div>
        </div>
      </div>
    </motion.div>
  );
}
