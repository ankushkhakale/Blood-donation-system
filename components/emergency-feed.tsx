'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

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

export default function EmergencyFeed() {
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('emergency_requests')
        .select('id, hospital_id, blood_type, units_required, urgency, status, created_at, hospital:hospitals(name)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error) {
        setRequests(data || []);
      }
    };

    fetchRequests();

    // Subscribe to changes
    const supabase = createClient();
    const subscription = supabase
      .channel('emergency_updates')
      .on('*', () => fetchRequests())
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const markFulfilled = async (id: string) => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('emergency_requests')
      .update({ status: 'fulfilled' })
      .eq('id', id);

    if (!error) {
      toast.success('Emergency request marked as fulfilled');
      setRequests((prev) => prev.filter((req) => req.id !== id));
    } else {
      toast.error('Failed to update request');
    }
    setLoading(false);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-500 text-red-950';
      case 'high':
        return 'bg-orange-500 text-orange-950';
      case 'medium':
        return 'bg-yellow-500 text-yellow-950';
      default:
        return 'bg-blue-500 text-blue-950';
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="text-accent" />
          Recent Emergency Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No emergency requests at this time</p>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{request.hospital.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {request.blood_type} • {request.units_required} units
                  </p>
                  <div className="mt-2 flex gap-2">
                    <span className={`inline-block text-xs font-bold px-2 py-1 rounded ${getUrgencyColor(request.urgency)}`}>
                      {request.urgency.toUpperCase()}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => markFulfilled(request.id)}
                  disabled={loading}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  Mark Fulfilled
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
