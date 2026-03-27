'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Droplets, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/stat-card';
import BloodAvailabilityGrid from '@/components/blood-availability-grid';
import EmergencyFeed from '@/components/emergency-feed';
import { useSupabase } from '@/providers/supabase-provider';

export default function Dashboard() {
  const supabase = useSupabase();
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalHospitals: 0,
    totalBloodUnits: 0,
    emergencyRequests: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [donorsRes, hospitalsRes, bloodRes, emergencyRes] = await Promise.all([
        supabase.from('donors').select('*', { count: 'exact', head: true }),
        supabase.from('hospitals').select('*', { count: 'exact', head: true }),
        supabase.from('blood_stock').select('quantity'),
        supabase.from('emergency_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      const totalUnits = (bloodRes.data || []).reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);

      setStats({
        totalDonors: donorsRes.count || 0,
        totalHospitals: hospitalsRes.count || 0,
        totalBloodUnits: totalUnits,
        emergencyRequests: emergencyRes.count || 0,
      });
    };

    fetchStats();

    // Subscribe to changes
    const donorSub = supabase
      .channel('donors')
      .on('*', () => fetchStats())
      .subscribe();

    const hospitalSub = supabase
      .channel('hospitals')
      .on('*', () => fetchStats())
      .subscribe();

    const bloodSub = supabase
      .channel('blood_stock')
      .on('*', () => fetchStats())
      .subscribe();

    const emergencySub = supabase
      .channel('emergency_requests')
      .on('*', () => fetchStats())
      .subscribe();

    return () => {
      donorSub.unsubscribe();
      hospitalSub.unsubscribe();
      bloodSub.unsubscribe();
      emergencySub.unsubscribe();
    };
  }, []);

  return (
    <main className="p-8 max-w-7xl mx-auto">
        <div>
          <div className="mb-8">
            <h1 className="text-4xl font-bold flex items-center gap-3 text-foreground">
              <Droplets className="text-accent" size={36} />
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">Real-time blood donation management</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Donors" value={stats.totalDonors} icon={BarChart3} />
            <StatCard label="Active Hospitals" value={stats.totalHospitals} icon={BarChart3} />
            <StatCard label="Blood Units" value={stats.totalBloodUnits} icon={Droplets} />
            <StatCard label="Emergency Requests" value={stats.emergencyRequests} icon={AlertCircle} />
          </div>

          {/* Blood Availability Grid */}
          <BloodAvailabilityGrid />

          {/* Emergency Feed */}
          <div className="mt-8">
            <EmergencyFeed />
          </div>
        </div>
    </main>
  );
}
