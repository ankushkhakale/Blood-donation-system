'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';

interface Hospital {
  id: string;
  name: string;
  location: string;
  phone: string;
}

interface BloodStock {
  id: string;
  hospital_id: string;
  blood_type: string;
  quantity: number;
}

interface HospitalStockTableProps {
  hospital: Hospital;
  bloodStock: BloodStock[];
  onUpdateQuantity: (stockId: string, change: number) => void;
}

const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export default function HospitalStockTable({
  hospital,
  bloodStock,
  onUpdateQuantity,
}: HospitalStockTableProps) {
  const getColorClass = (quantity: number) => {
    if (quantity === 0) return 'bg-red-500 text-red-950';
    if (quantity < 5) return 'bg-yellow-500 text-yellow-950';
    return 'bg-green-500 text-green-950';
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>{hospital.name} - Blood Stock</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {BLOOD_TYPES.map((type) => {
            const stock = bloodStock.find((s) => s.blood_type === type);
            const quantity = stock?.quantity || 0;

            return (
              <div key={type} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                <div>
                  <p className="font-semibold text-foreground">{type}</p>
                  <p className={`text-sm font-bold px-2 py-1 rounded-full inline-block mt-2 ${getColorClass(quantity)}`}>
                    {quantity} units
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => stock && onUpdateQuantity(stock.id, -1)}
                    disabled={quantity === 0}
                    size="sm"
                    variant="outline"
                    className="border-border hover:bg-red-500/20 text-red-400 disabled:opacity-50"
                  >
                    <Minus size={16} />
                  </Button>
                  <Button
                    onClick={() => stock && onUpdateQuantity(stock.id, 1)}
                    size="sm"
                    variant="outline"
                    className="border-border hover:bg-green-500/20 text-green-400"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
