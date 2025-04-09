import { CONSTANTS } from "./constants"
import { supabase } from "./supabase-client"

export class AIAssistantHandler {

    conversationHistory: any = []
    assistant: any

    supabaseInterface: any

    setSupabaseInterface(obj: any) {
        this.supabaseInterface = obj
    }

    async sendMessage(message: any, onSuccess: any, onError: any) {

        if (this.assistant == null) throw "AIAssistantHandler not yet initialized."

        // Construct the prompt messages for GPT by mapping conversation messages
        const promptMessages = this.conversationHistory.slice();
        
        const newMessage = {
            role: "user",
            content: message,
        };
        promptMessages.push(newMessage);

        // Call the GPT-4o Mini API
        console.log('Calling GPT-4o Mini API...');
        const openaiResponse = await fetch('/api/aiassistant/send-message', {
            method: 'POST',
            body: JSON.stringify({
                assistantInfo: this.assistant,
                message: message,
            }),
        });

        const newReplies = await openaiResponse.json();
        promptMessages.push(newReplies);
        this.conversationHistory = promptMessages;

        console.log('updated convo', newReplies, this.conversationHistory);
        onSuccess(newReplies.content);
    }

    async loadSettings(onSuccess: any, onError: any) {

        const user = this.supabaseInterface.getUser()
        const userId = user.id
        console.log("Current User ID:", userId)
  
        let supabase = await this.supabaseInterface.getClient()

        // Fetch existing row for this user
        const { data: existing, error } = await supabase
          .from("AIAssistantSetup")
          .select("*")
          .eq("userId", userId)
          .maybeSingle()
  
        if (error) {
          console.error("Error:", error)
          onError(CONSTANTS.ERROR_GENERIC, error)
          return
        }
  
        if (!existing) {
            console.warn("No existing row found for user:", userId)
            onSuccess({
                assistantName: "",
                introMessage: "",
                shortDescription: "",
                guidelines: "",
                responseLength: "",
            })
            return
          }

        // If we do find the row, log it and populate the form
        console.log("Found existing row for user:", userId, existing)
        
        this.assistant = existing
        onSuccess(existing)
    }

    async saveSettings(assistant: any, onSuccess: any, onError: any) {

        try {

            const user = this.supabaseInterface.getUser()
            const userId = user.id
            console.log("Saving data for user:", userId)

            let supabase = await this.supabaseInterface.getClient()

            const { data: existing } = await supabase
                .from("AIAssistantSetup")
                .select("id")
                .eq("userId", userId)
                .limit(1)

            console.log("existing record", existing)

            if (existing == null || existing.length < 1) {
                
                const { data: insertedRow, error: insertError } = await supabase
                    .from("AIAssistantSetup")
                    .insert({
                        ... assistant,
                        userId: userId,
                        updatedAt: new Date()
                    })
                    .select()
                    .limit(1)

                console.log("inserted new row", assistant, insertedRow, insertError)

                if (insertError) {
                    onError(CONSTANTS.ERROR_GENERIC, insertError)
                } else {
                    this.assistant = assistant
                    onSuccess(insertedRow)
                }
            } 
            else {
                // Update existing record
                const { error } = await supabase
                .from("AIAssistantSetup")
                .update(assistant)
                .eq("id", existing.id)

                console.log("updated existing row", assistant, error)

                if (error) {
                    onError(CONSTANTS.ERROR_GENERIC, error)
                } else {
                    this.assistant = assistant
                    onSuccess(existing)
                }
            }
        } catch (error) {
            onError(CONSTANTS.ERROR_GENERIC, error)
        }
    }

}