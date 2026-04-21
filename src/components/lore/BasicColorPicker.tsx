import { Button } from "@/components/ui/button";
import { HexColorPicker } from "react-colorful";
import { useLanguage } from "@/context/LanguageContext";

interface BasicColorPickerProps {
  color: string;
  setColor: (color: string) => void;
  onInsert: (tag: string) => void;
  setOpen: (open: boolean) => void;
}

const basicColorsList = [
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

export function BasicColorPicker({ color, setColor, onInsert, setOpen }: BasicColorPickerProps) {
  const { t } = useLanguage();

  const handleColorInsert = () => {
    onInsert(color);
    setOpen(false);
  };

  return (
    <div className="w-[196px] shrink-0 space-y-3">
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
          {basicColorsList.map((c) => (
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
    </div>
  );
}
