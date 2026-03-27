import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "./pages/Login";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import Overview from "./pages/Overview";
import UserManagement from "./pages/UserManagement";
import CreateUser from "./pages/CreateUser";
import EditUser from "./pages/EditUser";
import UserDetail from "./pages/UserDetail";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";
import TaskList from "./pages/tasks/TaskList";
import CreateTask from "./pages/tasks/CreateTask";
import TaskRecoveryAgent from "./pages/tasks/TaskRecoveryAgent";
import TaskRecoveryNonAgent from "./pages/tasks/TaskRecoveryNonAgent";
import ViewSubtasksAgent from "./pages/tasks/ViewSubtasksAgent";
import ViewSubtasksNonAgent from "./pages/tasks/ViewSubtasksNonAgent";
import TaskPersonnelRecovery from "./pages/tasks/TaskPersonnelRecovery";
import AudioDetails from "./pages/tasks/AudioDetails";
import MobileUserList from "./pages/mobile-users/MobileUserList";
import RecorderManagement from "./pages/mobile-users/RecorderManagement";

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
            <Route path="overview" element={<Overview />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="user-management/create" element={<CreateUser />} />
            <Route path="user-management/edit/:id" element={<EditUser />} />
            <Route path="user-management/detail/:id" element={<UserDetail />} />
            <Route path="tasks" element={<TaskList />} />
            <Route path="tasks/create" element={<CreateTask />} />
            <Route path="tasks/:taskId/recovery" element={<TaskRecoveryAgent />} />
            <Route path="tasks/:taskId/recovery-plan" element={<TaskRecoveryNonAgent />} />
            <Route path="tasks/:taskId/recovery/:agentId/subtasks" element={<ViewSubtasksAgent />} />
            <Route path="tasks/:taskId/recovery-plan/:planId/subtasks" element={<ViewSubtasksNonAgent />} />
            <Route path="tasks/:taskId/recovery/:agentId/personnel" element={<TaskPersonnelRecovery />} />
            <Route path="tasks/:taskId/recovery-plan/:planId/personnel" element={<TaskPersonnelRecovery />} />
            <Route path="tasks/:taskId/recovery/:agentId/personnel/:personId/audio" element={<AudioDetails />} />
            <Route path="mobile-users" element={<MobileUserList />} />
            <Route path="mobile-users/:userId/recorders" element={<RecorderManagement />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
