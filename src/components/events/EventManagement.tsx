import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EventDialog from "@/components/dialogs/EventDialog";
import ConfirmDeleteDialog from "@/components/dialogs/ConfirmDeleteDialog";
// import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { eventService } from "@/services/eventService";
import { EventWithPresenters } from "@/types/event";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Edit, Trash2, Plus, Search } from "lucide-react";
import Image from "next/image";
import { getStatusBadgeVariant, getStatusText } from '@/constants/eventConstants';

const EventManagement = () => {
  const [events, setEvents] = useState<EventWithPresenters[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventWithPresenters | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // const { profile } = useAuth();
  const { toast } = useToast();

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.fetchEvents();
      setEvents(data);
      setError(null);
    } catch (err) {
      setError("خطا در بارگذاری رویدادها");
      console.error("Error loading events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleEditEvent = (event: EventWithPresenters) => {
    setSelectedEvent(event);
    setShowEditDialog(true);
  };

  const handleDeleteEvent = (event: EventWithPresenters) => {
    setSelectedEvent(event);
    setShowDeleteDialog(true);
  };

  const confirmDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      await eventService.deleteEvent(selectedEvent.id);
      toast({
        title: "موفقیت",
        description: "رویداد با موفقیت حذف شد",
      });
      setShowDeleteDialog(false);
      setSelectedEvent(null);
      loadEvents();
    } catch (err) {
      toast({
        title: "خطا",
        description: "خطا در حذف رویداد",
        variant: "destructive",
      });
    }
  };

  const handleEventCreated = () => {
    setShowCreateDialog(false);
    loadEvents();
  };

  const handleEventUpdated = () => {
    setShowEditDialog(false);
    setSelectedEvent(null);
    loadEvents();
  };


  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <DashboardLayout title="مدیریت رویدادها">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">در حال بارگذاری...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="مدیریت رویدادها">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">{error}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="مدیریت رویدادها">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="جستجو در رویدادها..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="فیلتر وضعیت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                <SelectItem value="upcoming">آینده</SelectItem>
                <SelectItem value="ongoing">در حال برگزاری</SelectItem>
                <SelectItem value="completed">تکمیل شده</SelectItem>
                <SelectItem value="cancelled">لغو شده</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            رویداد جدید
          </Button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <CardHeader className="p-0">
                {event.thumbnail && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={event.thumbnail}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                    <Badge variant={getStatusBadgeVariant(event.status)}>
                      {getStatusText(event.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.subtitle && (
                  <p className="text-sm text-gray-600 line-clamp-2">{event.subtitle}</p>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(event.start_date).toLocaleDateString('fa-IR')}</span>
                  </div>
                  
                  {/* no end_date for events */}
                  
                  {event.presenters.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      <span>{event.presenters.length} ارائه‌دهنده</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditEvent(event)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    ویرایش
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteEvent(event)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">هیچ رویدادی یافت نشد</div>
          </div>
        )}
      </div>

      {/* Create/Edit Event Dialogs */}
      <EventDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        mode="create"
        onSuccess={handleEventCreated}
      />

      {/* Edit Event Dialog */}
      {selectedEvent && (
        <EventDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          mode="edit"
          event={selectedEvent}
          onSuccess={handleEventUpdated}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {selectedEvent && (
        <ConfirmDeleteDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="حذف رویداد"
          description={`آیا مطمئن هستید که می‌خواهید رویداد "${selectedEvent.title}" را حذف کنید؟`}
          onConfirmDelete={confirmDeleteEvent}
        />
      )}
    </DashboardLayout>
  );
};

export default EventManagement;
