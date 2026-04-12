import { useState } from "react";
import { toast } from "sonner";
import { useLore } from "@/hooks/useLore";
import { generateLoreCode } from "@/services/api";
import { LoreForm } from "./lore/LoreForm";
import { LorePreview } from "./lore/LorePreview";
import { LoreResult } from "./lore/LoreResult";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";

import { Header } from "./Header";

function LoreEditorContent() {
  const {
    name,
    setName,
    lore,
    setLoreBulk,
    addLoreLine,
    removeLoreLine,
    updateLoreLine,
    reorderLoreLine,
    enchants,
    addEnchant,
    removeEnchant,
    updateEnchant,
    clearEditor,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useLore();

  const { t } = useLanguage();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const handleClear = () => {
    clearEditor();
    setGeneratedCode(null);
    toast.success(t.toasts.cleared);
  };

  const handleGenerate = async () => {
    if (!name.trim()) {
      toast.error(t.toasts.requiredName);
      return;
    }

    setIsGenerating(true);
    try {
      const code = await generateLoreCode({
        name,
        lore: lore.map(l => l.value),
        enchants: enchants.length > 0 ? enchants : undefined,
      });
      setGeneratedCode(code);
      toast.success(t.toasts.success);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : t.toasts.error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col h-full space-y-8">
      <Header />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl mx-auto flex-1 min-h-0">
        <div className="flex flex-col min-h-0">
          <LoreForm
            name={name}
            setName={setName}
            lore={lore}
            setLoreBulk={setLoreBulk}
            addLoreLine={addLoreLine}
            removeLoreLine={removeLoreLine}
            updateLoreLine={updateLoreLine}
            reorderLoreLine={reorderLoreLine}
            enchants={enchants}
            addEnchant={addEnchant}
            removeEnchant={removeEnchant}
            updateEnchant={updateEnchant}
            clearEditor={handleClear}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            undo={undo}
            redo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
          />
          {generatedCode && (
            <LoreResult 
              code={generatedCode} 
              onClose={() => setGeneratedCode(null)} 
            />
          )}
        </div>

        <div className="flex flex-col">
          <LorePreview name={name} lore={lore} />
        </div>
      </div>
    </div>
  );
}

export default function LoreEditor() {
  return (
    <LanguageProvider>
      <LoreEditorContent />
    </LanguageProvider>
  );
}

