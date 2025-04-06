import { CONSTANTS } from "@/lib/constants"
import { supabase } from "./supabase-client"

export class SessionHandler {

    async initSession(onSuccess: any, onError: any) {
      
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()
      if (sessionError) throw new Error("Error retrieving session.")
      
      if (!session?.user) {
        onError(CONSTANTS.ERROR_AUTH)
        return
      }

      onSuccess(session)
    }

}