import { Route, Routes, Navigate } from "react-router";

// Layouts
import RootLayout from "@/layouts/RootLayout";
import LegalLayout from "@/layouts/LegalLayout";
import ProtectedLayout from "@/layouts/ProtectedLayout";
import MobileOnlyLayout from "./layouts/MobileOnlyLayout";
import { QuestionPaperStudioLayout } from "@/layouts/StudioLayout";
import { AccountLayout } from "@/layouts/AccountLayout";

// Core Views
import LoginView from "@/views/LoginView";
import NotFoundView from "@/views/NotFoundView";
import DashboardView from "@/views/DashboardView";
import MobileDashboardView from "@/views/MobileDashboardView";
import MobileHistoryView from "@/views/MobileHistoryView";

// Question Paper Generate View
import QuestionPaperGenerateView from "@/views/question-paper/QuestionPaperGenerateView";

// Legal Pages
import PrivacyPolicyPage from "@/views/legal/PrivacyPolicyPage";
import RefundPolicyPage from "@/views/legal/RefundPolicyPage";
import TermsOfServicePage from "@/views/legal/TermsOfServicePage";
import UserAgreementPage from "@/views/legal/UserAgreementPage";

// Studio Views
import AddQuestionView from "@/views/question-paper-studio/AddQuestionView";
import EditQuestionView from "@/views/question-paper-studio/EditQuestionView";
import ViewQuestionView from "@/views/question-paper-studio/ViewQuestionView";
import NoQuestionSelectedView from "@/views/question-paper-studio/NoQuestionSelectedView";
import MobileQuestionPaperView from "@/views/question-paper-studio/MobileQuestionPaperView";

// Account Views
import AccountView from "@/views/account/AccountView";
import OrganizationsView from "@/views/account/OrganizationsView";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginView />} />

      {/* Legal Pages */}
      <Route path="l" element={<LegalLayout />}>
        <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="refund-policy" element={<RefundPolicyPage />} />
        <Route path="terms-of-service" element={<TermsOfServicePage />} />
        <Route path="user-agreement" element={<UserAgreementPage />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedLayout />}>
        <Route element={<RootLayout />}>
          <Route index element={<DashboardView />} />

          <Route
            index
            path="question-paper"
            element={<QuestionPaperGenerateView />}
          />

          <Route
            path="question-paper-solver"
            element={<Navigate to="/" replace />}
          />

          <Route element={<MobileOnlyLayout />} path="mobile">
            <Route index element={<MobileDashboardView />} />
            <Route path="history" element={<MobileHistoryView />} />
            <Route
              path="question-paper/studio/:id"
              element={<MobileQuestionPaperView />}
            />
          </Route>
        </Route>

        {/* Studio routes */}
        <Route
          path={"question-paper/studio/:id"}
          element={<QuestionPaperStudioLayout />}
        >
          <Route index element={<NoQuestionSelectedView />} />
          <Route path={"add-question"} element={<AddQuestionView />} />
          <Route path={":questionId/edit"} element={<EditQuestionView />} />
          <Route path={":questionId"} element={<ViewQuestionView />} />
        </Route>

        {/* Account routes */}
        <Route path={"account"} element={<AccountLayout />}>
          <Route index element={<AccountView />} />
          <Route path="organizations" element={<OrganizationsView />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFoundView />} />
    </Routes>
  );
};

export default AppRoutes;
