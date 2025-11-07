import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster as HotToaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminPortal from "./pages/AdminPortal";
import UserPortal from "./pages/UserPortal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HotToaster
        position="top-center"
        toastOptions={{
          duration: 3200,
          style: {
            background: 'rgba(15, 23, 42, 0.85)',
            color: '#f8fafc',
            border: '1px solid rgba(14, 116, 144, 0.4)',
            backdropFilter: 'blur(10px)',
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UserPortal />} />
          <Route path="/student" element={<UserPortal />} />
          <Route path="/admin" element={<AdminPortal />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
