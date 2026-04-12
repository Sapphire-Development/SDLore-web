import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Sparkles, X, List, AlignLeft } from "lucide-react";
import { FormatToolbar } from "./FormatToolbar";
import { useLanguage } from "@/context/LanguageContext";
import { type Enchant } from "@/hooks/useLore";

interface LoreFormProps {
  name: string;
  setName: (name: string) => void;
  lore: string[];
  setLoreBulk: (text: string) => void;
  addLoreLine: () => void;
  removeLoreLine: (index: number) => void;
  updateLoreLine: (index: number, value: string) => void;
  enchants: Enchant[];
  addEnchant: () => void;
  removeEnchant: (index: number) => void;
  updateEnchant: (index: number, id: string, level: number) => void;
  clearEditor: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function LoreForm({
  name,
  setName,
  lore,
  setLoreBulk,
  addLoreLine,
  removeLoreLine,
  updateLoreLine,
  enchants,
  addEnchant,
  removeEnchant,
  updateEnchant,
  clearEditor,
  onGenerate,
  isGenerating,
}: LoreFormProps) {
  const { t } = useLanguage();
  const [editorMode, setEditorMode] = useState<"list" | "bulk">("list");
  const inputRefTracker = useRef<{ id: string, start: number, end: number } | null>(null);

  const trackInput = (e: React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    inputRefTracker.current = {
      id: target.id,
      start: target.selectionStart || 0,
      end: target.selectionEnd || 0,
    };
  };

  const handleInsertTag = (tag: string) => {
    const tracker = inputRefTracker.current;
    if (!tracker) return; // No input was ever focused

    let val = "";
    if (tracker.id === "item-name") val = name;
    else if (tracker.id === "lore-bulk") val = lore.join("\n");
    else if (tracker.id.startsWith("lore-line-")) {
      const idx = parseInt(tracker.id.replace("lore-line-", ""), 10);
      val = lore[idx] || "";
    } else return;

    const hasSelection = tracker.start !== tracker.end;

    if (hasSelection) {
      const selectedText = val.slice(tracker.start, tracker.end);
      const openTag = `<${tag}>`;
      const closeTag = `</${tag}>`;
      
      const newVal = val.slice(0, tracker.start) + openTag + selectedText + closeTag + val.slice(tracker.end);

      if (tracker.id === "item-name") setName(newVal);
      else if (tracker.id === "lore-bulk") setLoreBulk(newVal);
      else {
        const idx = parseInt(tracker.id.replace("lore-line-", ""), 10);
        updateLoreLine(idx, newVal);
      }

      tracker.start += openTag.length;
      tracker.end += openTag.length;
    } else {
      const openTag = `<${tag}>`;
      const closeTag = `</${tag}>`;
      
      const newVal = openTag + val + closeTag;

      if (tracker.id === "item-name") setName(newVal);
      else if (tracker.id === "lore-bulk") setLoreBulk(newVal);
      else {
        const idx = parseInt(tracker.id.replace("lore-line-", ""), 10);
        updateLoreLine(idx, newVal);
      }

      tracker.start = openTag.length + val.length;
      tracker.end = tracker.start;
    }

    setTimeout(() => {
      const element = document.getElementById(tracker.id) as HTMLInputElement | HTMLTextAreaElement;
      if (element) {
        element.focus();
        if (hasSelection) {
          element.setSelectionRange(tracker.start, tracker.end);
        } else {
          element.setSelectionRange(tracker.start, tracker.start);
        }
      }
    }, 10);
  };

  return (
    <div className="flex flex-col h-full max-h-full gap-4">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center p-1 bg-muted/20 border rounded-md shrink-0">
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
              <DialogDescription>
                {t.editor.enchantsDialogDesc}
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
        </div>
        <FormatToolbar onInsert={handleInsertTag} />
      </div>

      <Card className="border-border flex flex-col flex-1 min-h-0">
        <CardContent className="space-y-6 flex-1 overflow-y-auto p-6 min-h-0">
          <div className="space-y-2">
            <Label htmlFor="item-name" className="text-sm font-medium">{t.editor.itemName}</Label>
            <Input
              id="item-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                trackInput(e);
              }}
              onFocus={trackInput}
              onClick={trackInput}
              onKeyUp={trackInput}
              placeholder={t.editor.itemNamePlaceholder}
              className="font-mono text-sm"
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{t.editor.loreLines}</Label>
              <Tabs value={editorMode} onValueChange={(v) => setEditorMode(v as "list" | "bulk")}>
                <TabsList className="grid w-[180px] grid-cols-2 h-8">
                  <TabsTrigger value="list" className="text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                    <List className="w-3 h-3" />
                    {t.editor.tabs.list}
                  </TabsTrigger>
                  <TabsTrigger value="bulk" className="text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                    <AlignLeft className="w-3 h-3" />
                    {t.editor.tabs.bulk}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {editorMode === "list" ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  {lore.map((line, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        id={`lore-line-${index}`}
                        value={line}
                        onChange={(e) => {
                          updateLoreLine(index, e.target.value);
                          trackInput(e);
                        }}
                        onFocus={trackInput}
                        onClick={trackInput}
                        onKeyUp={trackInput}
                        placeholder={t.editor.loreLinePlaceholder}
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="shrink-0 h-9 w-9 transition-opacity"
                        disabled={lore.length <= 1}
                        onClick={() => removeLoreLine(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <Button
                  variant="secondary"
                  className="w-full mt-2 border-dashed border-2 bg-transparent hover:bg-secondary/20 shrink-0 h-9 text-xs"
                  onClick={addLoreLine}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t.editor.addBtn}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Textarea
                  id="lore-bulk"
                  value={lore.join("\n")}
                  onChange={(e) => {
                    setLoreBulk(e.target.value);
                    trackInput(e);
                  }}
                  onFocus={trackInput}
                  onClick={trackInput}
                  onKeyUp={trackInput}
                  placeholder={t.editor.bulkPlaceholder}
                  className="font-mono text-sm min-h-[200px] resize-none leading-relaxed"
                />
                <p className="text-[10px] text-muted-foreground italic">
                  {t.editor.bulkNote}
                </p>
              </div>
            )}
          </div>


        </CardContent>
        <CardFooter className="shrink-0 flex items-center justify-center border-t px-6 py-4 mt-auto">
          <Button 
            className="w-full max-w-xs h-11 text-base font-medium" 
            onClick={onGenerate} 
            disabled={isGenerating || !name.trim()}
          >
            {isGenerating ? t.editor.generating : t.editor.generateBtn}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
