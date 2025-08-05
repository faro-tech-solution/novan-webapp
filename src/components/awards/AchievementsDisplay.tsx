import React from "react";
import {
  Award,
  Trophy,
  Star,
  Crown,
  Medal,
  Target,
  Zap,
  Flame,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Award as AwardType } from "@/services/awardsService";
import { StudentAward } from "@/types/student";
import { useAwardTranslation } from "@/utils/awardTranslationUtils";
import { formatDate } from "@/lib/utils";

interface AchievementsDisplayProps {
  allAwards: AwardType[];
  studentAwards: StudentAward[];
  showTitle?: boolean;
  showPoints?: boolean;
  showOnlyAchieved?: boolean;
}

const getAwardIcon = (iconName: string, earned: boolean) => {
  const iconProps = {
    className: `h-8 w-8 ${earned ? "text-yellow-500" : "text-gray-300"}`,
  };

  switch (iconName?.toLowerCase?.()) {
    case "award":
      return <Award {...iconProps} />;
    case "trophy":
      return <Trophy {...iconProps} />;
    case "star":
      return <Star {...iconProps} />;
    case "crown":
      return <Crown {...iconProps} />;
    case "medal":
      return <Medal {...iconProps} />;
    case "target":
      return <Target {...iconProps} />;
    case "zap":
      return <Zap {...iconProps} />;
    case "flame":
      return <Flame {...iconProps} />;
    default:
      return <Award {...iconProps} />;
  }
};

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case "common":
      return "bg-slate-400";
    case "uncommon":
      return "bg-green-500";
    case "rare":
      return "bg-blue-500";
    case "epic":
      return "bg-purple-500";
    case "legendary":
      return "bg-yellow-500";
    default:
      return "bg-slate-400";
  }
  };
  
  export const AchievementsDisplay = ({
  allAwards,
  studentAwards,
  showTitle = true,
  showPoints = true,
  showOnlyAchieved = false,
}: AchievementsDisplayProps) => {
  const earnedAwardIds = new Set(studentAwards.map((sa) => sa.award_id));
  const { translateAward } = useAwardTranslation();

  const awardsToShow = showOnlyAchieved
    ? allAwards.filter((award) => earnedAwardIds.has(award.id))
    : allAwards;

  if (awardsToShow.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>جایزه‌ای برای نمایش وجود ندارد.</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {awardsToShow.map((award) => {
          const isEarned = earnedAwardIds.has(award.id);
          const studentAward = studentAwards.find(
            (sa) => sa.award_id === award.id
          );
          const translation = translateAward(award.code);

          return (
            <Tooltip key={award.id}>
              <TooltipTrigger asChild>
                <div
                  className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all cursor-pointer
                    ${isEarned ? "border-yellow-300 bg-yellow-50 hover:bg-yellow-100" : "border-gray-200 bg-gray-50 hover:bg-gray-100 opacity-60"}
                  `}
                >
                  <div className="mb-2">{getAwardIcon(award.icon, isEarned)}</div>
                  {showTitle && (
                    <p className={`text-xs text-center font-medium ${isEarned ? "text-gray-900" : "text-gray-400"}`}>
                      {translation.name}
                    </p>
                  )}
                  {showPoints && (
                    isEarned ? (
                      <Badge className={`${getRarityColor(award.rarity)} text-xs mt-1`}>+{award.points_value}</Badge>
                    ) : (
                      <Badge className={`bg-gray-200 text-gray-500 text-xs mt-1`}>+{award.points_value}</Badge>
                    )
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="text-center">
                  <p className="font-semibold">{translation.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{translation.description}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Badge className={getRarityColor(award.rarity)}>
                      {award.rarity === "common" && "معمولی"}
                      {award.rarity === "uncommon" && "غیرمعمول"}
                      {award.rarity === "rare" && "نادر"}
                      {award.rarity === "epic" && "حماسی"}
                      {award.rarity === "legendary" && "افسانه‌ای"}
                    </Badge>
                    <span className="text-sm font-medium text-purple-600">
                      {award.points_value} امتیاز
                    </span>
                  </div>
                  {isEarned && studentAward && (
                    <p className="text-xs text-green-600 mt-1">
                      کسب شده در: {formatDate({dateString: studentAward.earned_at})}
                    </p>
                  )}
                  {!isEarned && (
                    <p className="text-xs text-gray-500 mt-1">هنوز کسب نشده</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};
