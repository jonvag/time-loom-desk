import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, User, Mail, Phone, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { errorService } from "@/services/api/errorService";

import { DateTime } from 'luxon';


interface BookingFormProps {
  selectedDate: Date;
  selectedTime: string;
  onBack: () => void;
}

export const BookingForm = ({ selectedDate, selectedTime, onBack }: BookingFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call - will be replaced with n8n webhook
    try {

      const fechaHora = DateTime.fromISO(selectedDate.toISOString ? selectedDate.toISOString() : selectedDate, { zone: 'America/New_York' })
        .set({
          hour: parseInt(selectedTime.split(':')[0]),
          minute: parseInt(selectedTime.split(':')[1]),
          second: 0,
          millisecond: 0,
        });

      const fechaHoraMas30 = fechaHora.plus({ minutes: 30 });

      // Convertir al formato ISO correcto para Google Calendar (ISO 8601 con zona horaria)
      const startDateTime = fechaHora.toISO();       // Ejemplo: "2025-10-19T15:30:00.000-04:00"
      const endDateTime = fechaHoraMas30.toISO();    // Ejemplo: "2025-10-19T16:00:00.000-04:00"


      const payload = {
        ...formData,
        date: startDateTime,
        date30: endDateTime,
        time: selectedTime,
        action: 'create'
      };

      console.log('Booking Data:', payload);
      const response = await errorService.createEvento(payload);

      setIsSuccess(true);
      toast({
        title: "Booking confirmed!",
        description: "You'll receive a confirmation email shortly.",
      });
    } catch (error) {
      toast({
        title: "Booking failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isSuccess) {
    return (
      <Card className="p-8 shadow-card animate-in fade-in-50 duration-500">
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-2">¡Ya está todo listo!</h2>
            <p className="text-muted-foreground">
              Su reunión ha sido programada para
            </p>
          </div>
          <Card className="p-6 bg-secondary">
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="font-semibold">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-semibold">{selectedTime}</span>
              </div>
            </div>
          </Card>
          <p className="text-sm text-muted-foreground">
            Se ha enviado un correo electrónico de confirmación a <strong>{formData.email}</strong>
          </p>
          {/* <Button onClick={() => window.location.reload()} className="gradient-primary shadow-glow">
            Schedule Another Meeting
          </Button> */}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 shadow-card animate-in fade-in-50 duration-500">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Confirmar reunión.</h2>
          <p className="text-muted-foreground">
            Por favor provee los detalles para tu cita.
          </p>
        </div>

        {/* Selected Date & Time */}
        <Card className="p-4 bg-secondary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="font-semibold">{format(selectedDate, 'EEE, MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="font-semibold">{selectedTime}</span>
            </div>
          </div>
        </Card>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Nombre completo
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="John Smith"
              className="bg-secondary border-border transition-smooth focus:shadow-glow"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Dirección de correo electrónico
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="john@example.com"
              className="bg-secondary border-border transition-smooth focus:shadow-glow"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Teléfono
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+1 (555) 000-0000"
              className="bg-secondary border-border transition-smooth focus:shadow-glow"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1"
              disabled={isSubmitting}
            >
              Atrás
            </Button>
            <Button
              type="submit"
              className="flex-1 gradient-primary shadow-glow"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Confirmando..." : "Confirmar reserva"}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};
