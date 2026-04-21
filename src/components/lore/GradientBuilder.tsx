import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { useLanguage } from "@/context/LanguageContext";

interface GradientBuilderProps {
  gradColors: string[];
  setGradColors: React.Dispatch<React.SetStateAction<string[]>>;
  activeGradIndex: number;
  setActiveGradIndex: React.Dispatch<React.SetStateAction<number>>;
  onInsert: (tag: string) => void;
  setOpen: (open: boolean) => void;
}

export function GradientBuilder({ gradColors, setGradColors, activeGradIndex, setActiveGradIndex, onInsert, setOpen }: GradientBuilderProps) {
  const { t } = useLanguage();

  return (
    <div className="w-[180px] shrink-0 flex flex-col">
      {/* @ts-ignore */}
      <span className="text-xs font-semibold text-muted-foreground mb-[11px] block text-center border-b pb-[6px]">{t.toolbar.gradients || "Degradados"}</span>
      
      <div className="flex flex-col gap-3 mt-1">
        {/* Live Preview */}
        <div 
          className="w-full h-8 rounded border shadow-sm" 
          style={{ background: gradColors.length > 1 ? `linear-gradient(to right, ${gradColors.join(", ")})` : gradColors[0] }} 
        />

        {/* Stops list */}
        <div className="flex flex-wrap items-center gap-2">
          {gradColors.map((c, i) => (
            <div key={i} className="relative group">
              <button
                className={`w-6 h-6 rounded-full border-2 transition-all ${activeGradIndex === i ? 'border-primary ring-2 ring-primary/30' : 'border-border shadow-sm'}`}
                style={{ backgroundColor: c }}
                onClick={() => setActiveGradIndex(i)}
              />
              {gradColors.length > 2 && (
                  <button
                    className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setGradColors(prev => prev.filter((_, idx) => idx !== i));
                      if (activeGradIndex >= i && activeGradIndex > 0) {
                        setActiveGradIndex(prev => prev - 1);
                      }
                    }}
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
              )}
            </div>
          ))}
          
          {gradColors.length < 8 && (
            <button
              className="w-6 h-6 rounded-full border-2 border-dashed border-muted-foreground/50 text-muted-foreground hover:text-foreground hover:border-foreground flex items-center justify-center transition-colors"
              onClick={() => {
                setGradColors(prev => [...prev, "#FFFFFF"]);
                setActiveGradIndex(gradColors.length);
              }}
            >
              <Plus className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Active Stop Color Picker */}
        <div className="p-1.5 border rounded bg-muted/20">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Color {activeGradIndex + 1}</span>
            <span className="text-[10px] font-mono">{gradColors[activeGradIndex]}</span>
          </div>
          <HexColorPicker 
            color={gradColors[activeGradIndex]} 
            onChange={(newColor) => {
              setGradColors(prev => {
                const next = [...prev];
                next[activeGradIndex] = newColor;
                return next;
              });
            }} 
            style={{ width: "100%", height: "100px" }} 
          />
        </div>
        
        <Button 
          size="sm" 
          className="w-full h-8" 
          onClick={() => {
            onInsert(`gradient:${gradColors.join(":")}`);
            setOpen(false);
          }}
        >
          {/* @ts-ignore */}
          {t.toolbar.insertGradient || "Insertar"}
        </Button>
      </div>
    </div>
  );
}
