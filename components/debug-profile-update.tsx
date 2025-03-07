
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export function DebugProfileUpdate() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const testProfileUpdate = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // First get the user session to find the user ID
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData.session?.user.id
      
      setUserId(userId)
      
      if (!userId) {
        throw new Error("No user ID found - please login first")
      }

      // First try to get the profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()
      
      if (profileError) {
        console.error("Error getting profile:", profileError)
        throw new Error(`Failed to get profile: ${profileError.message} (${profileError.code})`)
      }
      
      console.log("Current profile:", profileData)

      // Try a minimal update
      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", userId)
        .select("*")
      
      if (updateError) {
        throw updateError
      }
      
      setResult(data)
    } catch (err: any) {
      console.error("Debug update error:", err)
      setError({
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint
      })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="mt-6 p-4 border rounded-md bg-gray-50">
      <h3 className="font-medium mb-2">Debug Profile Updates</h3>
      <Button 
        variant="outline" 
        size="sm"
        onClick={testProfileUpdate} 
        disabled={loading}
      >
        {loading ? "Testing..." : "Test Profile Update"}
      </Button>
      
      {userId && (
        <div className="mt-2 text-xs text-gray-500">
          User ID: {userId}
        </div>
      )}
      
      {error && (
        <div className="mt-4">
          <h4 className="font-medium text-red-600">Error:</h4>
          <pre className="mt-1 p-2 bg-red-50 text-red-800 rounded text-xs overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}
      
      {result && (
        <div className="mt-4">
          <h4 className="font-medium text-green-600">Success:</h4>
          <pre className="mt-1 p-2 bg-green-50 text-green-800 rounded text-xs overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
