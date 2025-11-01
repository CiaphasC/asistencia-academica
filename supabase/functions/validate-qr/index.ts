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
    const { qrToken, estudianteId } = await req.json()

    if (!qrToken || !estudianteId) {
      return new Response(JSON.stringify({ error: "qrToken and estudianteId are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL") || "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "")

    const { data: sesion, error: sesionError } = await supabase
      .from("sesiones_clase")
      .select("id, curso_id, fecha_sesion, hora_inicio, hora_fin")
      .eq("qr_token", qrToken)
      .single()

    if (sesionError || !sesion) {
      throw sesionError ?? new Error("Sesión no encontrada o QR expirado")
    }

    const { data: matricula, error: matriculaError } = await supabase
      .from("matriculas")
      .select("id")
      .eq("estudiante_id", estudianteId)
      .eq("curso_id", sesion.curso_id)
      .single()

    if (matriculaError || !matricula) {
      throw matriculaError ?? new Error("No estás matriculado en este curso")
    }

    const { data: existingAttendance, error: existingError } = await supabase
      .from("asistencias")
      .select("id")
      .eq("sesion_id", sesion.id)
      .eq("estudiante_id", estudianteId)
      .maybeSingle()

    if (existingError) {
      throw existingError
    }

    if (existingAttendance) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Ya registraste asistencia para esta sesión",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      )
    }

    const { error: attendanceError } = await supabase
      .from("asistencias")
      .upsert(
        [
          {
            sesion_id: sesion.id,
            estudiante_id: estudianteId,
            asistio: true,
            fecha_registro: new Date().toISOString(),
          },
        ],
        { onConflict: "sesion_id,estudiante_id" },
      )

    if (attendanceError) {
      throw attendanceError
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Asistencia registrada correctamente",
        sesion,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Error inesperado validando el QR" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
