'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, MapPin } from 'lucide-react';

interface Hospital {
  id: string;
  name: string;
  location: string;
  phone: string;
  created_at: string;
}

interface HospitalPanelProps {
  hospitals: Hospital[];
  selectedHospital: Hospital | null;
  onSelect: (hospital: Hospital) => void;
}

export default function HospitalPanel({
  hospitals,
  selectedHospital,
  onSelect,
}: HospitalPanelProps) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg">Hospitals</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {hospitals.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No hospitals</div>
          ) : (
            hospitals.map((hospital) => (
              <button
                key={hospital.id}
                onClick={() => onSelect(hospital)}
                className={`w-full text-left p-4 border-t border-border transition-colors last:border-b ${
                  selectedHospital?.id === hospital.id
                    ? 'bg-accent bg-opacity-20 text-accent'
                    : 'hover:bg-card text-foreground'
                }`}
              >
                <p className="font-semibold">{hospital.name}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <MapPin size={14} />
                  <span>{hospital.location}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Phone size={14} />
                  <span>{hospital.phone}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
