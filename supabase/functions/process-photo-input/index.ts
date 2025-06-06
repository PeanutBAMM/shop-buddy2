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
    const { image_data, user_id, list_id } = await req.json();

    if (!image_data || !user_id) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: image_data, user_id",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Mock AI image recognition - in a real app, this would use an AI service
    const mockRecognizedItems = [
      { name: "Appels", category: "Fruit", quantity: "1 kg", confidence: 0.95 },
      {
        name: "Melk",
        category: "Zuivel",
        quantity: "1 liter",
        confidence: 0.88,
      },
      {
        name: "Brood",
        category: "Bakkerij",
        quantity: "1 heel",
        confidence: 0.92,
      },
    ];

    // Get user's default shopping list if no list_id provided
    let targetListId = list_id;
    if (!targetListId) {
      const { data: defaultList, error: listError } = await supabaseClient
        .from("shopping_lists")
        .select("id")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (listError) {
        throw listError;
      }
      targetListId = defaultList.id;
    }

    // Add recognized items to shopping list
    const itemsToInsert = mockRecognizedItems.map((item) => ({
      list_id: targetListId,
      name: item.name,
      quantity: item.quantity,
      completed: false,
    }));

    const { data: insertedItems, error: insertError } = await supabaseClient
      .from("shopping_items")
      .insert(itemsToInsert)
      .select();

    if (insertError) {
      throw insertError;
    }

    // Log user behavior
    await supabaseClient.from("user_behavior_logs").upsert(
      {
        user_id,
        action_type: "photo_input",
        action_data: {
          items_count: mockRecognizedItems.length,
          method: "camera",
        },
        frequency_count: 1,
        last_performed_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,action_type",
        ignoreDuplicates: false,
      },
    );

    return new Response(
      JSON.stringify({
        data: {
          recognized_items: mockRecognizedItems,
          added_items: insertedItems,
          list_id: targetListId,
        },
        message: "Photo processed and items added successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error in process-photo-input:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        message: "Failed to process photo input",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
