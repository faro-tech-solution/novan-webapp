import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import CreateTermDialog from "@/components/dialogs/CreateTermDialog";
import EditTermDialog from "@/components/dialogs/EditTermDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CourseTerm } from "@/types/course";

interface CourseTermsManagementProps {
  courseId: string;
  courseName: string;
  userRole?: string;
}

const CourseTermsManagement = ({
  courseId,
  courseName,
  userRole,
}: CourseTermsManagementProps) => {
  const [terms, setTerms] = useState<CourseTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<CourseTerm | null>(null);
  const { toast } = useToast();

  // Only admins can create/edit/delete terms
  const canManageTerms = userRole === "admin";
  // Only admins can see student counts
  const canViewStudentCounts = userRole === "admin";

  const fetchTerms = async () => {
    try {
      const { data: termsData, error } = await supabase
        .from("course_terms")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get enrollment counts for each term only for admins
      if (canViewStudentCounts) {
        const termsWithCounts = await Promise.all(
          (termsData || []).map(async (term) => {
            const { count } = await supabase
              .from("course_enrollments")
              .select("*", { count: "exact", head: true })
              .eq("term_id", term.id)
              .eq("status", "active");

            return {
              ...term,
              student_count: count || 0,
            };
          })
        );
        setTerms(termsWithCounts);
      } else {
        // For trainers, don't fetch student counts
        setTerms(termsData || []);
      }
    } catch (error) {
      console.error("Error fetching terms:", error);
      toast({
        title: "خطا",
        description: "خطا در بارگذاری ترم‌ها",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerms();
  }, [courseId]);

  const handleEditTerm = (term: CourseTerm) => {
    setSelectedTerm(term);
    setShowEditDialog(true);
  };

  const handleDeleteTerm = (term: CourseTerm) => {
    setSelectedTerm(term);
    setShowDeleteDialog(true);
  };

  const confirmDeleteTerm = async () => {
    if (!selectedTerm) return;

    // Check if term has students (only for admins)
    if (
      canViewStudentCounts &&
      selectedTerm.student_count &&
      selectedTerm.student_count > 0
    ) {
      toast({
        title: "خطا",
        description: "نمی‌توانید ترمی را که دانشجو دارد حذف کنید",
        variant: "destructive",
      });
      setShowDeleteDialog(false);
      setSelectedTerm(null);
      return;
    }

    try {
      const { error } = await supabase
        .from("course_terms")
        .delete()
        .eq("id", selectedTerm.id);

      if (error) throw error;

      toast({
        title: "موفقیت",
        description: "ترم با موفقیت حذف شد",
      });

      fetchTerms();
    } catch (error) {
      console.error("Error deleting term:", error);
      toast({
        title: "خطا",
        description: "خطا در حذف ترم",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setSelectedTerm(null);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "تعین نشده";
    return new Date(dateStr).toLocaleDateString("fa-IR");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-lg">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>ترم‌های درس {courseName}</CardTitle>
            <CardDescription>
              {canManageTerms
                ? "مدیریت ترم‌های این درس"
                : "مشاهده ترم‌های این درس"}
            </CardDescription>
          </div>
          {canManageTerms && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              ایجاد ترم
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {terms.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">هنوز ترمی ایجاد نشده</p>
            {canManageTerms && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                ایجاد اولین ترم
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">نام ترم</TableHead>
                <TableHead className="text-right">تاریخ شروع</TableHead>
                <TableHead className="text-right">تاریخ پایان</TableHead>
                <TableHead className="text-right">حداکثر دانشجو</TableHead>
                {canViewStudentCounts && (
                  <TableHead className="text-right">دانشجویان فعلی</TableHead>
                )}
                {canManageTerms && (
                  <TableHead className="text-right">عملیات</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {terms.map((term) => (
                <TableRow key={term.id}>
                  <TableCell className="font-medium text-right">
                    {term.name}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatDate({dateString: term.start_date})}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatDate({dateString: term.end_date})}
                  </TableCell>
                  <TableCell className="text-right">
                    {term.max_students === 0 ? "نامحدود" : term.max_students}
                  </TableCell>
                  {canViewStudentCounts && (
                    <TableCell className="text-right">
                      <Badge variant="outline">{term.student_count || 0}</Badge>
                    </TableCell>
                  )}
                  {canManageTerms && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-white border shadow-md"
                        >
                          <DropdownMenuItem
                            onClick={() => handleEditTerm(term)}
                            className="cursor-pointer"
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            ویرایش
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteTerm(term)}
                            className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {canManageTerms && (
        <>
          <CreateTermDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            courseId={courseId}
            onTermCreated={fetchTerms}
          />

          <EditTermDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            term={selectedTerm}
            onTermUpdated={fetchTerms}
          />

          <AlertDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>تأیید حذف ترم</AlertDialogTitle>
                <AlertDialogDescription>
                  آیا مطمئن هستید که می‌خواهید ترم "{selectedTerm?.name}" را حذف
                  کنید؟
                  {canViewStudentCounts &&
                    selectedTerm?.student_count &&
                    selectedTerm.student_count > 0 && (
                      <span className="block mt-2 text-red-600 font-medium">
                        این ترم {selectedTerm.student_count} دانشجو دارد و قابل
                        حذف نیست.
                      </span>
                    )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>لغو</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDeleteTerm}
                  disabled={
                    canViewStudentCounts && selectedTerm?.student_count
                      ? selectedTerm.student_count > 0
                      : false
                  }
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300"
                >
                  حذف
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </Card>
  );
};

export default CourseTermsManagement;
