import { CONSTANTS } from "./constants"
import { supabase } from "./supabase-client"

export class AIAssistantHandler {

    async load(onSuccess: any, onError: any) {

        // Check for a session
        const { data: sessionData } = await supabase.auth.getSession()
        if (!sessionData?.session) {
          onError(CONSTANTS.ERROR_SESSION)
          return
        }
  
        const userId = sessionData.session.user.id
        console.log("Current User ID:", userId)
  
        // Fetch existing row for this user
        const { data: existing, error } = await supabase
          .from("AIAssistantSetup")
          .select("*")
          .eq("userId", userId)
          .maybeSingle()
  
        console.log(existing, error)
  
        if (error || !existing) {
          // If no row is found, log it, set error message in state
          console.log("No existing row found for user:", userId, "Error:", error)
          onError(CONSTANTS.ERROR_GENERIC, error)
          return
        }
  
        // If we do find the row, log it and populate the form
        console.log("Found existing row for user:", userId, existing)
        onSuccess(existing)
    }

    async save(assistant: any, onSuccess: any, onError: any) {

        try {
        const { data: sessionData } = await supabase.auth.getSession()
        if (!sessionData?.session?.user?.id) {
            onError(CONSTANTS.ERROR_SESSION)
            return
        }

        const userId = sessionData.session.user.id
        console.log("Saving data for user:", userId)

        // Check if a record exists (should exist in this scenario, but we check again anyway)
        const { data: existing } = await supabase
            .from("AIAssistantSetup")
            .select("id")
            .eq("userId", userId)
            .single()

        if (!existing) {
            console.log("No existing row found in handleSave, cannot update. Consider your logic here.")
            // If you want to allow creation here, you could do so:
            // await supabase.from("AIAssistantSetup").insert({...})
        } else {
            // Update existing record
            const { error } = await supabase
            .from("AIAssistantSetup")
            .update({
                assistantName: assistant.assistantName,
                persona: assistant.persona,
                instructions: assistant.instructions
            })
            .eq("id", existing.id)

            if (error) {
                onError(CONSTANTS.ERROR_GENERIC, error)
            } else {
                onSuccess(existing)
            }
        }
        } catch (error) {
            onError(CONSTANTS.ERROR_GENERIC, error)
        }
    }

}