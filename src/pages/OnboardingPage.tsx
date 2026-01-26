import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore, useSettingsStore } from "@/store";
import { ChevronDown } from "lucide-react";
import {
  CustomDropdown,
  LanguageSwitcher,
  CustomCheckbox,
  Spinner,
} from "@/components/common";
import { UNIVERSITY_TRANS_KEYS } from "@/constants/universityTranslation";
import { COLLEGES, DEPARTMENTS, MAJORS } from "@/constants/universityData";

export const OnboardingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    profile,
    updateProfile,
    isLoading,
    error,
    clearError,
    isAuthenticated,
  } = useAuthStore();
  const { resolvedTheme } = useSettingsStore();

  // 동기적으로 프로필 완료 여부 확인
  const isComplete =
    Boolean(profile?.profile_name?.trim()) &&
    Boolean(profile?.student_id?.trim()) &&
    Boolean(profile?.college) &&
    Boolean(profile?.department) &&
    Boolean(profile?.major);

  // 이미 프로필이 완전히 있으면 홈으로 리다이렉트
  useEffect(() => {
    if (isComplete) {
      navigate("/", { replace: true });
    }
  }, [isComplete, navigate]);

  // 로그인 안 되어 있으면 로그인 페이지로
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [form, setForm] = useState({
    profile_name: "",
    student_id: "",
    college: "",
    department: "",
    major: "",
    current_grade: 1,
    current_semester: 1,
  });

  // 약관 동의 상태
  const [agreements, setAgreements] = useState({
    terms: false, // 이용약관 (필수)
    privacy: false, // 개인정보처리방침 (필수)
    marketing: false, // 마케팅 수신 (선택)
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = {
        ...prev,
        [name]:
          name === "current_grade" || name === "current_semester"
            ? Number(value)
            : value,
      };
      if (name === "college") {
        updated.department = "";
        updated.major = "";
      }
      if (name === "department") {
        updated.major = "";
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // 필수 필드 검증
    if (!form.profile_name.trim()) {
      return;
    }

    try {
      await updateProfile(form);
      navigate("/", { replace: true });
    } catch {
      // 에러는 store에서 처리됨
    }
  };

  const departmentList = form.college ? DEPARTMENTS[form.college] || [] : [];
  const majorList = form.department ? MAJORS[form.department] || [] : [];

  const getTranslatedOptions = (items: string[]) => {
    return items.map((item) => {
      const transKey = UNIVERSITY_TRANS_KEYS[item];
      return {
        label: transKey ? t(transKey) : item,
        value: item,
      };
    });
  };

  const collegeOptions = getTranslatedOptions(COLLEGES);
  const departmentOptions = getTranslatedOptions(departmentList);
  const majorOptions = getTranslatedOptions(majorList);

  const isDark = resolvedTheme === "dark";

  const inputStyle =
    "flex-1 min-w-0 px-4 py-3 bg-gray-100/80 dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400/30 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all";

  // 모든 필수 필드 + 필수 동의 입력 여부
  const isFormValid =
    form.profile_name.trim() !== "" &&
    form.student_id.trim() !== "" &&
    form.college !== "" &&
    form.department !== "" &&
    form.major !== "" &&
    agreements.terms &&
    agreements.privacy;

  // 로딩 중이거나, 이미 인증되어 있고 프로필이 완성된 경우 (리다이렉트 대기 중)
  // 스피너를 보여줘서 폼이 깜빡이는 것을 방지
  if (isLoading || (isAuthenticated && isComplete)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col bg-gradient-to-b ${
        isDark ? "from-[#0c1222] to-[#1a2332]" : "from-[#E8F4FC] to-[#D6EBFA]"
      }`}
    >
      {/* 헤더 */}
      <div className="relative flex justify-center items-center px-4 pt-6 pb-2">
        <img
          src="/assets/images/logo.svg"
          alt={t("common.appName")}
          className="h-12"
        />
        {/* 언어 전환 버튼 - 우측 고정 */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <LanguageSwitcher />
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex flex-col items-center px-4 py-4">
        <div
          className={`w-full max-w-md rounded-2xl p-6 ${
            isDark
              ? "bg-slate-900/80 border border-slate-700"
              : "bg-white/90 border border-gray-200"
          } shadow-xl`}
        >
          {/* 환영 메시지 */}
          <div className="text-center mb-6">
            <h1
              className={`text-xl font-bold mb-2 ${
                isDark ? "text-gray-100" : "text-gray-800"
              }`}
            >
              {t("onboarding.title")}
            </h1>
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {t("onboarding.subtitle")}
            </p>
          </div>

          {/* 프로필 폼 */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* 이름 (필수) */}
              <div className="flex items-center gap-4">
                <label className="w-20 text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {t("settings.profile.name")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="profile_name"
                  value={form.profile_name}
                  onChange={handleChange}
                  placeholder={t("settings.profile.namePlaceholder")}
                  className={inputStyle}
                  required
                />
              </div>

              {/* 학번 */}
              <div className="flex items-center gap-4">
                <label className="w-20 text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {t("settings.profile.studentId")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="student_id"
                  value={form.student_id}
                  onChange={handleChange}
                  placeholder="C049529"
                  className={inputStyle}
                  required
                />
              </div>

              {/* 단과대학 */}
              <CustomDropdown
                label={
                  <>
                    {t("settings.profile.college")}{" "}
                    <span className="text-red-500">*</span>
                  </>
                }
                options={collegeOptions}
                value={form.college}
                onChange={(value) => {
                  setForm((prev) => ({
                    ...prev,
                    college: value,
                    department: "",
                    major: "",
                  }));
                }}
                placeholder={t("settings.profile.select")}
              />

              {/* 학부 */}
              <CustomDropdown
                label={
                  <>
                    {t("settings.profile.department")}{" "}
                    <span className="text-red-500">*</span>
                  </>
                }
                options={departmentOptions}
                value={form.department}
                onChange={(value) => {
                  setForm((prev) => ({
                    ...prev,
                    department: value,
                    major: "",
                  }));
                }}
                placeholder={t("settings.profile.select")}
                disabled={!form.college}
              />

              {/* 전공 */}
              <CustomDropdown
                label={
                  <>
                    {t("settings.profile.major")}{" "}
                    <span className="text-red-500">*</span>
                  </>
                }
                options={majorOptions}
                value={form.major}
                onChange={(value) => {
                  setForm((prev) => ({
                    ...prev,
                    major: value,
                  }));
                }}
                placeholder={t("settings.profile.select")}
                disabled={!form.department}
              />

              {/* 현재학기 */}
              <div className="flex items-center gap-4">
                <label className="w-20 text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {t("settings.profile.currentSemester")}
                </label>
                <div className="flex items-center gap-2 flex-1 flex-wrap">
                  <div className="relative">
                    <select
                      name="current_grade"
                      value={form.current_grade}
                      onChange={handleChange}
                      className="px-4 py-2 bg-gray-100/80 dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400/30 text-gray-800 dark:text-gray-100 appearance-none cursor-pointer pr-8 transition-all"
                    >
                      {[1, 2, 3, 4, 5].map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t("settings.profile.grade")}
                  </span>
                  <div className="relative">
                    <select
                      name="current_semester"
                      value={form.current_semester}
                      onChange={handleChange}
                      className="px-4 py-2 bg-gray-100/80 dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400/30 text-gray-800 dark:text-gray-100 appearance-none cursor-pointer pr-8 transition-all"
                    >
                      {[1, 2].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t("settings.profile.semester")}
                  </span>
                </div>
              </div>

              {/* 약관 동의 섹션 */}
              <div
                className={`mt-6 pt-5 border-t ${
                  isDark ? "border-slate-700" : "border-gray-200"
                }`}
              >
                {/* 제목 + 전체동의 */}
                <div className="flex items-center justify-between mb-3">
                  <p
                    className={`text-sm font-medium ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {t("onboarding.agreementTitle")}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const allChecked =
                        agreements.terms &&
                        agreements.privacy &&
                        agreements.marketing;
                      setAgreements({
                        terms: !allChecked,
                        privacy: !allChecked,
                        marketing: !allChecked,
                      });
                    }}
                    className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                      agreements.terms &&
                      agreements.privacy &&
                      agreements.marketing
                        ? "bg-primary-500 text-white"
                        : isDark
                          ? "bg-slate-700 text-gray-300 hover:bg-slate-600"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {t("onboarding.agreeAll")}
                  </button>
                </div>

                {/* 이용약관 동의 (필수) */}
                <CustomCheckbox
                  checked={agreements.terms}
                  onChange={(checked) =>
                    setAgreements((prev) => ({ ...prev, terms: checked }))
                  }
                  id="terms-checkbox"
                >
                  <span className="text-red-500 font-medium mr-1">
                    [{t("onboarding.required")}]
                  </span>
                  <Link
                    to="/terms"
                    className="underline hover:text-primary-500 transition-colors"
                  >
                    {t("common.terms")}
                  </Link>
                  {t("onboarding.agreeToTerms")}
                </CustomCheckbox>

                {/* 개인정보처리방침 동의 (필수) */}
                <CustomCheckbox
                  checked={agreements.privacy}
                  onChange={(checked) =>
                    setAgreements((prev) => ({ ...prev, privacy: checked }))
                  }
                  id="privacy-checkbox"
                >
                  <span className="text-red-500 font-medium mr-1">
                    [{t("onboarding.required")}]
                  </span>
                  <Link
                    to="/privacy"
                    className="underline hover:text-primary-500 transition-colors"
                  >
                    {t("common.privacy")}
                  </Link>
                  {t("onboarding.agreeToPrivacy")}
                </CustomCheckbox>

                {/* 마케팅 수신 동의 (선택) */}
                <CustomCheckbox
                  checked={agreements.marketing}
                  onChange={(checked) =>
                    setAgreements((prev) => ({ ...prev, marketing: checked }))
                  }
                  id="marketing-checkbox"
                >
                  <span className="text-gray-400 dark:text-gray-500 mr-1">
                    [{t("onboarding.optional")}]
                  </span>
                  {t("onboarding.agreeToMarketing")}
                </CustomCheckbox>
              </div>

              {/* 시작하기 버튼 */}
              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full mt-4 px-8 py-3 text-white font-medium rounded-full shadow-lg transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
                style={{
                  background:
                    "radial-gradient(63.37% 63.37% at 50% 50%, #4E92FF 0%, rgba(78, 146, 255, 0.5) 100%)",
                  boxShadow: "0px 0px 40px 0px rgba(105, 162, 255, 0.24)",
                }}
              >
                {isLoading
                  ? t("settings.profile.saving")
                  : t("onboarding.start")}
              </button>
            </div>
          </form>
        </div>

        {/* 필수 입력 안내 */}
        <p
          className={`mt-4 text-xs ${
            isDark ? "text-gray-500" : "text-gray-400"
          }`}
        >
          {t("onboarding.requiredHint")}
        </p>
      </div>
    </div>
  );
};
