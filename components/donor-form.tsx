'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface DonorFormProps {
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export default function DonorForm({ onSubmit, onClose, isLoading }: DonorFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    blood_type: 'O+',
    contact: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      available: true,
      last_donation: null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Add New Donor</CardTitle>
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
              <label className="block text-sm font-medium text-foreground mb-2">Name</label>
              <Input
                type="text"
                placeholder="Enter donor name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-card border-border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Blood Type</label>
              <select
                value={formData.blood_type}
                onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {BLOOD_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Contact</label>
              <Input
                type="tel"
                placeholder="Phone number or email"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                required
                className="bg-card border-border"
              />
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
                {isLoading ? 'Adding...' : 'Add Donor'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
