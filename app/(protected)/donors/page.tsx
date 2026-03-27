'use client';

import { useEffect, useState } from 'react';
import { Users, Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DonorTable from '@/components/donor-table';
import DonorForm from '@/components/donor-form';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface Donor {
  id: string;
  name: string;
  blood_type: string;
  contact: string;
  last_donation: string | null;
  available: boolean;
}

export default function DonorsPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<Donor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBloodType, setSelectedBloodType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  useEffect(() => {
    const fetchDonors = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('donors')
        .select('*')
        .order('name', { ascending: true });

      if (!error) {
        setDonors(data || []);
      }
    };

    fetchDonors();

    const supabase = createClient();
    const subscription = supabase
      .channel('donors_updates')
      .on('*', () => fetchDonors())
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let filtered = donors;

    if (searchTerm) {
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.contact.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedBloodType) {
      filtered = filtered.filter((d) => d.blood_type === selectedBloodType);
    }

    setFilteredDonors(filtered);
  }, [donors, searchTerm, selectedBloodType]);

  const handleAddDonor = async (formData: any) => {
    setLoading(true);
    const { error } = await supabase.from('donors').insert([formData]);

    if (!error) {
      toast.success('Donor added successfully');
      setShowForm(false);
      // Refresh donors
      const { data } = await supabase.from('donors').select('*').order('name', { ascending: true });
      setDonors(data || []);
    } else {
      toast.error('Failed to add donor');
    }
    setLoading(false);
  };

  const toggleAvailability = async (id: string, currentAvailable: boolean) => {
    const { error } = await supabase
      .from('donors')
      .update({ available: !currentAvailable })
      .eq('id', id);

    if (!error) {
      toast.success('Donor status updated');
      setDonors((prev) =>
        prev.map((d) => (d.id === id ? { ...d, available: !d.available } : d))
      );
    }
  };

  return (
    <main className="p-8">
      <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold flex items-center gap-3 text-foreground">
              <Users className="text-accent" size={36} />
              Donors
            </h1>
            <p className="text-muted-foreground mt-2">Manage blood donors and availability</p>
          </div>

          {/* Controls */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
                <Input
                  placeholder="Search by name or contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-card border-border"
                />
              </div>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-accent hover:bg-accent/90 text-accent-foreground flex items-center gap-2"
              >
                <Plus size={20} />
                Add Donor
              </Button>
            </div>

            {/* Blood Type Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedBloodType === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedBloodType('')}
                className="bg-card border-border hover:bg-accent/20"
              >
                All
              </Button>
              {BLOOD_TYPES.map((type) => (
                <Button
                  key={type}
                  variant={selectedBloodType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedBloodType(type)}
                  className={selectedBloodType === type ? 'bg-accent text-accent-foreground' : 'bg-card border-border'}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Donor Table */}
          <DonorTable donors={filteredDonors} onToggleAvailability={toggleAvailability} />

          {/* Add Donor Form Modal */}
          {showForm && (
            <DonorForm
              onSubmit={handleAddDonor}
              onClose={() => setShowForm(false)}
              isLoading={loading}
            />
          )}
      </div>
    </main>
  );
}
