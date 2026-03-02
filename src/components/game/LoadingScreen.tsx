 "use client";

 import { Card, CardContent } from "@/components/ui/pixelact-ui";

 interface LoadingScreenProps {
   message?: string;
 }

 export function LoadingScreen({ message }: LoadingScreenProps) {
   return (
     <div className="flex min-h-screen items-center justify-center px-4">
       <Card>
         <CardContent className="flex flex-col items-center gap-4 px-6 py-4">
           <p className="pixel-font text-xs text-muted-foreground">
             {message ?? "Загрузка..."}
           </p>
           <div className="loading-bar w-48 max-w-full">
             <div className="loading-bar-track">
               <div className="loading-bar-fill" />
             </div>
           </div>
         </CardContent>
       </Card>
     </div>
   );
 }

