import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Sparkles, ExternalLink } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { type Enchant } from "@/hooks/useLore";

interface EnchantmentsDialogProps {
  enchants: Enchant[];
  addEnchant: () => void;
  removeEnchant: (index: number) => void;
  updateEnchant: (index: number, id: string, level: number) => void;
}

export function EnchantmentsDialog({
  enchants,
  addEnchant,
  removeEnchant,
  updateEnchant,
}: EnchantmentsDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold px-3">
          <Sparkles className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
          {t.editor.manageEnchantsBtn}
          {enchants.length > 0 && (
            <span className="ml-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-background/50 px-1 text-[10px] tabular-nums shadow-sm border border-border/40">
              {enchants.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.editor.enchantsDialogTitle}</DialogTitle>
          <DialogDescription className="space-y-1.5 flex flex-col pt-1">
            <span>{t.editor.enchantsDialogDesc}</span>
            <a 
              href="https://www.digminecraft.com/lists/enchantment_list_pc.php" 
              target="_blank" 
              rel="noreferrer"
              className="text-primary hover:underline hover:text-primary/80 inline-flex items-center gap-1 w-fit text-xs font-medium transition-colors"
            >
              {/* @ts-ignore */}
              {t.editor.enchantsListLink}
              <ExternalLink className="h-3 w-3" />
            </a>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
            {enchants.map((enchant, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={enchant.id}
                  onChange={(e) => updateEnchant(index, e.target.value, enchant.level)}
                  placeholder={t.editor.enchantIdPlaceholder}
                  className="font-mono text-sm flex-1"
                />
                <Input
                  type="number"
                  min={1}
                  max={255}
                  value={enchant.level || ""}
                  onChange={(e) => updateEnchant(index, enchant.id, e.target.value ? parseInt(e.target.value) : 0)}
                  placeholder={t.editor.enchantLevelPlaceholder}
                  className="font-mono text-sm w-20 shrink-0"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="shrink-0 h-9 w-9 transition-opacity"
                  onClick={() => removeEnchant(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="secondary"
            className="w-full mt-2 border-dashed border-2 bg-transparent hover:bg-secondary/20 shrink-0 h-9 text-xs"
            onClick={addEnchant}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t.editor.addEnchantBtn}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
