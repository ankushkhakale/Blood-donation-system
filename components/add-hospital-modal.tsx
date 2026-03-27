'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface AddHospitalModalProps {
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

export default function AddHospitalModal({ onSubmit, onClose, isLoading }: AddHospitalModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Add New Hospital</CardTitle>
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
              <label className="block text-sm font-medium text-foreground mb-2">Hospital Name</label>
              <Input
                type="text"
                placeholder="Enter hospital name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-card border-border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Location</label>
              <Input
                type="text"
                placeholder="Enter location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                className="bg-card border-border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
              <Input
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                {isLoading ? 'Adding...' : 'Add Hospital'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
