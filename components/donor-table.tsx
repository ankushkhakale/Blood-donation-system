'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface Donor {
  id: string;
  name: string;
  blood_type: string;
  contact: string;
  last_donation: string | null;
  available: boolean;
}

interface DonorTableProps {
  donors: Donor[];
  onToggleAvailability: (id: string, currentAvailable: boolean) => void;
}

export default function DonorTable({ donors, onToggleAvailability }: DonorTableProps) {
  return (
    <Card className="border-border">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card">
                <th className="text-left py-4 px-6 font-semibold text-foreground">Name</th>
                <th className="text-left py-4 px-6 font-semibold text-foreground">Blood Type</th>
                <th className="text-left py-4 px-6 font-semibold text-foreground">Contact</th>
                <th className="text-left py-4 px-6 font-semibold text-foreground">Last Donation</th>
                <th className="text-left py-4 px-6 font-semibold text-foreground">Status</th>
                <th className="text-right py-4 px-6 font-semibold text-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {donors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No donors found
                  </td>
                </tr>
              ) : (
                donors.map((donor) => (
                  <tr key={donor.id} className="border-b border-border hover:bg-card/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-foreground">{donor.name}</td>
                    <td className="py-4 px-6">
                      <span className="inline-block px-3 py-1 rounded-full bg-accent bg-opacity-20 text-accent font-semibold text-xs">
                        {donor.blood_type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground">{donor.contact}</td>
                    <td className="py-4 px-6 text-muted-foreground">
                      {donor.last_donation
                        ? format(new Date(donor.last_donation), 'MMM dd, yyyy')
                        : 'Never'}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          donor.available
                            ? 'bg-green-500 bg-opacity-20 text-green-400'
                            : 'bg-gray-500 bg-opacity-20 text-gray-400'
                        }`}
                      >
                        {donor.available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        onClick={() => onToggleAvailability(donor.id, donor.available)}
                        size="sm"
                        variant="outline"
                        className="border-border hover:bg-accent/20"
                      >
                        {donor.available ? 'Mark Unavailable' : 'Mark Available'}
                      </Button>
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
