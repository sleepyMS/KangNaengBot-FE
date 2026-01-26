import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store";
import { Spinner } from "@/components/common";
import { MainLayout } from "@/components/layout";

/**
 * 전역적인 경로 보호 및 리다이렉트를 담당하는 가드 컴포넌트
 */

/**
 * 인증된 사용자만 접근할 수 있는 페이지 보호
 * 로그인하지 않은 유저는 /login으로 보내고, 프로필이 미완료된 유저는 /onboarding으로 보냅니다.
 */
export const AuthGuard = () => {
  const { isAuthenticated, profile, isLoading } = useAuthStore();
  const location = useLocation();

  // 1. 초기 하이드레이션 및 프로필 로딩 중일 때는 로딩 화면 유지
  if (isLoading || (isAuthenticated && profile === null)) {
    return (
      <MainLayout>
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  // 2. 인증되지 않은 경우 로그인 페이지로
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. 프로필 미완료 시 온보딩 페이지로 (온보딩 페이지 자체 접근은 제외)
  const isProfileComplete =
    Boolean(profile?.profile_name?.trim()) &&
    Boolean(profile?.student_id?.trim()) &&
    Boolean(profile?.college) &&
    Boolean(profile?.department) &&
    Boolean(profile?.major);

  if (!isProfileComplete && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  // 4. 모든 조건 통과 (ChatPage 등)
  return <Outlet />;
};

/**
 * 게스트 또는 로그인하지 않은 사용자만 접근할 수 있는 페이지 보호 (로그인, 회원가입 등)
 */
export const PublicGuard = () => {
  const { isAuthenticated, profile, isLoading } = useAuthStore();
  const location = useLocation();

  // 초기 로딩 중에는 대기
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  // 이미 로그인되어 있고 프로필도 완료된 경우 메인으로
  const isProfileComplete =
    Boolean(profile?.profile_name?.trim()) &&
    Boolean(profile?.student_id?.trim()) &&
    Boolean(profile?.college) &&
    Boolean(profile?.department) &&
    Boolean(profile?.major);

  if (isAuthenticated && isProfileComplete && location.pathname === "/login") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

/**
 * 온보딩 페이지 전용 가드
 * 로그인 되었으나 프로필이 미완료된 상태에서만 접근 가능
 */
export const OnboardingGuard = () => {
  const { isAuthenticated, profile, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isProfileComplete =
    Boolean(profile?.profile_name?.trim()) &&
    Boolean(profile?.student_id?.trim()) &&
    Boolean(profile?.college) &&
    Boolean(profile?.department) &&
    Boolean(profile?.major);

  if (isProfileComplete) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
