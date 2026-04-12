import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Check, CheckCircle2, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

interface LoreResultProps {
  code: string;
  onClose: () => void;
}

export function LoreResult({ code, onClose }: LoreResultProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const { t } = useLanguage();

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    toast.success(t.toasts.copied);
  };

  const copyCmd = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t.toasts.cmdCopied);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border border-border/50 shadow-xl p-0 bg-background">
        <DialogHeader className="pt-8 pb-3 flex flex-col items-center space-y-4 px-6">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex flex-col items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <div className="flex flex-col space-y-1.5 items-center">
            <DialogTitle className="text-2xl font-bold tracking-tight">
              {t.result.title}
            </DialogTitle>
            <DialogDescription className="text-center text-sm">
              {t.result.description}
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <div className="flex flex-col space-y-5 px-6 pb-8">
          
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
              {t.result.codeLabel}
            </label>
            <div className="flex items-center justify-between gap-3 p-3 border border-border/50 rounded-lg bg-card/60 shadow-inner">
              <code 
                style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }} 
                className="text-sm tracking-tight text-foreground break-all pl-1 select-all"
              >
                {code}
              </code>
              <Button 
                onClick={() => copyText(code)} 
                variant={copiedCode ? "secondary" : "default"} 
                size="sm" 
                className="shrink-0 gap-2 h-9 px-4 transition-all"
              >
                {copiedCode ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                {copiedCode ? t.result.copied : t.result.copy}
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2.5 rounded-md bg-muted/30 border border-border/50">
             <Lightbulb className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
             <p className="text-xs text-foreground/80 leading-relaxed">
               <strong>{t.result.cmdLabel}:</strong> {t.result.cmdTip.split('{cmd}')[0]}
               <code 
                 className="bg-background px-1.5 py-0.5 rounded border border-border/60 cursor-pointer hover:bg-muted transition-colors whitespace-nowrap"
                 style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
                 onClick={() => copyCmd(`/sdlore apply ${code}`)}
                 title="Click para copiar"
               >
                 /sdlore apply {code}
               </code>
               {t.result.cmdTip.split('{cmd}')[1]}
             </p>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
