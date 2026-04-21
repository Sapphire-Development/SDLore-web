import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Palette,
  Bold,
  Italic,
  Underline,
  Strikethrough,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { BasicColorPicker } from "./BasicColorPicker";
import { GradientBuilder } from "./GradientBuilder";

export function FormatToolbar({ onInsert }: { onInsert: (tag: string) => void }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState("#FF5555");
  const [gradColors, setGradColors] = useState(["#FF512F", "#DD2476"]);
  const [activeGradIndex, setActiveGradIndex] = useState(0);

  const handleInsert = (e: React.MouseEvent, tag: string) => {
    e.preventDefault();
    onInsert(tag);
  };

  const colors = [
    { name: "Red", tag: "red", hex: "#FF5555" },
    { name: "Gold", tag: "gold", hex: "#FFAA00" },
    { name: "Yellow", tag: "yellow", hex: "#FFFF55" },
    { name: "Green", tag: "green", hex: "#55FF55" },
    { name: "Aqua", tag: "aqua", hex: "#55FFFF" },
    { name: "Blue", tag: "blue", hex: "#5555FF" },
    { name: "Light Purple", tag: "light_purple", hex: "#FF55FF" },
    { name: "Dark Purple", tag: "dark_purple", hex: "#AA00AA" },
    { name: "White", tag: "white", hex: "#FFFFFF" },
    { name: "Gray", tag: "gray", hex: "#AAAAAA" },
    { name: "Dark Gray", tag: "dark_gray", hex: "#555555" },
    { name: "Black", tag: "black", hex: "#000000" },
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1 p-1 bg-muted/20 border rounded-md w-fit">
        
        <Tooltip>
          {/* @ts-ignore */}
          <TooltipTrigger asChild>
            <div>
              <Popover open={open} onOpenChange={setOpen}>
                {/* @ts-ignore */}
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Palette className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-fit p-3 flex flex-row gap-4">
                  <BasicColorPicker 
                    color={color} 
                    setColor={setColor} 
                    onInsert={onInsert} 
                    setOpen={setOpen} 
                  />

                  {/* Vertical Divider */}
                  <div className="w-px bg-border shrink-0" />

                  <GradientBuilder 
                    gradColors={gradColors}
                    setGradColors={setGradColors}
                    activeGradIndex={activeGradIndex}
                    setActiveGradIndex={setActiveGradIndex}
                    onInsert={onInsert} 
                    setOpen={setOpen} 
                  />
                </PopoverContent>
              </Popover>
            </div>
          </TooltipTrigger>
          <TooltipContent><p>{t.toolbar.colors}</p></TooltipContent>
        </Tooltip>

        <div className="w-px h-4 bg-border mx-1" />

        <Tooltip>
          {/* @ts-ignore */}
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onMouseDown={(e) => handleInsert(e, "b")}
            >
              <Bold className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{t.toolbar.bold}</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          {/* @ts-ignore */}
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onMouseDown={(e) => handleInsert(e, "i")}
            >
              <Italic className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{t.toolbar.italic}</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          {/* @ts-ignore */}
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onMouseDown={(e) => handleInsert(e, "u")}
            >
              <Underline className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{t.toolbar.underline}</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          {/* @ts-ignore */}
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onMouseDown={(e) => handleInsert(e, "st")}
            >
              <Strikethrough className="h-4 w-4" />
            </Button> 
          </TooltipTrigger>
          <TooltipContent><p>{t.toolbar.strikethrough}</p></TooltipContent>
        </Tooltip>

      </div>
    </TooltipProvider>
  );
}
