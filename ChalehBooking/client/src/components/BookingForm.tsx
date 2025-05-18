import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { formatDisplayDate } from '@/lib/utils/dateUtils';
import { insertBookingSchema, BookingResponse } from '@shared/schema';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  editBooking: BookingResponse | null;
  existingBookings: BookingResponse[];
  initialPeriod: 'morning' | 'evening' | 'both' | null;
}

const formSchema = insertBookingSchema.extend({
  period: z.enum(['morning', 'evening', 'both']),
  customerName: z.string().min(2, { message: "الاسم مطلوب" }),
  customerPhone: z.string().min(9, { message: "رقم الهاتف مطلوب ويجب أن يكون صحيحًا" }),
  amountPaid: z.number().min(0, { message: "المبلغ المدفوع يجب أن يكون صفر أو أكثر" }),
  amountRemaining: z.number().min(0, { message: "المبلغ المتبقي يجب أن يكون صفر أو أكثر" }),
  peopleCount: z.number().min(1, { message: "عدد الأشخاص يجب أن يكون 1 على الأقل" }).max(60, { message: "الحد الأقصى لعدد الأشخاص هو 60" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function BookingForm({ isOpen, onClose, selectedDate, editBooking, existingBookings, initialPeriod }: BookingFormProps) {
  const [availablePeriods, setAvailablePeriods] = useState<('morning' | 'evening' | 'both')[]>(['morning', 'evening', 'both']);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bookingDate: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
      period: 'morning',
      customerName: '',
      customerPhone: '',
      amountPaid: 0,
      amountRemaining: 0,
      peopleCount: 1,
    },
  });

  // Create booking mutation
  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await apiRequest("POST", "/api/bookings", values);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: "تم الحجز بنجاح",
        description: "تم إضافة الحجز الجديد بنجاح",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "حدث خطأ",
        description: `فشل إنشاء الحجز: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update booking mutation
  const updateMutation = useMutation({
    mutationFn: async (values: FormValues & { id: number }) => {
      const { id, ...updateData } = values;
      const response = await apiRequest("PATCH", `/api/bookings/${id}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: "تم تحديث الحجز",
        description: "تم تحديث بيانات الحجز بنجاح",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "حدث خطأ",
        description: `فشل تحديث الحجز: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update form values when editing an existing booking or initializing with a period
  useEffect(() => {
    if (editBooking) {
      form.reset({
        bookingDate: editBooking.bookingDate,
        period: editBooking.period as 'morning' | 'evening' | 'both',
        customerName: editBooking.customerName,
        customerPhone: editBooking.customerPhone,
        amountPaid: editBooking.amountPaid,
        amountRemaining: editBooking.amountRemaining,
        peopleCount: editBooking.peopleCount,
      });
    } else if (selectedDate) {
      form.reset({
        bookingDate: selectedDate.toISOString().split('T')[0],
        period: initialPeriod || 'morning',
        customerName: '',
        customerPhone: '',
        amountPaid: 0,
        amountRemaining: 0,
        peopleCount: 1,
      });
    }
  }, [editBooking, selectedDate, form, initialPeriod]);

  // Determine available periods based on existing bookings
  useEffect(() => {
    if (!selectedDate || !isOpen) return;

    // Filter out periods that are already booked
    const bookedPeriods = existingBookings
      .filter(booking => booking.id !== editBooking?.id) // Exclude the booking being edited
      .map(booking => booking.period);

    const hasMorningBooking = bookedPeriods.includes('morning') || bookedPeriods.includes('both');
    const hasEveningBooking = bookedPeriods.includes('evening') || bookedPeriods.includes('both');
    const hasBothBooking = bookedPeriods.includes('both');

    let available: ('morning' | 'evening' | 'both')[] = [];

    if (!hasMorningBooking && !hasEveningBooking) {
      available = ['morning', 'evening', 'both'];
    } else if (!hasMorningBooking && hasEveningBooking) {
      available = ['morning'];
    } else if (hasMorningBooking && !hasEveningBooking) {
      available = ['evening'];
    } else {
      available = [];
    }

    setAvailablePeriods(available);

    // If the current selected period is not available, select the first available one
    const currentPeriod = form.getValues('period');
    if (!available.includes(currentPeriod) && available.length > 0) {
      form.setValue('period', available[0]);
    }
  }, [selectedDate, existingBookings, isOpen, editBooking, form]);

  // Handle form submission
  const onSubmit = (values: FormValues) => {
    if (editBooking) {
      updateMutation.mutate({ ...values, id: editBooking.id });
    } else {
      createMutation.mutate(values);
    }
  };

  // If there are no available periods and we're not editing, show a message
  const noPeriodsAvailable = availablePeriods.length === 0 && !editBooking;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>{editBooking ? 'تعديل الحجز' : 'حجز جديد'}</DialogTitle>
        </DialogHeader>

        <div className="mb-6">
          <h4 className="font-bold mb-2">
            التاريخ: <span className="font-normal">{selectedDate && formatDisplayDate(selectedDate)}</span>
          </h4>
        </div>

        {noPeriodsAvailable ? (
          <div className="text-center p-4 text-red-500">
            عذرًا، هذا اليوم محجوز بالكامل. الرجاء اختيار يوم آخر.
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>الفترة</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4 space-x-reverse"
                      >
                        {availablePeriods.includes('morning') && (
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value="morning" id="morning" />
                            <Label htmlFor="morning">
                              <i className="fas fa-sun text-amber-500 ml-1"></i>
                              فترة صباحية
                            </Label>
                          </div>
                        )}
                        {availablePeriods.includes('evening') && (
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value="evening" id="evening" />
                            <Label htmlFor="evening">
                              <i className="fas fa-moon text-indigo-500 ml-1"></i>
                              فترة مسائية
                            </Label>
                          </div>
                        )}
                        {availablePeriods.includes('both') && (
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value="both" id="both" />
                            <Label htmlFor="both">الفترتين</Label>
                          </div>
                        )}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم المستأجر</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهاتف</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amountPaid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المبلغ المدفوع (دينار)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amountRemaining"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المبلغ المتبقي (دينار)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="peopleCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عدد الأشخاص</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        max={60} 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500 mt-1">الحد الأقصى 60 شخص</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="flex justify-between pt-4">
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      جاري الحفظ...
                    </span>
                  ) : (
                    'حفظ الحجز'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={onClose}
                >
                  إلغاء
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
