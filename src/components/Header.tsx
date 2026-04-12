import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="secondary"
      size="sm"
      className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-all active:scale-95"
      onClick={() => setLanguage(language === "es" ? "en" : "es")}
    >
      <span>{language === "es" ? "English" : "Español"}</span>
    </Button>
  );
}

export function Header() {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col pt-2 pb-2">
      <div className="grid grid-cols-3 items-center w-full">
        {/* Empty space */}
        <div />
        
        {/* Centered Title */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary/50">
            {t.hero.title}
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase accent-primary tracking-[0.2em] font-bold opacity-70">
            {t.hero.subtitle}
          </p>
        </div>

        {/* Right Switcher */}
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}
