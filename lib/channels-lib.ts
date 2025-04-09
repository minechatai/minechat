import { CONSTANTS } from "./constants"

export class Channels {
    
    supabaseInterface: any

    setSupabaseInterface(obj: any) {
        this.supabaseInterface = obj
    }

    async loadUserChannels(onSuccess: any, onError: any) {
        try {

            let user = this.supabaseInterface.getUser()
            let supabase = this.supabaseInterface.getClient()

            // Fetch the UserChannel row.
            const { data: existingRow, error: fetchError } = await supabase
                .from("UserChannel")
                .select("*")
                .eq("userId", user.id)
                .single()
        
            if (fetchError) {
                console.warn("Could not fetch UserChannel:", fetchError.message)
            }
        
            // Create a row if none found.
            let userChannel = existingRow
            if (!userChannel) {
                console.log("No UserChannel row found. Creating a new one...")
                
                let newRecord = { 
                    userId: user.id, 
                    updatedAt: new Date(),
                }
        
                console.log("Inserting new record: ", newRecord)
        
                const { data: insertedRow, error: insertError } = await supabase
                    .from("UserChannel")
                    .insert(newRecord)
                    .select()
                    .limit(1)
        
                if (insertError) {
                    onError(CONSTANTS.ERROR_GENERIC, insertError.message)
                    return
                }
                userChannel = insertedRow
            }
        
            // Set local channel state, including Facebook credentials and fbPageName.
            onSuccess({
                userId: user.id,
                data: {
                    website: userChannel.website || false,
                    messenger: userChannel.messenger || false,
                    instagram: userChannel.instagram || false,
                    telegram: userChannel.telegram || false,
                    whatsapp: userChannel.whatsapp || false,
                    viber: userChannel.viber || false,
                    discord: userChannel.discord || false,
                    slack: userChannel.slack || false,
                    facebookPageId: userChannel.facebookPageId || "",
                    facebookAccessToken: userChannel.facebookAccessToken || "",
                    fbPageName: userChannel.fbPageName || ""
                }
            })
        }
        catch(err) {
            onError(CONSTANTS.ERROR_GENERIC, err)
        }
    }

    async save(channels: any, onSuccess: any, onError: any) {
        try {
            
            let user = this.supabaseInterface.getUser()
            const userId = user.id
            console.log("Saving channel settings for userId:", userId, channels)

            let supabase = this.supabaseInterface.getClient()

            // Prepare a new channels object for update, and add fbPageName if available.
            let updatedChannels = { ...channels }

            // If a Facebook Page ID is provided, fetch the fbPageName from the API.
            if (channels.facebookPageId) {
                const response = await fetch("/api/facebook/page-name", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        facebookPageId: channels.facebookPageId,
                        accessToken: channels.facebookAccessToken
                    })
                })
                if (response.ok) {
                    const json = await response.json()
                    updatedChannels.fbPageName = json.pageName
                } else {
                    onError(CONSTANTS.ERROR_GENERIC, "Failed to fetch fbPageName")
                }
            }

            // Update the UserChannel record for the logged in user.
            const { data, error } = await supabase
                .from("UserChannel")
                .update(updatedChannels)
                .eq("userId", userId)

            if (error) {
                onError(CONSTANTS.ERROR_GENERIC, error.message)
            } else {
                onSuccess(data, updatedChannels)
            }
        } catch (err) {
            onError(CONSTANTS.ERROR_GENERIC, err)
        }
    }

    // Call the Facebook sync API to sync conversations.
    async syncConversations(channels: any, onSuccess: any, onError: any) {
        try {
            let user = await this.supabaseInterface.getUser()
            const userId = user.id

            const response = await fetch("/api/facebook/sync-conversations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    facebookPageId: channels.facebookPageId,
                    accessToken: channels.facebookAccessToken
                })
            })

            if (!response.ok) {
                const errorText = await response.text()
                onError(CONSTANTS.ERROR_GENERIC, {
                    msg: errorText,
                    status: response.status,
                })
                return
            }

            onSuccess(await response.json())
        } catch (error) {
            onError(CONSTANTS.ERROR_GENERIC, error)
        }
    }
}