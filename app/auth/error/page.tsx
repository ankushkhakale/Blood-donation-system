'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'Authentication Error'

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">Authentication Error</CardTitle>
              <CardDescription className="text-center">
                Something went wrong with your authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                <div className="text-sm text-muted-foreground bg-muted p-4 rounded-md break-words">
                  {error}
                </div>
                <div className="flex gap-3">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/login">
                      Back to Login
                    </Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/auth/sign-up">
                      Create Account
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
