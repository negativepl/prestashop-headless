"use client";

import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import {
  Shield,
  Users,
  Award,
  Globe,
  Zap,
  TrendingUp,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --- Animation variants (reusable, no re-creation) ---
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// --- Components ---

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  const opacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);

  return (
    <motion.div
      style={{ opacity }}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-center gap-2"
    >
      <div className="h-32 w-1.5 bg-border/30 rounded-full overflow-hidden backdrop-blur-sm">
        <motion.div
          style={{ scaleY, originY: 0 }}
          className="w-full h-full bg-gradient-to-b from-primary to-primary/70 rounded-full"
        />
      </div>
    </motion.div>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[85vh] w-full flex items-center justify-center overflow-hidden bg-background pt-24">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-5xl">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
        </div>
      </div>

      <div className="container relative z-10 px-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl mx-auto"
        >
          {/* Main heading */}
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <p className="text-lg text-muted-foreground mb-2">Cześć, tu</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-2">
              HomeScreen
            </h1>
            <div className="w-20 h-1 bg-primary rounded-full" />
          </motion.div>

          {/* Description */}
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-2xl mb-12 space-y-4"
          >
            <p className="text-xl md:text-2xl text-foreground/90 leading-relaxed">
              Od <span className="font-semibold">ponad 10 lat</span> dostarczamy akcesoria GSM dla klientów indywidualnych i biznesowych.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Zaczynaliśmy w stodole we wsi Grabowo. Dziś prowadzimy nowoczesny magazyn w Koszalinie, oferujemy 40 tysięcy produktów i współpracujemy z dystrybutorami oraz klientami w Polsce, Europie i na świecie.
            </p>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap gap-12 mb-12"
          >
            <div>
              <div className="text-4xl md:text-5xl font-bold text-foreground">10+</div>
              <div className="text-sm text-muted-foreground mt-1">lat doświadczenia</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-foreground">40 tys.+</div>
              <div className="text-sm text-muted-foreground mt-1">produktów w ofercie</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-foreground">80+</div>
              <div className="text-sm text-muted-foreground mt-1">światowych marek</div>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button size="lg" className="h-12 px-8" asChild>
              <Link href="/products">Zobacz naszą ofertę</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

const timelineData = [
  { year: "2012", title: "Początki", desc: "Zaczynaliśmy w stodole we wsi Grabowo. Pierwsze zamówienia, pierwsze wysyłki i nawiązanie kontaktów z największymi światowymi markami akcesoriów GSM." },
  { year: "2018", title: "Nowa siedziba", desc: "Przełomowy moment – przeniesienie magazynu i biura do Koszalina. Profesjonalizacja procesów i dynamiczny rozwój." },
  { year: "2022", title: "Wielki krok", desc: "Przeprowadzka do nowoczesnego obiektu magazynowo-biurowego. Automatyzacja procesów i dedykowane stanowiska pakowania." },
  { year: "2024", title: "Era AI", desc: "Zaczęliśmy od prostych skryptów i wtyczek. Z czasem nasze ambicje rosły – moduły zlecane zewnętrznym programistom nie spełniały oczekiwań. Wzięliśmy sprawy w swoje ręce, ucząc się AI od podstaw. Efekt? Dynamic Commerce Platform – zestaw modułów napędzanych AI, które oszczędzają nam dziesiątki godzin pracy tygodniowo." },
  { year: "2025", title: "Ploter do cięcia folii", desc: "Inwestycja w profesjonalny ploter pozwala nam ciąć folie ochronne na tysiące modeli urządzeń. Idealne dopasowanie do każdego smartfona – bez czekania na dostawę." },
  { year: "2026", title: "Projekt Kestrel", desc: "Nasz nowy sklep, na którym właśnie jesteś. Całe zebrane doświadczenie w jednym miejscu – błyskawiczne wyszukiwanie rozumiejące kontekst, płynny checkout z ulubionymi metodami płatności i dostawy. Nasz wymarzony sklep, w którym ogranicza nas tylko wyobraźnia." },
  { year: "2027", title: "Dalsze plany", desc: "Oprócz ciągłego ulepszania naszego sklepu, chcemy dzielić się zdobytą wiedzą i wdrażać najnowsze rozwiązania dla innych sklepów opartych o PrestaShop – dedykowane moduły, integracje z AI, headless e-commerce i konsultacje. Jedno jednak się nie zmieni – nadal chcemy pomagać ludziom chronić ich telefony.", future: true },
];

function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const x = useTransform(scrollYProgress, [0.3, 0.85], ["5%", "-75%"]);

  // Pre-create line progress transforms for each segment
  const lineProgress = timelineData.slice(0, -1).map((_, i) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useTransform(scrollYProgress, [0.3 + (i * 0.08), 0.38 + (i * 0.08)], [0, 1])
  );

  return (
    <section id="historia" ref={containerRef} className="relative h-[180vh] scroll-mt-20">
      <div className="sticky top-20 h-[calc(100vh-5rem)] flex flex-col overflow-hidden pt-8 pb-12">
        {/* Subtle grid pattern background - fixed within sticky */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

        {/* Fade masks all sides */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 left-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        <div className="container mb-6 relative z-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Nasza historia</h2>
            <p className="text-muted-foreground text-lg">
              Od stodoły do nowoczesnego magazynu – każdy rok to nowy rozdział.
            </p>
          </motion.div>
        </div>

        {/* Horizontal timeline */}
        <div className="relative flex-1 flex items-center">
          <motion.div
            style={{ x }}
            className="flex gap-0 pl-[10vw]"
          >
            {timelineData.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`flex-none w-[300px] md:w-[350px] ${item.future ? "opacity-75" : ""}`}
              >
                {/* Timeline connector with progress */}
                <div className="flex items-center mb-4 h-4">
                  {/* Dot */}
                  <div className={`w-4 h-4 rounded-full ring-4 ring-background z-10 flex-shrink-0 ${
                    item.future ? "bg-border border-2 border-dashed border-primary" : "bg-primary"
                  }`} />
                  {/* Line between dots */}
                  {i < timelineData.length - 1 && (
                    <div className="flex-1 h-0.5 bg-border relative overflow-hidden mx-2">
                      <motion.div
                        style={{ scaleX: lineProgress[i] }}
                        className="absolute inset-0 bg-primary origin-left"
                      />
                    </div>
                  )}
                </div>

                {/* Card */}
                <div className={`p-6 rounded-2xl border h-full mr-6 backdrop-blur-sm ${item.future ? "border-dashed border-primary/30 bg-primary/5" : "bg-secondary/30 border-border/50"}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-base font-bold ${item.future ? "text-muted-foreground" : "text-primary"}`}>
                      {item.year}
                    </span>
                    {item.future && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-dashed border-primary/30">
                        przed nami
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}


const values = [
  { title: "Jakość premium", desc: "Selekcjonujemy produkty tylko od sprawdzonych, światowych marek.", icon: Award },
  { title: "Szybkość", desc: "Większość produktów mamy na magazynie i wysyłamy od ręki.", icon: Zap },
  { title: "Zaufanie", desc: "Ponad 10 lat doświadczenia i tysiące pozytywnych opinii.", icon: Shield },
  { title: "Rozwój", desc: "Stale poszerzamy asortyment o najnowsze akcesoria.", icon: TrendingUp },
  { title: "Zespół", desc: "Nasi eksperci służą pomocą na każdym etapie zakupów.", icon: Users },
  { title: "Eko-świadomość", desc: "Stosujemy ekologiczne opakowania i minimalizujemy plastik.", icon: Globe },
];

function Values() {
  return (
    <section className="py-16 md:py-24 container">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        className="text-center max-w-2xl mx-auto mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-bold mb-6">Nasze wartości</h2>
        <p className="text-muted-foreground text-lg">
          Kierujemy się prostymi zasadami, które pozwalają nam budować trwałe relacje.
        </p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {values.map((v, i) => (
          <motion.div
            key={i}
            variants={fadeInUp}
            transition={{ duration: 0.4 }}
            className="group relative overflow-hidden rounded-3xl bg-secondary/10 p-8 hover:bg-secondary/20 transition-colors duration-300"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
              <v.icon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold mb-2">{v.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
      <div className="container relative z-10 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto bg-background/80 backdrop-blur-xl border border-border/50 rounded-3xl p-10 md:p-16"
        >
          <Heart className="w-10 h-10 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Dołącz do nas</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Sprawdź naszą ofertę i przekonaj się, dlaczego zaufało nam już ponad milion klientów.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="rounded-full text-base h-12 px-8" asChild>
              <Link href="/products">Zobacz produkty</Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full text-base h-12 px-8" asChild>
              <Link href="/kontakt">Skontaktuj się z nami</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function ONasPage() {
  useEffect(() => {
    // Hide native scrollbar and enable smooth scroll on this page only
    const style = document.createElement('style');
    style.innerHTML = `
      html::-webkit-scrollbar { display: none; }
      html { scrollbar-width: none; -ms-overflow-style: none; scroll-behavior: smooth; }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <ScrollProgress />
      <Hero />
      <Timeline />
      <Values />
      <CTA />
    </main>
  );
}
