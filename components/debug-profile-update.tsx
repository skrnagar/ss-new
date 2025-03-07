"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export function DebugProfileUpdate() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkPermissions = async () => {
    setLoading(true)
    try {
      // Get current session
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData.session?.user.id

      if (!userId) {
        setDebugInfo({ error: "Not authenticated" })
        return
      }

      // Test SELECT permission
      const selectResult = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      // Test RLS policies
      const policyResult = await supabase.rpc('get_policies', { table_name: 'profiles' }).catch(e => ({ error: e }))

      // Collect debug info
      setDebugInfo({
        userId,
        selectPermission: !selectResult.error,
        selectData: selectResult.data,
        selectError: selectResult.error,
        policies: policyResult
      })
    } catch (error) {
      setDebugInfo({ error })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6 border p-4 rounded-md">
      <h3 className="text-sm font-medium mb-2">Debug Profile Permissions</h3>
      <Button 
        variant="outline" 
        size="sm"
        onClick={checkPermissions}
        disabled={loading}
      >
        {loading ? "Checking..." : "Check Permissions"}
      </Button>

      {debugInfo && (
        <pre className="mt-4 p-3 bg-muted text-xs overflow-auto h-40 rounded">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      )}
    </div>
  )
}