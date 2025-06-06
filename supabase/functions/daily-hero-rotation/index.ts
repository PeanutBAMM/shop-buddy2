import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const today = new Date().toISOString().split("T")[0];

    // Get today's hero content
    const { data: heroContent, error: heroError } = await supabaseClient
      .from("daily_hero_content")
      .select("*")
      .eq("date", today)
      .eq("is_active", true)
      .single();

    if (heroError && heroError.code !== "PGRST116") {
      throw heroError;
    }

    // If no content for today, get the most recent content
    if (!heroContent) {
      const { data: fallbackContent, error: fallbackError } =
        await supabaseClient
          .from("daily_hero_content")
          .select("*")
          .eq("is_active", true)
          .order("date", { ascending: false })
          .limit(1)
          .single();

      if (fallbackError) {
        throw fallbackError;
      }

      return new Response(
        JSON.stringify({
          data: fallbackContent,
          message: "Using fallback content",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    return new Response(
      JSON.stringify({
        data: heroContent,
        message: "Hero content retrieved successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error in daily-hero-rotation:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        message: "Failed to retrieve hero content",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
