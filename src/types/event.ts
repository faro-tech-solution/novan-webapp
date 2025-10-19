export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface Instructor {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

export interface Event {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  thumbnail: string | null;
  registration_link: string | null;
  video_url: string | null;
  start_date: string;
  status: EventStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EventWithPresenters extends Event {
  presenters: Instructor[];
}

export interface CreateEventData {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  thumbnail?: string | null;
  registration_link?: string | null;
  video_url?: string | null;
  start_date: string;
  status: EventStatus;
  created_by: string;
  presenter_ids?: string[];
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string;
}

export interface EventPresenter {
  id: string;
  event_id: string;
  user_id: string;
  created_at: string;
  user?: Instructor;
}
