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
    const { action_type, user_id, action_data } = await req.json();

    if (!action_type || !user_id) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: action_type, user_id",
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

    let response = {};

    switch (action_type) {
      case "quick_add":
        // Get user's most used list
        const { data: defaultList } = await supabaseClient
          .from("shopping_lists")
          .select("id, name")
          .eq("user_id", user_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        response = {
          message: `Wat wil je toevoegen aan ${defaultList?.name || "je boodschappenlijst"}?`,
          suggestions: ["Melk", "Brood", "Eieren", "Appels"],
          default_list: defaultList,
        };
        break;

      case "meal_planning":
        // Generate meal suggestions
        const mockRecipes = [
          {
            id: "recipe-1",
            name: "Spaghetti Carbonara",
            image:
              "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80",
            cook_time: "20 min",
            difficulty: "Gemiddeld",
            ingredients: [
              "Spaghetti",
              "Eieren",
              "Parmezaanse kaas",
              "Pancetta",
              "Zwarte peper",
            ],
          },
          {
            id: "recipe-2",
            name: "Kip Teriyaki",
            image:
              "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&q=80",
            cook_time: "30 min",
            difficulty: "Makkelijk",
            ingredients: [
              "Kipfilet",
              "Teriyaki saus",
              "Rijst",
              "Broccoli",
              "Sesamzaad",
            ],
          },
        ];

        response = {
          message: "Hier zijn enkele receptsuggesties voor deze week:",
          recipes: mockRecipes,
        };
        break;

      case "generate_recipe":
        const generatedRecipe = {
          id: "generated-recipe-1",
          name: "Snelle Pasta Pesto",
          image:
            "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=600&q=80",
          cook_time: "15 min",
          difficulty: "Makkelijk",
          ingredients: [
            "Pasta",
            "Pesto",
            "Pijnboompitten",
            "Parmezaanse kaas",
            "Kerstomaatjes",
          ],
          instructions: [
            "Kook de pasta volgens de verpakking",
            "Meng de warme pasta met pesto",
            "Voeg pijnboompitten en kaas toe",
            "Garneer met kerstomaatjes",
          ],
        };

        response = {
          message: "Ik heb een lekker recept voor je gegenereerd:",
          recipe: generatedRecipe,
        };
        break;

      case "update_inventory":
        response = {
          message: "Scan een product of bonnetje om je voorraad bij te werken.",
          action_required: "camera_input",
        };
        break;

      case "view_expenses":
        // Mock expense data
        const mockExpenses = {
          this_week: 127.5,
          last_week: 98.75,
          monthly_average: 450.0,
          top_categories: [
            { name: "Groenten & Fruit", amount: 45.2 },
            { name: "Zuivel", amount: 32.1 },
            { name: "Vlees & Vis", amount: 28.9 },
          ],
        };

        response = {
          message: "Hier is een overzicht van je uitgaven:",
          expenses: mockExpenses,
        };
        break;

      default:
        response = {
          message:
            "Ik begrijp je verzoek niet helemaal. Kun je het anders formuleren?",
        };
    }

    // Log user behavior
    await supabaseClient.from("user_behavior_logs").upsert(
      {
        user_id,
        action_type,
        action_data: action_data || {},
        frequency_count: 1,
        last_performed_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,action_type",
        ignoreDuplicates: false,
      },
    );

    // Update assistant category usage
    await supabaseClient
      .from("assistant_categories")
      .update({
        usage_count: supabaseClient.raw("usage_count + 1"),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user_id)
      .eq("action_type", action_type);

    return new Response(
      JSON.stringify({
        data: response,
        message: "AI assistant action processed successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error in ai-assistant-trigger:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        message: "Failed to process AI assistant action",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
