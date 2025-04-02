import { CONSTANTS } from "@/lib/constants"
import { supabase } from "@/lib/supabase-client"

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

    async fetchBusinessInfo(userId: string, onSuccess: any, onError: any) {

        const { data, error } = await supabase
            .from("BusinessInfo")
            .select("*")
            .eq("userId", userId)
            .order("createdAt", { ascending: false })

        if (error) throw new Error("Error fetching BusinessInfo: " + error.message)
        
        onSuccess(data as BusinessInfo[])
    }

    async createBusinessInfo(userId: string, content: string, onSuccess: any, onError: any) {

        const { data, error } = await supabase
            .from("BusinessInfo")
            .insert([
            {
                id: crypto.randomUUID(),
                userId: userId,
                content: content.trim(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            ])
            .select()
            .single()

        if (error) throw new Error("Error creating BusinessInfo: " + error.message)
        
        onSuccess(data)
    }

    async updateBusinessInfo(businessId: string, content: string, onSuccess: any, onError: any) {
      const { data, error } = await supabase
        .from("BusinessInfo")
        .update({ 
            content: content.trim(), 
            updatedAt: new Date().toISOString() }
        )
        .eq("id", businessId)
        .select()
        .single()
      
      if (error) throw new Error("Error updating BusinessInfo: " + error.message)

      onSuccess(data)
    }

    async deleteBusinessInfo(businessId: string, onSuccess: any, onError: any) {
        const { error } = await supabase.from("BusinessInfo").delete().eq("id", businessId)
        if (error) throw new Error("Error deleting BusinessInfo: " + error.message)
        onSuccess(businessId)
    }

    async fetchProducts(userId: string, onSuccess: any, onError: any) {

        const { data, error } = await supabase
          .from("Product")
          .select("*")
          .eq("userId", userId)
          .order("createdAt", { ascending: false })

        if (error) throw new Error("Error fetching products: " + error.message)

        onSuccess(data as Product[])
    }

    async createProduct(userId: string, name: string, description: string, onSuccess: any, onError: any) {

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
        
        const { error } = await supabase.from("Product").delete().eq("id", productId)
        if (error) throw new Error("Error deleting product: " + error.message)

        onSuccess(productId)
    }
}
