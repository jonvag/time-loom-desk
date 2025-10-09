import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface TimeSlotPickerProps {
  onSlotSelect: (date: Date, time: string) => void;
}

// Mock availability data - will be replaced with n8n webhook
const generateMockSlots = (date: Date): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const hours = [9, 10, 11, 13, 14, 15, 16, 17];
  
  hours.forEach(hour => {
    slots.push({
      time: `${hour.toString().padStart(2, '0')}:00`,
      available: Math.random() > 0.3,
    });
    slots.push({
      time: `${hour.toString().padStart(2, '0')}:30`,
      available: Math.random() > 0.3,
    });
  });
  
  return slots;
};

export const TimeSlotPicker = ({ onSlotSelect }: TimeSlotPickerProps) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  const timeSlots = selectedDate ? generateMockSlots(selectedDate) : [];

  const handlePreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
    setSelectedDate(null);
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
    setSelectedDate(null);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    if (selectedDate) {
      onSlotSelect(selectedDate, time);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePreviousWeek}
          className="hover:bg-secondary transition-smooth"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <span className="text-lg font-semibold">
            {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextWeek}
          className="hover:bg-secondary transition-smooth"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Day Selection */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          
          return (
            <Card
              key={day.toISOString()}
              className={`p-4 cursor-pointer transition-smooth hover:shadow-glow ${
                isSelected ? 'bg-primary text-primary-foreground shadow-glow' : 'bg-card hover:bg-secondary'
              }`}
              onClick={() => handleDateSelect(day)}
            >
              <div className="text-center">
                <div className={`text-xs font-medium mb-1 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                  {format(day, 'EEE')}
                </div>
                <div className={`text-2xl font-bold ${isToday && !isSelected ? 'text-primary' : ''}`}>
                  {format(day, 'd')}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="space-y-4 animate-in fade-in-50 duration-300">
          <h3 className="text-lg font-semibold">
            Available times for {format(selectedDate, 'EEEE, MMMM d')}
          </h3>
          
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {timeSlots.map((slot) => (
              <Button
                key={slot.time}
                variant={slot.available ? "outline" : "ghost"}
                disabled={!slot.available}
                onClick={() => handleTimeSelect(slot.time)}
                className={`transition-smooth ${
                  slot.available
                    ? 'hover:bg-primary hover:text-primary-foreground hover:shadow-glow border-border'
                    : 'opacity-30 cursor-not-allowed'
                }`}
              >
                {slot.time}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
