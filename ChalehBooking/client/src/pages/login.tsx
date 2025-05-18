import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if the password matches the predefined password
    if (password === '0787648525') {
      // Store authentication in session storage
      sessionStorage.setItem('isAuthenticated', 'true');
      
      // Navigate to home page
      setLocation('/');
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحبًا بك في نظام حجز الشاليه",
      });
    } else {
      setError(true);
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "رمز المرور غير صحيح. الرجاء المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex items-center justify-center font-cairo" dir="rtl">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600 mb-2">نظام حجز الشاليه</h1>
          <p className="text-gray-600">الرجاء إدخال رمز المرور للدخول إلى النظام</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              رمز المرور
            </label>
            <Input
              id="password"
              type="password"
              placeholder="أدخل رمز المرور"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className={error ? "border-red-500" : ""}
            />
            {error && (
              <p className="text-red-500 text-sm">رمز المرور غير صحيح</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            تسجيل الدخول
          </Button>
        </form>
      </div>
    </div>
  );
}