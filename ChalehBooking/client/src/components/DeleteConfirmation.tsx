import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: number;
  onDeleted: () => void;
}

export default function DeleteConfirmation({ isOpen, onClose, bookingId, onDeleted }: DeleteConfirmationProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Delete booking mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/bookings/${bookingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: "تم إلغاء الحجز",
        description: "تم إلغاء الحجز بنجاح",
      });
      onDeleted();
    },
    onError: (error) => {
      toast({
        title: "حدث خطأ",
        description: `فشل إلغاء الحجز: ${error.message}`,
        variant: "destructive",
      });
      onClose();
    },
  });
  
  const handleConfirmDelete = () => {
    deleteMutation.mutate();
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-3xl"></i>
          </div>
          <AlertDialogTitle className="text-xl font-bold mb-2 text-center">
            تأكيد إلغاء الحجز
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            هل أنت متأكد من رغبتك في إلغاء هذا الحجز؟ هذا الإجراء لا يمكن التراجع عنه.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-center space-x-4 space-x-reverse">
          <AlertDialogAction 
            onClick={handleConfirmDelete}
            className="bg-red-600 hover:bg-red-700"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري الإلغاء...
              </span>
            ) : (
              'نعم، إلغاء الحجز'
            )}
          </AlertDialogAction>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
