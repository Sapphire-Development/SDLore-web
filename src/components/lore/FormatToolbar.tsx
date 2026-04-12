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
import { HexColorPicker } from "react-colorful";
import { useLanguage } from "@/context/LanguageContext";

export function FormatToolbar({ onInsert }: { onInsert: (tag: string) => void }) {
  const { t } = useLanguage();
  const [color, setColor] = useState("#FF5555");
  const [open, setOpen] = useState(false);

  const handleInsert = (e: React.MouseEvent, tag: string) => {
    e.preventDefault(); // Prevent losing focus on the input!
    onInsert(tag);
  };

  const handleColorInsert = () => {
    onInsert(`${color}`);
    setOpen(false);
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
                <PopoverContent align="start" className="w-[220px] p-3 space-y-3">
                  <div className="flex flex-col gap-2">
                    <HexColorPicker color={color} onChange={setColor} style={{ width: "100%", height: "140px" }} />
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <div 
                        className="w-6 h-6 rounded border shadow-sm shrink-0" 
                        style={{ backgroundColor: color }} 
                      />
                      <span className="text-xs font-mono flex-1 text-center border rounded py-1 bg-muted/50">{color}</span>
                    </div>
                    <Button size="sm" className="w-full h-8" onClick={handleColorInsert}>
                      {t.toolbar.insertHex}
                    </Button>
                  </div>
                  
                  <div className="border-t pt-3 mt-1">
                    <span className="text-xs font-semibold text-muted-foreground mb-2 block">{t.toolbar.basicColors}</span>
                    <div className="grid grid-cols-7 gap-[3.5px]">
                      {colors.map((c) => (
                        <button
                          key={c.tag}
                          title={c.name}
                          onClick={() => {
                            onInsert(c.tag);
                            setOpen(false);
                          }}
                          className="w-full aspect-square rounded-[3px] border border-border/50 shadow-sm hover:scale-110 transition-transform"
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                      <button
                        title="Rainbow"
                        onClick={() => {
                          onInsert("rainbow");
                          setOpen(false);
                        }}
                        className="w-full flex items-center justify-center aspect-square rounded-[3px] border shadow-sm bg-gradient-to-br from-red-500 via-green-500 to-blue-500 hover:scale-110 transition-transform relative overflow-hidden"
                      />
                    </div>
                  </div>
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
