'use client';

import { useEffect, useState } from 'react';
import { Hospital, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HospitalPanel from '@/components/hospital-panel';
import HospitalStockTable from '@/components/hospital-stock-table';
import AddHospitalModal from '@/components/add-hospital-modal';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface HospitalData {
  id: string;
  name: string;
  location: string;
  phone: string;
  created_at: string;
}

interface BloodStock {
  id: string;
  hospital_id: string;
  blood_type: string;
  quantity: number;
}

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<HospitalData[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<HospitalData | null>(null);
  const [bloodStock, setBloodStock] = useState<BloodStock[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHospitals = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .order('name', { ascending: true });

      if (!error) {
        setHospitals(data || []);
        if (data && data.length > 0 && !selectedHospital) {
          setSelectedHospital(data[0]);
        }
      }
    };

    fetchHospitals();

    const subscription = supabase
      .channel('hospitals_updates')
      .on('*', () => fetchHospitals())
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchBloodStock = async () => {
      if (!selectedHospital) return;

      const { data, error } = await supabase
        .from('blood_stock')
        .select('*')
        .eq('hospital_id', selectedHospital.id);

      if (!error) {
        setBloodStock(data || []);
      }
    };

    fetchBloodStock();

    const subscription = supabase
      .channel(`blood_stock_${selectedHospital?.id}`)
      .on('*', () => fetchBloodStock())
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedHospital]);

  const handleAddHospital = async (data: any) => {
    setLoading(true);
    const { error } = await supabase.from('hospitals').insert([data]);

    if (!error) {
      toast.success('Hospital added successfully');
      setShowAddModal(false);
      // Refresh hospitals
      const { data: newHospitals } = await supabase
        .from('hospitals')
        .select('*')
        .order('name', { ascending: true });
      setHospitals(newHospitals || []);
    } else {
      toast.error('Failed to add hospital');
    }
    setLoading(false);
  };

  const updateBloodQuantity = async (stockId: string, change: number) => {
    const stock = bloodStock.find((s) => s.id === stockId);
    if (!stock) return;

    const newQuantity = Math.max(0, stock.quantity + change);

    const { error } = await supabase
      .from('blood_stock')
      .update({ quantity: newQuantity })
      .eq('id', stockId);

    if (!error) {
      setBloodStock((prev) =>
        prev.map((s) => (s.id === stockId ? { ...s, quantity: newQuantity } : s))
      );
      toast.success(`Blood quantity ${change > 0 ? 'increased' : 'decreased'}`);
    } else {
      toast.error('Failed to update quantity');
    }
  };

  return (
    <main className="p-8">
      <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold flex items-center gap-3 text-foreground">
              <Hospital className="text-accent" size={36} />
              Hospitals
            </h1>
            <p className="text-muted-foreground mt-2">Manage hospital blood inventory</p>
          </div>

          <Button
            onClick={() => setShowAddModal(true)}
            className="mb-6 bg-accent hover:bg-accent/90 text-accent-foreground flex items-center gap-2"
          >
            <Plus size={20} />
            Add Hospital
          </Button>

          {/* Two-panel layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left panel - Hospital list */}
            <HospitalPanel
              hospitals={hospitals}
              selectedHospital={selectedHospital}
              onSelect={setSelectedHospital}
            />

            {/* Right panel - Blood stock */}
            <div className="lg:col-span-2">
              {selectedHospital ? (
                <HospitalStockTable
                  hospital={selectedHospital}
                  bloodStock={bloodStock}
                  onUpdateQuantity={updateBloodQuantity}
                />
              ) : (
                <Card className="border-border">
                  <CardContent className="p-12">
                    <p className="text-center text-muted-foreground">Select a hospital to view blood stock</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Add Hospital Modal */}
          {showAddModal && (
            <AddHospitalModal
              onSubmit={handleAddHospital}
              onClose={() => setShowAddModal(false)}
              isLoading={loading}
            />
          )}
      </div>
    </main>
  );
}
