'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { createClient } from '@supabase/supabase-js';
import { AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EmergencyRequestForm from '@/components/emergency-request-form';
import EmergencyRequestTable from '@/components/emergency-request-table';
import { toast } from 'sonner';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface EmergencyRequest {
  id: string;
  hospital_id: string;
  blood_type: string;
  units_required: number;
  urgency: string;
  status: string;
  created_at: string;
  hospital: { name: string };
}

interface Hospital {
  id: string;
  name: string;
}

export default function EmergencyPage() {
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedUrgency, setSelectedUrgency] = useState('all');

  const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  useEffect(() => {
    const fetchData = async () => {
      const [requestsRes, hospitalsRes] = await Promise.all([
        supabase
          .from('emergency_requests')
          .select('id, hospital_id, blood_type, units_required, urgency, status, created_at, hospital:hospitals(name)')
          .order('created_at', { ascending: false }),
        supabase.from('hospitals').select('id, name').order('name', { ascending: true }),
      ]);

      setRequests(requestsRes.data || []);
      setHospitals(hospitalsRes.data || []);
    };

    fetchData();

    const requestSub = supabase
      .channel('emergency_requests_updates')
      .on('*', () => fetchData())
      .subscribe();

    return () => {
      requestSub.unsubscribe();
    };
  }, []);

  const filteredRequests = requests.filter((req) => {
    const statusMatch = selectedStatus === 'all' || req.status === selectedStatus;
    const urgencyMatch = selectedUrgency === 'all' || req.urgency === selectedUrgency;
    return statusMatch && urgencyMatch;
  });

  const handleAddRequest = async (formData: any) => {
    setLoading(true);
    const { error } = await supabase.from('emergency_requests').insert([formData]);

    if (!error) {
      toast.success('Emergency request created successfully');
      setShowForm(false);
      // Refresh requests
      const { data } = await supabase
        .from('emergency_requests')
        .select('id, hospital_id, blood_type, units_required, urgency, status, created_at, hospital:hospitals(name)')
        .order('created_at', { ascending: false });
      setRequests(data || []);
    } else {
      toast.error('Failed to create request');
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('emergency_requests')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      toast.success(`Request marked as ${newStatus}`);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    } else {
      toast.error('Failed to update request');
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 lg:ml-0">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold flex items-center gap-3 text-foreground">
              <AlertCircle className="text-accent" size={36} />
              Emergency Requests
            </h1>
            <p className="text-muted-foreground mt-2">Manage critical blood supply needs</p>
          </div>

          <Button
            onClick={() => setShowForm(true)}
            className="mb-6 bg-accent hover:bg-accent/90 text-accent-foreground flex items-center gap-2"
          >
            <Plus size={20} />
            Create Request
          </Button>

          {/* Filters */}
          <div className="mb-6 space-y-3">
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Status:</p>
              <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'fulfilled', 'cancelled'].map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={selectedStatus === status ? 'default' : 'outline'}
                    onClick={() => setSelectedStatus(status)}
                    className={
                      selectedStatus === status
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-card border-border'
                    }
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-2">Urgency:</p>
              <div className="flex flex-wrap gap-2">
                {['all', 'low', 'medium', 'high', 'critical'].map((urgency) => (
                  <Button
                    key={urgency}
                    size="sm"
                    variant={selectedUrgency === urgency ? 'default' : 'outline'}
                    onClick={() => setSelectedUrgency(urgency)}
                    className={
                      selectedUrgency === urgency
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-card border-border'
                    }
                  >
                    {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Requests Table */}
          <EmergencyRequestTable
            requests={filteredRequests}
            onStatusChange={handleUpdateStatus}
          />

          {/* Create Request Form Modal */}
          {showForm && (
            <EmergencyRequestForm
              hospitals={hospitals}
              bloodTypes={BLOOD_TYPES}
              onSubmit={handleAddRequest}
              onClose={() => setShowForm(false)}
              isLoading={loading}
            />
          )}
        </div>
      </main>
    </div>
  );
}
