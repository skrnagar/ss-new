"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/ui/icons"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("login")

  // Get the redirect URL from the query params
  const redirectUrl = searchParams.get("redirectUrl")

  useEffect(() => {
    // Check for error in query params
    const queryError = searchParams.get('error')
    if (queryError) {
      setError(decodeURIComponent(queryError))
    }

    // Set active tab based on query params
    const tab = searchParams.get('tab')
    if (tab === 'register') {
      setActiveTab('register')
    }
  }, [searchParams])

  const handleSignIn = async (provider?: 'google' | 'github' | 'linkedin_oidc') => {
    setLoading(true)
    setError(null)

    try {
      if (provider) {
        // For OAuth providers
        let finalRedirectUrl = `/auth/callback`

        // If we have a redirectUrl, pass it as a query param
        if (redirectUrl) {
          finalRedirectUrl += `?redirectUrl=${encodeURIComponent(redirectUrl)}`
        }

        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}${finalRedirectUrl}`
          }
        })

        if (error) throw error

        // No need to redirect here, OAuth flow will handle it
      } else {
        // For email/password sign in
        const { error, data } = await supabase.auth.signInWithPassword({ email, password })

        if (error) throw error

        toast({
          title: "Signed in successfully",
          description: "Welcome back!",
        })

        // Redirect to the original requested URL or feed
        router.push(redirectUrl || '/feed')
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      setError(err.message || 'An error occurred during authentication')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error

      toast({
        title: "Verification email sent",
        description: "Please check your email to confirm your account",
      })

      setActiveTab('login')
    } catch (err: any) {
      console.error('Auth error:', err)
      setError(err.message || 'An error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      <div className="md:w-[500px] w-full">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Safety Shaper</CardTitle>
            <CardDescription className="text-center">
              The professional network for ESG & EHS professionals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Button variant="link" className="px-0 text-xs" onClick={() => router.push('/auth/reset-password')}>
                      Forgot password?
                    </Button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => handleSignIn()}
                  disabled={loading || !email || !password}
                >
                  {loading ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Sign In
                </Button>
              </TabsContent>
              <TabsContent value="register" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-email">Email</Label>
                  <Input
                    id="new-email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleSignUp}
                  disabled={loading || !email || !password}
                >
                  {loading ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Account
                </Button>
              </TabsContent>
            </Tabs>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => handleSignIn('google')}
                disabled={loading}
              >
                {loading ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.google className="mr-2 h-4 w-4" />}
                Google
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => handleSignIn('linkedin_oidc')}
                disabled={loading}
              >
                {loading ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.linkedin className="mr-2 h-4 w-4" />}
                LinkedIn
              </Button>
            </div>
          </CardContent>
          <CardFooter className="text-center text-xs text-muted-foreground">
            By continuing, you agree to Safety Shaper's Terms of Service and Privacy Policy.
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}