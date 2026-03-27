'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

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

interface EmergencyRequestTableProps {
  requests: EmergencyRequest[];
  onStatusChange: (id: string, newStatus: string) => void;
}

export default function EmergencyRequestTable({
  requests,
  onStatusChange,
}: EmergencyRequestTableProps) {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-500 bg-opacity-20 text-red-400';
      case 'high':
        return 'bg-orange-500 bg-opacity-20 text-orange-400';
      case 'medium':
        return 'bg-yellow-500 bg-opacity-20 text-yellow-400';
      default:
        return 'bg-blue-500 bg-opacity-20 text-blue-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fulfilled':
        return 'bg-green-500 bg-opacity-20 text-green-400';
      case 'cancelled':
        return 'bg-gray-500 bg-opacity-20 text-gray-400';
      default:
        return 'bg-blue-500 bg-opacity-20 text-blue-400';
    }
  };

  return (
    <Card className="border-border">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card">
                <th className="text-left py-4 px-6 font-semibold text-foreground">Hospital</th>
                <th className="text-left py-4 px-6 font-semibold text-foreground">Blood Type</th>
                <th className="text-center py-4 px-6 font-semibold text-foreground">Units</th>
                <th className="text-left py-4 px-6 font-semibold text-foreground">Urgency</th>
                <th className="text-left py-4 px-6 font-semibold text-foreground">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-foreground">Date</th>
                <th className="text-right py-4 px-6 font-semibold text-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No emergency requests
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="border-b border-border hover:bg-card/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-foreground">{request.hospital.name}</td>
                    <td className="py-4 px-6">
                      <span className="inline-block px-3 py-1 rounded-full bg-accent bg-opacity-20 text-accent font-semibold text-xs">
                        {request.blood_type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-semibold text-foreground">{request.units_required}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getUrgencyColor(request.urgency)}`}>
                        {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground">{format(new Date(request.created_at), 'MMM dd, yyyy')}</td>
                    <td className="py-4 px-6 text-right">
                      {request.status === 'pending' && (
                        <div className="flex gap-2 justify-end">
                          <Button
                            onClick={() => onStatusChange(request.id, 'fulfilled')}
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            Fulfill
                          </Button>
                          <Button
                            onClick={() => onStatusChange(request.id, 'cancelled')}
                            size="sm"
                            variant="outline"
                            className="border-border text-red-400 hover:bg-red-500/20"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
