import { Switch, Route, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/use-auth';
import { StudentsProvider } from '@/hooks/use-students';
import { SnackbarProvider } from '@/components/snackbar';
import { AuthGuard } from '@/components/auth-guard';
import { BottomNav } from '@/components/bottom-nav';
import { SubscriptionGuard } from '@/components/subscription-guard';

import Dashboard from '@/pages/dashboard';
import StudentsPage from '@/pages/students';
import AddStudentPage from '@/pages/add-student';
import SeatsPage from '@/pages/seats';
import RemindersPage from '@/pages/reminders';
import BillingPage from '@/pages/billing';
import TrialPage from '@/pages/trial';
import LoginPage from '@/pages/login';
import SignUpPage from '@/pages/auth';
import AuthCallbackPage from '@/pages/auth-callback';
import PrivacyPage from '@/pages/privacy';
import TermsPage from '@/pages/terms';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60 * 1000 } }
});

function AppRoutes() {
  return (
    <>
      <SubscriptionGuard>
        <BottomNav />
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/students" component={StudentsPage} />
          <Route path="/add" component={AddStudentPage} />
          <Route path="/seats" component={SeatsPage} />
          <Route path="/reminders" component={RemindersPage} />
          <Route path="/billing" component={BillingPage} />
          <Route path="/trial" component={TrialPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/auth" component={SignUpPage} />
          <Route path="/auth/callback" component={AuthCallbackPage} />
          <Route path="/privacy" component={PrivacyPage} />
          <Route path="/terms" component={TermsPage} />
          <Route component={NotFound} />
        </Switch>
      </SubscriptionGuard>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <AuthProvider>
          <StudentsProvider>
            <SnackbarProvider>
              <AuthGuard>
                <AppRoutes />
              </AuthGuard>
            </SnackbarProvider>
          </StudentsProvider>
        </AuthProvider>
      </WouterRouter>
    </QueryClientProvider>
  );
}
