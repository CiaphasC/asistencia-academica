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
    const { sesionId } = await req.json()

    if (!sesionId) {
      return new Response(JSON.stringify({ error: "sesionId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL") || "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "")

    // Get session data
    const { data: sesion, error: sesionError } = await supabase
      .from("sesiones_clase")
      .select("id, curso_id, fecha_sesion, hora_inicio")
      .eq("id", sesionId)
      .single()

    if (sesionError) throw sesionError

    // Generate QR token (using session ID as base)
    const qrToken = `${sesionId}-${Date.now()}`

    // Update session with QR token
    const { error: updateError } = await supabase
      .from("sesiones_clase")
      .update({ qr_token: qrToken, updated_at: new Date().toISOString() })
      .eq("id", sesionId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({
        success: true,
        qrToken,
        qrUrl: `${Deno.env.get("SUPABASE_URL")}/asistencia/qr/${qrToken}`,
        sesion,
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
