import React from "react";
import {
  Award,
  enrichAwardWithTranslation,
} from "@/utils/awardTranslationUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AwardBadgeProps {
  award: Omit<Award, "name" | "description">;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

const rarityColors = {
  common: "bg-slate-400 hover:bg-slate-500",
  uncommon: "bg-green-500 hover:bg-green-600",
  rare: "bg-blue-500 hover:bg-blue-600",
  epic: "bg-purple-500 hover:bg-purple-600",
  legendary: "bg-yellow-500 hover:bg-yellow-600",
};

export const AwardBadge: React.FC<AwardBadgeProps> = ({
  award,
  size = "md",
  showTooltip = true,
}) => {
  const { language } = useLanguage();
  const translatedAward = enrichAwardWithTranslation(award, language);

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  };

  const badge = (
    <Badge
      className={`${rarityColors[translatedAward.rarity]} ${
        sizeClasses[size]
      } flex items-center gap-1`}
    >
      {translatedAward.icon && <span>{translatedAward.icon}</span>}
      <span>{translatedAward.name}</span>
      {translatedAward.points_value > 0 && (
        <span className="ml-1 text-xs opacity-80">
          +{translatedAward.points_value}
        </span>
      )}
    </Badge>
  );

  if (showTooltip && translatedAward.description) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{badge}</TooltipTrigger>
          <TooltipContent>
            <p>{translatedAward.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
};

interface AwardListProps {
  awards: Array<Omit<Award, "name" | "description">>;
  className?: string;
}

export const AwardList: React.FC<AwardListProps> = ({
  awards,
  className = "",
}) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {awards.map((award) => (
        <AwardBadge key={award.id} award={award} />
      ))}
    </div>
  );
};
