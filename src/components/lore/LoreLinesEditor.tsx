import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, List, AlignLeft, GripVertical } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { type LoreLine } from "@/hooks/useLore";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableItemProps {
  id: string;
  lineValue: string;
  index: number;
  updateLoreLine: (index: number, value: string) => void;
  removeLoreLine: (index: number) => void;
  trackInput: (e: React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  disabledDelete: boolean;
  t: any;
}

function SortableItem({ 
  id, 
  lineValue, 
  index, 
  updateLoreLine, 
  removeLoreLine, 
  trackInput, 
  disabledDelete, 
  t 
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`flex items-center gap-1.5 relative rounded-md ${
        isDragging ? "bg-background/80 shadow-sm ring-1 ring-border" : "bg-transparent"
      }`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="flex items-center justify-center shrink-0 w-6 h-9 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-none focus-visible:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      
      <Input
        id={`lore-line-${index}`}
        value={lineValue}
        onChange={(e) => {
          updateLoreLine(index, e.target.value);
          trackInput(e);
        }}
        onFocus={trackInput}
        onClick={trackInput}
        onKeyUp={trackInput}
        placeholder={t.editor.loreLinePlaceholder}
        className="text-sm shadow-none focus-visible:shadow-sm"
      />
      <Button
        variant="destructive"
        size="icon"
        className="shrink-0 h-9 w-9 transition-opacity shadow-none"
        disabled={disabledDelete}
        onClick={() => removeLoreLine(index)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface LoreLinesEditorProps {
  lore: LoreLine[];
  setLoreBulk: (text: string) => void;
  addLoreLine: () => void;
  removeLoreLine: (index: number) => void;
  updateLoreLine: (index: number, value: string) => void;
  reorderLoreLine: (oldIndex: number, newIndex: number) => void;
  trackInput: (e: React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function LoreLinesEditor({
  lore,
  setLoreBulk,
  addLoreLine,
  removeLoreLine,
  updateLoreLine,
  reorderLoreLine,
  trackInput,
}: LoreLinesEditorProps) {
  const { t } = useLanguage();
  const [editorMode, setEditorMode] = useState<"list" | "bulk">("list");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = lore.findIndex((item) => item.id === active.id);
      const newIndex = lore.findIndex((item) => item.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderLoreLine(oldIndex, newIndex);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">{t.editor.loreLines}</Label>
          <p className="text-[10px] text-muted-foreground/80 leading-tight">
            {/* @ts-ignore */}
            {t.editor.minimessageNote}
          </p>
        </div>
        
        <Tabs value={editorMode} onValueChange={(v) => setEditorMode(v as "list" | "bulk")} className="shrink-0">
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
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={lore.map(l => l.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {lore.map((line, index) => (
                  <SortableItem
                    key={line.id}
                    id={line.id}
                    lineValue={line.value}
                    index={index}
                    updateLoreLine={updateLoreLine}
                    removeLoreLine={removeLoreLine}
                    trackInput={trackInput}
                    disabledDelete={lore.length <= 1}
                    t={t}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          
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
            value={lore.map(l => l.value).join("\n")}
            onChange={(e) => {
              setLoreBulk(e.target.value);
              trackInput(e);
            }}
            onFocus={trackInput}
            onClick={trackInput}
            onKeyUp={trackInput}
            placeholder={t.editor.bulkPlaceholder}
            className="text-sm min-h-[200px] resize-none leading-relaxed"
          />
          <p className="text-[10px] text-muted-foreground italic">
            {t.editor.bulkNote}
          </p>
        </div>
      )}
    </div>
  );
}
