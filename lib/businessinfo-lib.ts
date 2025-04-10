import { CONSTANTS } from "./constants"
import { supabase } from "./supabase-client"

/**
 * Interface for BusinessInfo.
 */
export interface BusinessInfo {
  id: string
  userId: string
  content: string
  createdAt: string
  updatedAt: string
}

/**
 * Interface for Product.
 */
export interface Product {
  id: string
  userId: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export class BusinessInfoHandler {

    supabaseInterface: any

    setSupabaseInterface(obj: any) {
        this.supabaseInterface = obj
    }

    async fetchBusinessInfo(onSuccess: any, onError: any) {

      const user = this.supabaseInterface.getUser()
      const userId = user.id
      console.log("Current User ID:", userId)
      
      let supabase = await this.supabaseInterface.getClient()

      const { data, error } = await supabase
          .from("BusinessInfo")
          .select("*")
          .eq("userId", userId)
          .order("createdAt", { ascending: false })
          .maybeSingle()

      if (error) {
        onError(CONSTANTS.ERROR_GENERIC, error.message)
        return
      }

      onSuccess(data)
    }

    async createOrUpdateBusinessInfo(businessInfo: any, onSuccess: any, onError: any) {

      const user = this.supabaseInterface.getUser()
      const userId = user.id
      console.log("Current User ID:", userId)

      let supabase = await this.supabaseInterface.getClient()

      let { data, error } = await supabase
        .from("BusinessInfo")
        .select("*")
        .eq("id", businessInfo.id)
        .eq("userId", userId)
        .maybeSingle()

      console.log(data, error)

      if (data == null || data.length < 1) {
        const result = await supabase
          .from("BusinessInfo")
          .insert([
          {
            ... businessInfo,
            id: crypto.randomUUID(),
            userId: userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          ])
          .select()
          .maybeSingle()

        data = result.data
        error = result.error

        console.log(result)
      }
      else {
        const result  = await supabase
          .from("BusinessInfo")
          .update({
            ... businessInfo,
            updatedAt: new Date().toISOString(),
          })
          .eq("id", businessInfo.id)
          .eq("userId", userId)
          .select()
          .maybeSingle()
          
        data = result.data
        error = result.error       
        
        console.log(result)
      }

      if (error) {
        onError(CONSTANTS.ERROR_GENERIC, error.message)
        return
      }
      
      onSuccess(data)
    }

    async deleteBusinessInfo(businessId: string, onSuccess: any, onError: any) {
        
        let supabase = await this.supabaseInterface.getClient()

        const { error } = await supabase.from("BusinessInfo").delete().eq("id", businessId)
        if (error) throw new Error("Error deleting BusinessInfo: " + error.message)
        onSuccess(businessId)
    }

    async fetchProducts(userId: string, onSuccess: any, onError: any) {

        let supabase = await this.supabaseInterface.getClient()

        const { data, error } = await supabase
          .from("Product")
          .select("*")
          .eq("userId", userId)
          .order("createdAt", { ascending: false })

        if (error) throw new Error("Error fetching products: " + error.message)

        onSuccess(data as Product[])
    }

    async createProduct(userId: string, name: string, description: string, onSuccess: any, onError: any) {
        
        let supabase = await this.supabaseInterface.getClient()

        const { data, error } = await supabase
        .from("Product")
        .insert([
          {
            id: crypto.randomUUID(),
            userId: userId,
            name: name.trim(),
            description: description.trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ])
        .select()
        .single()
      
      if (error) throw new Error("Error creating product: " + error.message)

      onSuccess(data)
    }

    async updateProduct(productId: string, name: string, description: string, onSuccess: any, onError: any) {
      
      let supabase = await this.supabaseInterface.getClient()
      
      const { data, error } = await supabase
        .from("Product")
        .update({
          name: name.trim(),
          description: description.trim(),
          updatedAt: new Date().toISOString(),
        })
        .eq("id", productId)
        .select()
        .single()

      if (error) throw new Error("Error updating product: " + error.message)
      
      onSuccess(data)
    }

    async deleteProduct(productId: string, onSuccess: any, onError: any) {
      
        let supabase = await this.supabaseInterface.getClient()

        const { error } = await supabase.from("Product").delete().eq("id", productId)
        if (error) throw new Error("Error deleting product: " + error.message)

        onSuccess(productId)
    }
}
