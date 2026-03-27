'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/providers/supabase-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

const AUTH_RATE_LIMIT_COOLDOWN_SECONDS = 60

function isRateLimitError(error: unknown) {
  const maybeError = error as { message?: string; status?: number } | undefined
  const message = maybeError?.message ?? ''
  const status = maybeError?.status

  return status === 429 || /rate limit|too many requests|over_email_send_rate_limit/i.test(message)
}

export default function LoginPage() {
  const router = useRouter()
  const supabase = useSupabase()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [signupCooldownSeconds, setSignupCooldownSeconds] = useState(0)

  useEffect(() => {
    if (!signupCooldownSeconds) return

    const timer = window.setInterval(() => {
      setSignupCooldownSeconds((previous) => (previous > 1 ? previous - 1 : 0))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [signupCooldownSeconds])

  function handleAuthError(error: unknown, action: 'login' | 'signup') {
    if (isRateLimitError(error)) {
      if (action === 'signup') {
        setSignupCooldownSeconds(AUTH_RATE_LIMIT_COOLDOWN_SECONDS)
        toast.error(
          `Too many signup attempts. Please wait ${AUTH_RATE_LIMIT_COOLDOWN_SECONDS} seconds and try again.`
        )
      } else {
        toast.error('Login is temporarily rate-limited by Supabase. Please try again shortly.')
      }
      return
    }

    toast.error(error instanceof Error ? error.message : `Failed to ${action === 'login' ? 'sign in' : 'create account'}`)
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast.success('Signed in successfully!')
      router.push('/')
      router.refresh()
    } catch (error) {
      handleAuthError(error, 'login')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()

    if (signupCooldownSeconds > 0) {
      toast.error(`Please wait ${signupCooldownSeconds} seconds before trying again.`)
      return
    }

    setIsLoading(true)

    try {
      const normalizedName = fullName.trim()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: normalizedName,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: data.user.id,
              full_name: normalizedName,
              role: 'donor',
            },
            { onConflict: 'id' }
          )

        if (profileError && profileError.code !== '42501' && profileError.code !== '42P01') {
          throw profileError
        }
      }

      if (data.session) {
        toast.success('Account created and signed in successfully!')
        router.push('/')
        router.refresh()
      } else {
        toast.success('Account created. Please verify your email, then sign in.')
        setMode('login')
      }
    } catch (error) {
      handleAuthError(error, 'signup')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--accent)/0.25),transparent_45%),radial-gradient(circle_at_bottom_left,hsl(var(--primary)/0.2),transparent_55%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center p-4 sm:p-8">
        <Card className="grid w-full max-w-5xl overflow-hidden border-border/60 bg-card/80 backdrop-blur-sm md:grid-cols-2">
          <div className="hidden flex-col justify-between border-r border-border/60 bg-muted/30 p-8 md:flex">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">BloodLink Portal</p>
              <h1 className="mt-4 text-4xl font-bold leading-tight text-foreground">Secure access for your blood network operations.</h1>
              <p className="mt-4 max-w-sm text-sm text-muted-foreground">
                Monitor donor activity, emergency requests, and hospital stock from one dashboard.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">Demo credentials: admin@bloodlink.com / password123</p>
          </div>

          <div className="p-6 sm:p-10">
            <div className="mb-8 flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{mode === 'login' ? 'Sign in' : 'Create account'}</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/landing">Back to Home</Link>
              </Button>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
              <Button
                type="button"
                variant={mode === 'login' ? 'default' : 'ghost'}
                onClick={() => setMode('login')}
                className="w-full"
              >
                Login
              </Button>
              <Button
                type="button"
                variant={mode === 'signup' ? 'default' : 'ghost'}
                onClick={() => setMode('signup')}
                className="w-full"
              >
                Create Account
              </Button>
            </div>

            <div className="mb-8 space-y-2">
              <h2 className="text-3xl font-bold text-foreground">
                {mode === 'login' ? 'Welcome back' : 'Join BloodLink'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {mode === 'login'
                  ? 'Use your account to continue managing donations.'
                  : 'Create an account to access donation and emergency workflows.'}
              </p>
            </div>

            <form onSubmit={mode === 'login' ? handleSignIn : handleSignUp} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Full Name</label>
                  <Input
                    type="text"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isLoading}
                    className="bg-background"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="bg-background"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Password</label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-background"
                />
              </div>

              <Button
                type="submit"
                disabled={
                  isLoading ||
                  (mode === 'signup' && signupCooldownSeconds > 0) ||
                  !email ||
                  !password ||
                  (mode === 'signup' && !fullName.trim())
                }
                className="mt-2 w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {isLoading
                  ? mode === 'login'
                    ? 'Signing in...'
                    : 'Creating account...'
                  : mode === 'signup' && signupCooldownSeconds > 0
                    ? `Try again in ${signupCooldownSeconds}s`
                  : mode === 'login'
                    ? 'Sign In'
                    : 'Create Account'}
              </Button>
            </form>

            {mode === 'signup' && signupCooldownSeconds > 0 && (
              <p className="mt-3 text-xs text-amber-600">
                Supabase temporarily rate-limited signup requests. Please wait {signupCooldownSeconds} seconds.
              </p>
            )}

            <p className="mt-6 text-xs text-muted-foreground md:hidden">
              Demo credentials: admin@bloodlink.com / password123
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
