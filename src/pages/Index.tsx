import { useState } from "react";
import { TimeSlotPicker } from "@/components/TimeSlotPicker";
import { BookingForm } from "@/components/BookingForm";
import { CalendarDays } from "lucide-react";

const Index = () => {
  const [bookingStep, setBookingStep] = useState<"selection" | "form">("selection");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");

  const handleSlotSelect = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setBookingStep("form");
  };

  const handleBack = () => {
    setBookingStep("selection");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Agendar cita</h1>
              <p className="text-sm text-muted-foreground">Consultar disponibilidad</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {bookingStep === "selection" ? (
          <div className="space-y-8">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <h2 className="text-4xl font-bold">Elegir fecha</h2>
              <p className="text-lg text-muted-foreground">
                Selecciona el día y la hora que mejor te convengan para tu cita.
              </p>
            </div>
            <TimeSlotPicker onSlotSelect={handleSlotSelect} />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <BookingForm
              selectedDate={selectedDate!}
              selectedTime={selectedTime}
              onBack={handleBack}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-24">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Realizado por nex-gen 🧑‍💻</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
