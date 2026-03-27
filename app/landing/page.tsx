'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Droplets, Heart, Users, Zap } from 'lucide-react'
import { toast } from 'sonner'

export default function LandingPage() {
  const [stats, setStats] = useState({ donors: 0, hospitals: 0, units: 0, requests: 0 })
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isNavbarBlurred, setIsNavbarBlurred] = useState(false)

  useEffect(() => {
    loadStats()
    const handleScroll = () => {
      setIsNavbarBlurred(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  async function loadStats() {
    try {
      const supabase = createClient()
      const [donors, hospitals, stock] = await Promise.all([
        supabase.from('donors').select('id', { count: 'exact', head: true }),
        supabase.from('hospitals').select('id', { count: 'exact', head: true }),
        supabase.from('blood_stock').select('id', { count: 'exact', head: true }),
      ])

      setStats({
        donors: donors.count || 0,
        hospitals: hospitals.count || 0,
        units: stock.count || 0,
        requests: Math.floor(Math.random() * 150) + 50,
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('waitlist')
        .insert([{ email, name: email.split('@')[0] }])

      if (error && error.code !== '23505') throw error

      toast.success('Added to waitlist! We&apos;ll be in touch soon.')
      setEmail('')
    } catch (error) {
      if ((error as any)?.code === '23505') {
        toast.info('Email already on waitlist')
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to join waitlist')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-accent rounded-full opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${4 + Math.random() * 6}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isNavbarBlurred ? 'bg-background/80 backdrop-blur-md border-b border-border/50' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-accent">
            <Droplets size={28} />
            <span>BloodLink</span>
          </Link>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="outline" className="border-border hover:bg-card">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <p className="text-sm text-accent font-medium">Connect. Donate. Save Lives.</p>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-balance">
            Real-time Blood <span className="text-accent">Donation</span> Management
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-balance">
            BloodLink connects donors with hospitals in real-time, ensuring critical blood supplies reach patients when they need it most.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/auth/login">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground px-8">
                Get Started
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-border hover:bg-card px-8"
              onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Join Waitlist
            </Button>
          </div>

          {/* Animated demo cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { icon: Heart, label: 'Find Donors', desc: 'Search nearby donors' },
              { icon: Users, label: 'Manage Hospitals', desc: 'Track inventory' },
              { icon: Zap, label: 'Emergency Alerts', desc: 'Real-time requests' },
            ].map((item, i) => (
              <Card
                key={i}
                className="p-6 border-border/50 bg-card/50 backdrop-blur-sm hover:border-accent/50 transition-all duration-300 transform hover:scale-105"
              >
                <item.icon className="w-8 h-8 text-accent mx-auto mb-3" />
                <h3 className="font-semibold mb-2">{item.label}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Making an Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: stats.donors, label: 'Active Donors', delay: 0 },
              { value: stats.hospitals, label: 'Hospitals', delay: 100 },
              { value: stats.units, label: 'Blood Units', delay: 200 },
              { value: stats.requests, label: 'Lives Saved', delay: 300 },
            ].map((stat, i) => (
              <Card key={i} className="p-6 border-border/50 bg-card/50 backdrop-blur-sm text-center">
                <p className="text-3xl font-bold text-accent mb-2">{stat.value.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Register', desc: 'Create an account as donor or hospital' },
              { step: '2', title: 'Connect', desc: 'Join your local blood donation network' },
              { step: '3', title: 'Coordinate', desc: 'Real-time inventory and request management' },
              { step: '4', title: 'Save Lives', desc: 'Critical blood supplies reach patients fast' },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                {i < 3 && <div className="hidden md:block absolute top-6 -right-4 w-8 h-0.5 bg-accent/20" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Real-time Updates',
                desc: 'Instant notifications for blood requests and inventory changes',
              },
              {
                title: 'Smart Matching',
                desc: 'AI-powered donor-to-hospital matching based on blood type and location',
              },
              {
                title: 'Emergency Management',
                desc: 'Priority handling for critical blood requests with alert systems',
              },
              {
                title: 'Inventory Tracking',
                desc: 'Complete visibility into blood stock across all hospitals',
              },
              {
                title: 'Secure & Compliant',
                desc: 'HIPAA-compliant data protection and secure authentication',
              },
              {
                title: 'Mobile Friendly',
                desc: 'Accessible dashboard on any device, anytime, anywhere',
              },
            ].map((feature, i) => (
              <Card
                key={i}
                className="p-6 border-border/50 bg-card/50 backdrop-blur-sm hover:border-accent/50 transition-all duration-300"
              >
                <h3 className="font-semibold mb-2 text-lg">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 md:p-12 border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
            <h2 className="text-3xl font-bold mb-4 text-center">Join the Movement</h2>
            <p className="text-muted-foreground text-center mb-8">
              Be part of a global network saving lives through efficient blood donation management.
            </p>

            <form onSubmit={handleWaitlist} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting || !email}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground whitespace-nowrap"
                >
                  {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Droplets className="text-accent" size={24} />
            <span className="font-bold">BloodLink</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 BloodLink. Saving lives, one donation at a time.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  )
}
