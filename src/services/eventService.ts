import { supabase } from '@/integrations/supabase/client';
import { EventWithPresenters, CreateEventData, UpdateEventData, Instructor, EventStatus } from '@/types/event';

export const eventService = {
  // Get all events with presenters
  async fetchEvents(): Promise<EventWithPresenters[]> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        presenters:event_presenters(
          id,
          user_id,
          created_at
        )
      `)
      .order('start_date', { ascending: true });

    if (error) throw error;
    
    // Get presenter details separately
    const eventsWithPresenters = await Promise.all(
      (data || []).map(async (event) => {
        if (event.presenters && event.presenters.length > 0) {
          const userIds = event.presenters.map((p: any) => p.user_id);
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email')
            .in('id', userIds);
          
          return {
            ...event,
            status: event.status as EventStatus,
            presenters: profiles || []
          };
        }
        return {
          ...event,
          status: event.status as EventStatus,
          presenters: []
        };
      })
    );

    // Ensure `created_at` and `updated_at` are always strings, not null
    return eventsWithPresenters.map(event => ({
      ...event,
      created_at: event.created_at ?? '',
      updated_at: event.updated_at ?? '',
    })) as EventWithPresenters[];
  },

  // Get public events (filter by status)
  async fetchPublicEvents(statusFilter?: string[]): Promise<EventWithPresenters[]> {
    let query = supabase
      .from('events')
      .select(`
        *,
        presenters:event_presenters(
          id,
          user_id,
          created_at
        )
      `)
      .order('start_date', { ascending: true });

    if (statusFilter && statusFilter.length > 0) {
      query = query.in('status', statusFilter);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    // Get presenter details separately
    const eventsWithPresenters = await Promise.all(
      (data || []).map(async (event) => {
        if (event.presenters && event.presenters.length > 0) {
          const userIds = event.presenters.map((p: any) => p.user_id);
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email')
            .in('id', userIds);
          
          return {
            ...event,
            status: event.status as EventStatus,
            presenters: profiles || []
          };
        }
        return {
          ...event,
          status: event.status as EventStatus,
          presenters: []
        };
      })
    );
    
    return eventsWithPresenters.map(event => ({
      ...event,
      created_at: event.created_at ?? '',
      updated_at: event.updated_at ?? '',
    })) as EventWithPresenters[];
  },

  // Get single event with presenters
  async fetchEventById(id: string): Promise<EventWithPresenters | null> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        presenters:event_presenters(
          id,
          user_id,
          created_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }

    // Get presenter details separately
    let presenters: Instructor[] = [];
    if (data.presenters && data.presenters.length > 0) {
      const userIds = data.presenters.map((p: any) => p.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds);
      presenters = profiles || [];
    }

    return {
      ...data,
      status: data.status as EventStatus,
      created_at: data.created_at ?? '',
      updated_at: data.updated_at ?? '',
      presenters
    };
  },

  // Create new event
  async createEvent(eventData: CreateEventData): Promise<EventWithPresenters> {
    const { presenter_ids, ...eventFields } = eventData;
    
    // Create the event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert(eventFields)
      .select()
      .single();

    if (eventError) throw eventError;

    // Add presenters if provided
    if (presenter_ids && presenter_ids.length > 0) {
      const presenterInserts = presenter_ids.map(user_id => ({
        event_id: event.id,
        user_id
      }));

      const { error: presenterError } = await supabase
        .from('event_presenters')
        .insert(presenterInserts);

      if (presenterError) throw presenterError;
    }

    // Return the complete event with presenters
    return this.fetchEventById(event.id) as Promise<EventWithPresenters>;
  },

  // Update event
  async updateEvent(id: string, eventData: UpdateEventData): Promise<EventWithPresenters> {
    const { presenter_ids, ...eventFields } = eventData;
    
    // Update the event
    const { error: eventError } = await supabase
      .from('events')
      .update(eventFields)
      .eq('id', id);

    if (eventError) throw eventError;

    // Update presenters if provided
    if (presenter_ids !== undefined) {
      // Remove existing presenters
      const { error: deleteError } = await supabase
        .from('event_presenters')
        .delete()
        .eq('event_id', id);

      if (deleteError) throw deleteError;

      // Add new presenters
      if (presenter_ids.length > 0) {
        const presenterInserts = presenter_ids.map(user_id => ({
          event_id: id,
          user_id
        }));

        const { error: insertError } = await supabase
          .from('event_presenters')
          .insert(presenterInserts);

        if (insertError) throw insertError;
      }
    }

    // Return the updated event with presenters
    return this.fetchEventById(id) as Promise<EventWithPresenters>;
  },

  // Delete event
  async deleteEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Add presenter to event
  async addPresenter(eventId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('event_presenters')
      .insert({ event_id: eventId, user_id: userId });

    if (error) throw error;
  },

  // Remove presenter from event
  async removePresenter(eventId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('event_presenters')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Get all users for presenter selection
  async fetchUsersForPresenters(): Promise<Instructor[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .order('first_name');

    if (error) throw error;
    return data || [];
  }
};
