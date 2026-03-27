'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/providers/supabase-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets } from 'lucide-react';

const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

interface BloodStock {
  id: string;
  hospital_id: string;
  blood_type: string;
  quantity: number;
  hospital: { name: string };
}

export default function BloodAvailabilityGrid() {
  const supabase = useSupabase();
  const [bloodData, setBloodData] = useState<Map<string, Map<string, number>>>(new Map());
  const [hospitals, setHospitals] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [hospitalRes, stockRes] = await Promise.all([
        supabase.from('hospitals').select('id, name'),
        supabase.from('blood_stock').select('id, hospital_id, blood_type, quantity, hospital:hospitals(name)'),
      ]);

      setHospitals(hospitalRes.data || []);

      // Organize data by hospital and blood type
      const dataMap = new Map<string, Map<string, number>>();
      (stockRes.data || []).forEach((stock: BloodStock) => {
        if (!dataMap.has(stock.hospital_id)) {
          dataMap.set(stock.hospital_id, new Map());
        }
        dataMap.get(stock.hospital_id)!.set(stock.blood_type, stock.quantity);
      });

      setBloodData(dataMap);
    };

    fetchData();

    // Subscribe to blood stock changes
    const subscription = supabase
      .channel('blood_stock_updates')
      .on('*', () => fetchData())
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getColorClass = (quantity: number) => {
    if (quantity === 0) return 'bg-red-500 bg-opacity-20 text-red-400';
    if (quantity < 5) return 'bg-yellow-500 bg-opacity-20 text-yellow-400';
    return 'bg-green-500 bg-opacity-20 text-green-400';
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="text-accent" />
          Blood Availability by Hospital
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Hospital</th>
                {BLOOD_TYPES.map((type) => (
                  <th key={type} className="text-center py-3 px-4 font-semibold text-foreground">
                    {type}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hospitals.map((hospital) => (
                <tr key={hospital.id} className="border-b border-border hover:bg-card">
                  <td className="py-4 px-4 font-medium text-foreground">{hospital.name}</td>
                  {BLOOD_TYPES.map((type) => {
                    const quantity = bloodData.get(hospital.id)?.get(type) || 0;
                    return (
                      <td key={`${hospital.id}-${type}`} className="text-center py-4 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full font-semibold ${getColorClass(quantity)}`}>
                          {quantity}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
