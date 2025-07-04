import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Trophy, Star, Crown } from "lucide-react";
import { StudentAward } from "@/types/student";
import {
  useAwardTranslation,
  enrichAwardWithTranslation,
} from "@/utils/awardTranslationUtils";
import { useLanguage } from "@/contexts/LanguageContext";

interface AwardsCardProps {
  studentAwards: StudentAward[];
  loading?: boolean;
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case "common":
      return "bg-gray-100 text-gray-800 border-gray-300";
    case "uncommon":
      return "bg-green-100 text-green-800 border-green-300";
    case "rare":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "epic":
      return "bg-purple-100 text-purple-800 border-purple-300";
    case "legendary":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

const getRarityIcon = (rarity: string) => {
  switch (rarity) {
    case "common":
      return <Award className="h-4 w-4" />;
    case "uncommon":
      return <Trophy className="h-4 w-4" />;
    case "rare":
      return <Star className="h-4 w-4" />;
    case "epic":
      return <Crown className="h-4 w-4" />;
    case "legendary":
      return <Crown className="h-4 w-4 text-yellow-600" />;
    default:
      return <Award className="h-4 w-4" />;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("fa-IR");
};

export const AwardsCard = ({ studentAwards, loading }: AwardsCardProps) => {
  const { language } = useLanguage();
  const { translateAward } = useAwardTranslation();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>جوایز کسب شده</CardTitle>
          <CardDescription>جوایز و دستاوردهای شما</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>جوایز کسب شده</CardTitle>
        <CardDescription>
          {studentAwards.length > 0
            ? `شما ${studentAwards.length} جایزه کسب کرده‌اید`
            : "هنوز جایزه‌ای کسب نکرده‌اید"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {studentAwards.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>با تکمیل تمرین‌ها جوایز کسب کنید!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {studentAwards.slice(0, 5).map((studentAward) => (
              <div
                key={studentAward.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="flex-shrink-0">
                    {getRarityIcon(studentAward.awards.rarity)}
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {translateAward(studentAward.awards.code as any).name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {
                        translateAward(studentAward.awards.code as any)
                          .description
                      }
                    </p>
                    <p className="text-xs text-gray-500">
                      کسب شده در: {formatDate(studentAward.earned_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Badge className={getRarityColor(studentAward.awards.rarity)}>
                    {studentAward.awards.rarity === "common" && "معمولی"}
                    {studentAward.awards.rarity === "uncommon" && "غیرمعمول"}
                    {studentAward.awards.rarity === "rare" && "نادر"}
                    {studentAward.awards.rarity === "epic" && "حماسی"}
                    {studentAward.awards.rarity === "legendary" && "افسانه‌ای"}
                  </Badge>
                  <span className="text-sm font-medium text-purple-600">
                    +{studentAward.bonus_points} امتیاز
                  </span>
                </div>
              </div>
            ))}

            {studentAwards.length > 5 && (
              <div className="text-center pt-2">
                <p className="text-sm text-gray-500">
                  و {studentAwards.length - 5} جایزه دیگر...
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
