import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, addDays, startOfWeek, isSameDay, parse, isWithinInterval } from "date-fns";
import { errorService } from "@/services/api/errorService";
import { useToast } from "@/components/ui/use-toast";

import { DateTime } from 'luxon';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  timeZone: string;
  creator: string;
  created: string;
}

interface TimeSlotPickerProps {
  onSlotSelect: (date: Date, time: string) => void;
}

export const TimeSlotPicker = ({ onSlotSelect }: TimeSlotPickerProps) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState<boolean>(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { toast } = useToast();

  // Función para verificar si un slot está ocupado
  const isSlotOccupied = (date: Date, time: string): boolean => {
    // Crear el objeto Date completo para el slot
    const [hours, minutes] = time.split(':').map(Number);
    const slotStart = new Date(date);
    slotStart.setHours(hours, minutes, 0, 0);

    const slotEnd = new Date(slotStart);
    slotEnd.setHours(hours, minutes + 30, 0, 0); // Slots de 30 minutos

    // Verificar si hay algún evento que se superponga con este slot
    return calendarEvents.some(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      // Verificar superposición
      const overlaps =
        (slotStart >= eventStart && slotStart < eventEnd) ||
        (slotEnd > eventStart && slotEnd <= eventEnd) ||
        (slotStart <= eventStart && slotEnd >= eventEnd);

      return overlaps;
    });
  };


const fetchTimeSlots = async (date: Date): Promise<TimeSlot[]> => {
  try {
    // Obtener eventos del calendario
    const day = DateTime.fromISO(date.toISOString(), { zone: 'America/New_York' });

    const afterDate = day.startOf('day').toISO();
    const beforeDate = day.endOf('day').toISO();

    const payload = {
      fecha_start: afterDate,
      fecha_end: beforeDate,
      action: 'getAvailable',
      status: 'active',
    };

    const response = await errorService.getAvailable(payload);
    const events: CalendarEvent[] = response.data;

    console.log("Eventos del calendario:", events);
    setCalendarEvents(events);

    // Función para determinar si un slot horario está ocupado
    const isSlotOccupied = (date: Date, time: string): boolean => {
      const slotDateTime = DateTime.fromJSDate(date, { zone: 'America/New_York' })
        .set({
          hour: parseInt(time.split(':')[0]),
          minute: parseInt(time.split(':')[1]),
          second: 0,
          millisecond: 0,
        });

      return events.some(event => {
        const eventStart = DateTime.fromISO(event.start, { zone: 'America/New_York' });
        const eventEnd = DateTime.fromISO(event.end, { zone: 'America/New_York' });

        // El slot está ocupado si comienza dentro de un evento existente
        return slotDateTime >= eventStart && slotDateTime < eventEnd;
      });
    };

    // Generar slots basados en la disponibilidad
    const slots: TimeSlot[] = [];
    const hours = [9, 10, 11, 13, 14, 15, 16, 17];

    hours.forEach(hour => {
      // Slot de hora en punto (ej: 09:00)
      const fullHourSlot = `${hour.toString().padStart(2, '0')}:00`;
      const fullHourAvailable = !isSlotOccupied(date, fullHourSlot);

      slots.push({
        time: fullHourSlot,
        available: fullHourAvailable,
      });

      // Slot de media hora (ej: 09:30)
      const halfHourSlot = `${hour.toString().padStart(2, '0')}:30`;
      const halfHourAvailable = !isSlotOccupied(date, halfHourSlot);

      slots.push({
        time: halfHourSlot,
        available: halfHourAvailable,
      });
    });

    console.log("Slots generados para", day.toFormat('yyyy-MM-dd'), ":", slots);
    return slots;

  } catch (error) {
    console.error("Error fetching calendar events:", error);
    // En caso de error, retornar slots todos disponibles
    return generateFallbackSlots();
  }
};


  const generateFallbackSlots = (): TimeSlot[] => {
    // 2. Llamar a la función toast() para emitir el error
    toast({
      title: "Error de Conexión",
      description: "No se pudieron cargar los eventos del calendario.",
      variant: "destructive", // Usa el estilo de error/rojo
      duration: 5000,
    });

    const slots: TimeSlot[] = [];
    return slots;
  };

  // Cargar slots cuando se selecciona una fecha
  useEffect(() => {
    if (selectedDate) {
      const loadSlots = async () => {
        setSlotsLoading(true);
        try {
          const slots = await fetchTimeSlots(selectedDate);
          setTimeSlots(slots);
        } catch (error) {
          console.error("Error cargando slots:", error);
          // Usar slots de respaldo
          setTimeSlots(generateFallbackSlots());
        } finally {
          setSlotsLoading(false);
        }
      };

      loadSlots();
    } else {
      setTimeSlots([]);
    }
  }, [selectedDate]);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

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

  // Contadores para mostrar información
  const availableSlots = timeSlots.filter(slot => slot.available).length;
  const totalSlots = timeSlots.length;

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
              className={`p-4 cursor-pointer transition-smooth hover:shadow-glow ${isSelected ? 'bg-primary text-primary-foreground shadow-glow' : 'bg-card hover:bg-secondary'
                }`}
              onClick={() => handleDateSelect(day)}
            >
              <div className="text-center">
                <div className={`text-xs font-medium mb-1 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`}>
                  {format(day, 'EEE')}
                </div>
                <div className={`text-2xl font-bold ${isToday && !isSelected ? 'text-primary' : ''
                  }`}>
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
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Bloques disponibles para {format(selectedDate, 'EEEE, MMMM d')}
            </h3>
            {!slotsLoading && totalSlots > 0 && (
              <span className="text-sm text-muted-foreground">
                {availableSlots} de {totalSlots} bloques disponibles
              </span>
            )}
          </div>

          {slotsLoading ? (
            <div className="text-center py-8">
              <p>Chequeando disponibilidad...</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {timeSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={slot.available ? "outline" : "ghost"}
                  disabled={!slot.available}
                  onClick={() => handleTimeSelect(slot.time)}
                  className={`transition-smooth ${slot.available
                    ? 'hover:bg-primary hover:text-primary-foreground hover:shadow-glow border-border border-green-200'
                    : 'border-border border-gray-500 cursor-not-allowed text-gray-300'
                    }`}
                >
                  <div className="flex flex-col items-center">
                    <span>{slot.time}</span>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};