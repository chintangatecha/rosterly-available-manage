
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

const DailyView: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily View (Coming Soon)</CardTitle>
        <CardDescription>
          This view will allow you to set your availability on a calendar interface.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center py-12">
        <div className="text-center text-muted-foreground">
          <Calendar size={48} className="mx-auto mb-4 text-primary/40" />
          <p>Daily calendar view is coming soon!</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyView;
