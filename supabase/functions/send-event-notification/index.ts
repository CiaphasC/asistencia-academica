import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { eventoId, mensaje } = await req.json()

    if (!eventoId) {
      return new Response(JSON.stringify({ error: "eventoId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL") || "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "")

    // Get event details
    const { data: evento, error: eventoError } = await supabase
      .from("eventos")
      .select("id, nombre, descripcion")
      .eq("id", eventoId)
      .single()

    if (eventoError) throw eventoError

    // Get all participants
    const { data: participantes, error: participantesError } = await supabase
      .from("evento_participantes")
      .select("email")
      .eq("evento_id", eventoId)

    if (participantesError) throw participantesError

    // In a real scenario, you would send emails here
    // For now, we'll just log the notification
    console.log(`[v0] Sending notification for event: ${evento.nombre}`)
    console.log(`[v0] Recipients: ${participantes.length}`)
    console.log(`[v0] Message: ${mensaje || evento.descripcion}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notification sent to ${participantes.length} participants`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
