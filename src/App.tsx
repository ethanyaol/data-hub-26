import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "./pages/Login";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import UserManagement from "./pages/UserManagement";
import CreateUser from "./pages/CreateUser";
import EditUser from "./pages/EditUser";
import UserDetail from "./pages/UserDetail";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="user-management/create" element={<CreateUser />} />
            <Route path="user-management/edit/:id" element={<EditUser />} />
            <Route path="user-management/detail/:id" element={<UserDetail />} />
            <Route path="tasks" element={<ComingSoon />} />
            <Route path="mobile-users" element={<ComingSoon />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
