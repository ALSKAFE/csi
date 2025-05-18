import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ChaletSidebar() {
  return (
    <div className="space-y-4">
      {/* Info Card */}
      <Card>
        <CardContent className="p-5">
          <CardTitle className="text-lg font-bold mb-3">معلومات الحجز</CardTitle>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between pb-2 border-b border-gray-100">
              <span className="text-gray-600">فترة الحجز:</span>
              <span className="font-medium">صباحي / مسائي</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-gray-100">
              <span className="text-gray-600">ساعات الفترة الصباحية:</span>
              <span className="font-medium">8:00 ص - 3:00 م</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-gray-100">
              <span className="text-gray-600">ساعات الفترة المسائية:</span>
              <span className="font-medium">4:00 م - 11:00 م</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-gray-100">
              <span className="text-gray-600">الحد الأقصى للأشخاص:</span>
              <span className="font-medium">8 أشخاص</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">التأمين:</span>
              <span className="font-medium">200 ريال (مسترد)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend Card */}
      <Card>
        <CardContent className="p-5">
          <CardTitle className="text-lg font-bold mb-3">دليل الألوان</CardTitle>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-6 h-6 rounded bg-white border border-gray-200 ml-3"></div>
              <span>متاح للحجز</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded bg-green-100 border border-gray-200 ml-3"></div>
              <span>فترة واحدة محجوزة</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded bg-green-300 border border-gray-200 ml-3"></div>
              <span>الفترتين محجوزتين</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chalet Gallery Card */}
      <Card>
        <CardContent className="p-5">
          <CardTitle className="text-lg font-bold mb-3">صور الشاليه</CardTitle>
          <div className="grid grid-cols-2 gap-2">
            {/* Using CDN images as per instructions */}
            <img 
              src="https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200" 
              alt="داخل الشاليه" 
              className="rounded-lg h-20 w-full object-cover" 
            />
            <img 
              src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200" 
              alt="إطلالة الشاليه" 
              className="rounded-lg h-20 w-full object-cover" 
            />
            <img 
              src="https://images.unsplash.com/photo-1542718610-a1d656d1884c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200" 
              alt="مطبخ الشاليه" 
              className="rounded-lg h-20 w-full object-cover" 
            />
            <img 
              src="https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200" 
              alt="غرفة النوم" 
              className="rounded-lg h-20 w-full object-cover" 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
