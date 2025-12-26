import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ShoppingCart, CreditCard, Truck, ArrowRight } from "lucide-react";

const slides = [
  {
    id: 1,
    titleKey: "heroTitle",
    subtitleKey: "heroSubtitle",
    icon: null,
  },
  {
    id: 2,
    titleKey: "heroWorkflowTitle",
    subtitleKey: "heroWorkflowSubtitle",
    steps: [
      { icon: ShoppingCart, textKey: "workflowStep1" },
      { icon: CreditCard, textKey: "workflowStep2" },
      { icon: Truck, textKey: "workflowStep3" },
    ],
  },
];

export function HeroTextCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  return (
    <div className="relative min-h-[280px] sm:min-h-[240px]">
      {slides.map((s, index) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-all duration-700 ${
            index === currentSlide
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          {s.id === 1 ? (
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-in">
                {t(s.titleKey)}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-foreground/90 max-w-2xl leading-relaxed">
                {t(s.subtitleKey)}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-foreground">
                {t(s.titleKey)}
              </h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                {s.steps?.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3 group">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 border-2 border-primary group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                      <step.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <span className="text-sm sm:text-base md:text-lg font-semibold text-foreground/90">
                      {t(step.textKey)}
                    </span>
                    {idx < s.steps.length - 1 && (
                      <ArrowRight className="hidden sm:block h-5 w-5 text-muted-foreground ml-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Slide indicators */}
      <div className="absolute -bottom-8 left-0 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "w-8 bg-primary"
                : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
