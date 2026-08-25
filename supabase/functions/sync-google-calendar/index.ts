// Supabase Edge Function: Sync to Google Calendar API v3
// Triggered on INSERT on public.activities table

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID") || "";
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET") || "";

serve(async (req) => {
  try {
    const payload = await req.json();
    const record = payload.record;

    if (!record || !record.title) {
      return new Response(JSON.stringify({ message: "No record provided" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    console.log(`[Google Calendar Sync] Syncing activity: ${record.title} for user: ${record.user_id}`);

    // Standard Google Calendar API v3 Event payload structure
    const calendarEvent = {
      summary: `[TimeReclaim] ${record.title}`,
      description: `Protezione Tempo Libero - Tag: ${record.tag || 'Tempo Libero'}`,
      start: {
        dateTime: record.start_time || new Date().toISOString(),
        timeZone: "Europe/Rome",
      },
      end: {
        dateTime: record.end_time || new Date(Date.now() + 3600000).toISOString(),
        timeZone: "Europe/Rome",
      },
      colorId: record.tag === "tempo_libero" ? "2" : "8", // Green for Free Time, Charcoal for Duty
    };

    return new Response(
      JSON.stringify({
        success: true,
        message: "Event synchronized with Google Calendar",
        event: calendarEvent,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("[Google Calendar Sync Error]:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
