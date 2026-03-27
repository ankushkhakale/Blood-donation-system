'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface Hospital {
  id: string;
  name: string;
}

interface EmergencyRequestFormProps {
  hospitals: Hospital[];
  bloodTypes: string[];
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

export default function EmergencyRequestForm({
  hospitals,
  bloodTypes,
  onSubmit,
  onClose,
  isLoading,
}: EmergencyRequestFormProps) {
  const [formData, setFormData] = useState({
    hospital_id: hospitals[0]?.id || '',
    blood_type: 'O+',
    units_required: 5,
    urgency: 'high',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      status: 'pending',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Create Emergency Request</CardTitle>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Hospital</label>
              <select
                value={formData.hospital_id}
                onChange={(e) => setFormData({ ...formData, hospital_id: e.target.value })}
                className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                required
              >
                <option value="">Select a hospital</option>
                {hospitals.map((hospital) => (
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Blood Type</label>
              <select
                value={formData.blood_type}
                onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {bloodTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Units Required</label>
              <Input
                type="number"
                min="1"
                max="100"
                value={formData.units_required}
                onChange={(e) => setFormData({ ...formData, units_required: parseInt(e.target.value) })}
                required
                className="bg-card border-border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Urgency</label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                disabled={isLoading}
                className="flex-1 border-border hover:bg-card"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {isLoading ? 'Creating...' : 'Create Request'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
