import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { processMinecraftColorCodes } from "@/utils/minecraft-colors";
import { useLanguage } from "@/context/LanguageContext";
import DOMPurify from "isomorphic-dompurify";

const sanitize = (html: string) =>
  DOMPurify.sanitize(html, { ALLOWED_TAGS: ["span"], ALLOWED_ATTR: ["style"] });

import { type LoreLine } from "@/hooks/useLore";

interface LorePreviewProps {
  name: string;
  lore: LoreLine[];
}

export function LorePreview({ name, lore }: LorePreviewProps) {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col h-full max-h-full min-h-0">
      <Card className="border-border flex flex-col h-full max-h-full overflow-hidden">
        <CardHeader className="border-b shrink-0">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            {t.preview.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 relative flex-1 overflow-y-auto min-h-0">
          <div className="absolute inset-0 bg-[#120111] opacity-90 border-[3px] border-[#290333] rounded-sm m-4"></div>
          <div className="absolute inset-0 p-8 font-mono text-[16px] leading-tight space-y-1 block drop-shadow-md overflow-y-auto whitespace-pre-wrap">
            
            <div 
              className="mb-2 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: sanitize(name ? processMinecraftColorCodes(name) : processMinecraftColorCodes(t.preview.defaultName))
              }}
            />
            
            {lore.map((line) => (
              <div 
                key={line.id}
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: line.value ? sanitize(processMinecraftColorCodes(line.value)) : "&nbsp;"
                }}
              />
            ))}

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
