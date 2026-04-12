import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Undo2, Redo2 } from "lucide-react";
import { FormatToolbar } from "./FormatToolbar";
import { useLanguage } from "@/context/LanguageContext";
import { type Enchant, type LoreLine } from "@/hooks/useLore";
import { EnchantmentsDialog } from "./EnchantmentsDialog";
import { LoreLinesEditor } from "./LoreLinesEditor";

interface LoreFormProps {
  name: string;
  setName: (name: string) => void;
  lore: LoreLine[];
  setLoreBulk: (text: string) => void;
  addLoreLine: () => void;
  removeLoreLine: (index: number) => void;
  updateLoreLine: (index: number, value: string) => void;
  enchants: Enchant[];
  addEnchant: () => void;
  removeEnchant: (index: number) => void;
  updateEnchant: (index: number, id: string, level: number) => void;
  reorderLoreLine: (oldIndex: number, newIndex: number) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
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
  reorderLoreLine,
  undo,
  redo,
  canUndo,
  canRedo,
  clearEditor,
  onGenerate,
  isGenerating,
}: LoreFormProps) {
  const { t } = useLanguage();
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
    else if (tracker.id === "lore-bulk") val = lore.map(l => l.value).join("\n");
    else if (tracker.id.startsWith("lore-line-")) {
      const idx = parseInt(tracker.id.replace("lore-line-", ""), 10);
      val = lore[idx]?.value || "";
    } else return;

    const hasSelection = tracker.start !== tracker.end;

    const insertText = (currentVal: string) => {
      const openTag = `<${tag}>`;
      const closeTag = `</${tag}>`;
      if (hasSelection) {
        const selectedText = currentVal.slice(tracker.start, tracker.end);
        const newVal = currentVal.slice(0, tracker.start) + openTag + selectedText + closeTag + currentVal.slice(tracker.end);
        tracker.start += openTag.length;
        tracker.end += openTag.length;
        return newVal;
      } else {
        const newVal = openTag + currentVal + closeTag;
        tracker.start = openTag.length + currentVal.length;
        tracker.end = tracker.start;
        return newVal;
      }
    };

    const newVal = insertText(val);

    if (tracker.id === "item-name") setName(newVal);
    else if (tracker.id === "lore-bulk") setLoreBulk(newVal);
    else {
      const idx = parseInt(tracker.id.replace("lore-line-", ""), 10);
      updateLoreLine(idx, newVal);
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
          <EnchantmentsDialog 
            enchants={enchants}
            addEnchant={addEnchant}
            removeEnchant={removeEnchant}
            updateEnchant={updateEnchant}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-muted/20 border rounded-md shrink-0 gap-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={undo}
              disabled={!canUndo}
              title={t.editor.undo}
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={redo}
              disabled={!canRedo}
              title={t.editor.redo}
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>
          <FormatToolbar onInsert={handleInsertTag} />
        </div>
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
          
          <LoreLinesEditor 
            lore={lore}
            setLoreBulk={setLoreBulk}
            addLoreLine={addLoreLine}
            removeLoreLine={removeLoreLine}
            updateLoreLine={updateLoreLine}
            reorderLoreLine={reorderLoreLine}
            trackInput={trackInput}
          />

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
