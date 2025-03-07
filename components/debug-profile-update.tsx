
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export function DebugProfileUpdate() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const testProfileUpdate = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // First get the user session to find the user ID
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData.session?.user.id
      
      if (!userId) {
        throw new Error("No user ID found - please login first")
      }

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
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-md mb-4">
      <h3 className="font-medium mb-2">Debug Profile Update</h3>
      <Button 
        onClick={testProfileUpdate} 
        disabled={loading}
        variant="outline"
        size="sm"
      >
        {loading ? "Testing..." : "Test Profile Update"}
      </Button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
          <p className="font-bold">Error:</p>
          <pre className="text-sm overflow-auto">{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
          <p className="font-bold">Success:</p>
          <pre className="text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
