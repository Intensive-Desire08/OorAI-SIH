import { Languages } from "lucide-react";
import { getLanguageLabel } from "@/src/lib/language";
import type { LanguageCode } from "@/src/types/chat";

export function LanguageBadge({ language }: { language: LanguageCode }) {
  return (
    <span className="language-badge">
      <Languages aria-hidden="true" size={13} strokeWidth={2} />
      {getLanguageLabel(language)}
    </span>
  );
}
