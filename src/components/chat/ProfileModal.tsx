import { useState, useEffect } from "react";
import { Modal, CustomDropdown } from "@/components/common";
import { useUIStore, useAuthStore } from "@/store";
import { ChevronDown } from "lucide-react";

// 드롭다운 옵션들 - 강남대학교 단과대학/학부/전공 데이터
const COLLEGES = [
  "부총장직속",
  "복지융합대학",
  "경영관리대학",
  "글로벌문화콘텐츠대학",
  "공과대학",
  "예체능대학",
  "사범대학",
];

const DEPARTMENTS: Record<string, string[]> = {
  부총장직속: ["자유전공학부"],
  복지융합대학: ["사회복지학부", "시니어비즈니스학과", "사회복지학부(야)"],
  경영관리대학: [
    "상경학부",
    "법행정세무학부",
    "상경학부(야)",
    "법행정세무학부(야)",
  ],
  글로벌문화콘텐츠대학: [
    "문화콘텐츠학과",
    "국제지역학과",
    "중국콘텐츠비즈니스학과",
    "기독교커뮤니케이션학과",
    "한국어문학과",
  ],
  공과대학: [
    "컴퓨터공학부",
    "인공지능융합공학부",
    "전자반도체공학부",
    "부동산건설학부",
  ],
  예체능대학: ["디자인학과", "체육학과", "음악학과"],
  사범대학: ["교육학과", "유아교육과", "초등특수교육과", "중등특수교육과"],
};

const MAJORS: Record<string, string[]> = {
  // 부총장직속
  자유전공학부: ["자유전공학부"],
  // 복지융합대학
  사회복지학부: ["사회복지학전공", "사회서비스학전공"],
  시니어비즈니스학과: ["시니어비즈니스학과"],
  "사회복지학부(야)": ["사회복지학전공(야)"],
  // 경영관리대학
  상경학부: ["경영학전공", "경제금융학전공", "국제무역학전공"],
  법행정세무학부: ["세무학전공", "법행정학전공"],
  "상경학부(야)": ["경영학전공(야)", "경제금융학전공(야)"],
  "법행정세무학부(야)": ["세무학전공(야)", "법행정학전공(야)"],
  // 글로벌문화콘텐츠대학
  문화콘텐츠학과: ["문화콘텐츠학과"],
  국제지역학과: ["국제지역학과"],
  중국콘텐츠비즈니스학과: ["중국콘텐츠비즈니스학과"],
  기독교커뮤니케이션학과: ["기독교커뮤니케이션학과"],
  한국어문학과: ["한국어문학과(외국인정원외)"],
  // 공과대학
  컴퓨터공학부: ["소프트웨어전공", "메타버스게임전공"],
  인공지능융합공학부: ["인공지능전공", "데이터사이언스전공"],
  전자반도체공학부: ["전자공학전공", "반도체공학전공", "스마트모빌리티전공"],
  부동산건설학부: ["부동산학전공", "스마트도시공학전공", "건축공학전공"],
  // 예체능대학
  디자인학과: ["디자인학과"],
  체육학과: ["체육학과"],
  음악학과: ["음악학과"],
  // 사범대학
  교육학과: ["교육학과"],
  유아교육과: ["유아교육과"],
  초등특수교육과: ["초등특수교육과"],
  중등특수교육과: ["중등특수교육과"],
};

export const ProfileModal = () => {
  const { isProfileModalOpen, closeProfileModal } = useUIStore();
  const { profile, updateProfile, isLoading, error, clearError } =
    useAuthStore();
  const [isMobile, setIsMobile] = useState(false);

  const [form, setForm] = useState({
    profile_name: "",
    student_id: "",
    college: "",
    department: "",
    major: "",
    current_grade: 1,
    current_semester: 1,
  });

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (profile) {
      setForm({
        profile_name: profile.profile_name || "",
        student_id: profile.student_id || "",
        college: profile.college || "",
        department: profile.department || "",
        major: profile.major || "",
        current_grade: profile.current_grade || 1,
        current_semester: profile.current_semester || 1,
      });
    }
  }, [profile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
      // 단과대학 변경시 학부/전공 초기화
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
    try {
      await updateProfile(form);
      closeProfileModal();
    } catch {
      // 에러는 store에서 처리됨
    }
  };

  const departmentOptions = form.college ? DEPARTMENTS[form.college] || [] : [];
  const majorOptions = form.department ? MAJORS[form.department] || [] : [];

  // 공통 입력 필드 스타일 - 회색 배경, 둥근 모서리
  const inputStyle =
    "flex-1 px-4 py-3 bg-gray-100/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400/30 text-gray-800 placeholder-gray-400 transition-all";

  // 모바일 레이아웃
  if (isMobile) {
    return (
      <Modal
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
        size="profile"
      >
        <form onSubmit={handleSubmit} className="flex flex-col">
          {error && (
            <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-5 w-full">
            {/* 이름 */}
            <div className="flex items-center gap-4 w-full">
              <label className="w-16 text-sm text-gray-500 flex-shrink-0">
                이름
              </label>
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  name="profile_name"
                  value={form.profile_name}
                  onChange={handleChange}
                  placeholder="홍길동"
                  className="w-full px-4 py-3 bg-gray-100/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400/30 text-gray-800 placeholder-gray-400 transition-all"
                />
              </div>
            </div>

            {/* 학번 */}
            <div className="flex items-center gap-4 w-full">
              <label className="w-16 text-sm text-gray-500 flex-shrink-0">
                학번
              </label>
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  name="student_id"
                  value={form.student_id}
                  onChange={handleChange}
                  placeholder="C049529"
                  className="w-full px-4 py-3 bg-gray-100/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400/30 text-gray-800 placeholder-gray-400 transition-all"
                />
              </div>
            </div>

            {/* 단과대학 */}
            <CustomDropdown
              label="단과대학"
              options={COLLEGES}
              value={form.college}
              onChange={(value) => {
                setForm((prev) => ({
                  ...prev,
                  college: value,
                  department: "",
                  major: "",
                }));
              }}
              placeholder="선택"
            />

            {/* 학부 */}
            <CustomDropdown
              label="학부"
              options={departmentOptions}
              value={form.department}
              onChange={(value) => {
                setForm((prev) => ({
                  ...prev,
                  department: value,
                  major: "",
                }));
              }}
              placeholder="선택"
              disabled={!form.college}
            />

            {/* 전공 */}
            <CustomDropdown
              label="전공"
              options={majorOptions}
              value={form.major}
              onChange={(value) => {
                setForm((prev) => ({
                  ...prev,
                  major: value,
                }));
              }}
              placeholder="선택"
              disabled={!form.department}
            />

            {/* 현재학기 */}
            <div className="flex items-center gap-4">
              <label className="w-16 text-sm text-gray-500 flex-shrink-0">
                현재학기
              </label>
              <div className="flex items-center gap-3 flex-1">
                <div className="relative">
                  <select
                    name="current_grade"
                    value={form.current_grade}
                    onChange={handleChange}
                    className="px-4 py-2 bg-gray-100/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400/30 text-gray-800 appearance-none cursor-pointer pr-8 transition-all"
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
                <span className="text-sm text-gray-500">학년</span>
                <div className="relative">
                  <select
                    name="current_semester"
                    value={form.current_semester}
                    onChange={handleChange}
                    className="px-4 py-2 bg-gray-100/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400/30 text-gray-800 appearance-none cursor-pointer pr-8 transition-all"
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
                <span className="text-sm text-gray-500">학기</span>
              </div>
            </div>
          </div>

          {/* 저장 버튼 - 전체 너비, 드롭다운 공간 확보 위해 상단 여백 증가, 홈버튼 위해 하단 여백 추가 */}
          <button
            type="submit"
            disabled={isLoading}
            className="relative z-0 mt-16 mb-8 w-full py-4 text-white font-medium rounded-2xl shadow-lg transition-all disabled:opacity-50"
            style={{
              background:
                "radial-gradient(63.37% 63.37% at 50% 50%, #4E92FF 0%, rgba(78, 146, 255, 0.5) 100%)",
              boxShadow: "0px 0px 40px 0px rgba(105, 162, 255, 0.24)",
            }}
          >
            {isLoading ? "저장 중..." : "저장"}
          </button>
        </form>
      </Modal>
    );
  }

  // 데스크탑 레이아웃
  return (
    <Modal
      isOpen={isProfileModalOpen}
      onClose={closeProfileModal}
      size="profile"
    >
      <form onSubmit={handleSubmit}>
        {/* 전체 레이아웃: 왼쪽 타이틀 | 세로선 | 오른쪽 폼+버튼 */}
        <div className="flex">
          {/* 왼쪽 - 프로필 타이틀 */}
          <div className="flex-shrink-0 pr-8 py-4">
            <h2 className="text-lg font-bold text-gray-800">프로필</h2>
          </div>

          {/* 세로 구분선 - 2px, 전체 높이 */}
          <div className="w-0.5 bg-gray-200 mx-6" />

          {/* 오른쪽 - 폼 필드들 + 저장 버튼 */}
          <div className="flex-1 py-2 pr-8">
            <div className="max-w-md space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* 이름 */}
              <div className="flex items-center gap-6">
                <label className="w-16 text-sm text-gray-500 flex-shrink-0">
                  이름
                </label>
                <input
                  type="text"
                  name="profile_name"
                  value={form.profile_name}
                  onChange={handleChange}
                  placeholder="홍길동"
                  className={inputStyle}
                />
              </div>

              {/* 학번 */}
              <div className="flex items-center gap-6">
                <label className="w-16 text-sm text-gray-500 flex-shrink-0">
                  학번
                </label>
                <input
                  type="text"
                  name="student_id"
                  value={form.student_id}
                  onChange={handleChange}
                  placeholder="C049529"
                  className={inputStyle}
                />
              </div>

              {/* 단과대학 */}
              <CustomDropdown
                label="단과대학"
                options={COLLEGES}
                value={form.college}
                onChange={(value) => {
                  setForm((prev) => ({
                    ...prev,
                    college: value,
                    department: "",
                    major: "",
                  }));
                }}
                placeholder="선택"
              />

              {/* 학부 */}
              <CustomDropdown
                label="학부"
                options={departmentOptions}
                value={form.department}
                onChange={(value) => {
                  setForm((prev) => ({
                    ...prev,
                    department: value,
                    major: "",
                  }));
                }}
                placeholder="선택"
                disabled={!form.college}
              />

              {/* 전공 */}
              <CustomDropdown
                label="전공"
                options={majorOptions}
                value={form.major}
                onChange={(value) => {
                  setForm((prev) => ({
                    ...prev,
                    major: value,
                  }));
                }}
                placeholder="선택"
                disabled={!form.department}
              />

              {/* 현재학기 */}
              <div className="flex items-center gap-6">
                <label className="w-16 text-sm text-gray-500 flex-shrink-0">
                  현재학기
                </label>
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative">
                    <select
                      name="current_grade"
                      value={form.current_grade}
                      onChange={handleChange}
                      className="px-4 py-2 bg-gray-100/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400/30 text-gray-800 appearance-none cursor-pointer pr-8 transition-all"
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
                  <span className="text-sm text-gray-500">학년</span>
                  <div className="relative">
                    <select
                      name="current_semester"
                      value={form.current_semester}
                      onChange={handleChange}
                      className="px-4 py-2 bg-gray-100/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400/30 text-gray-800 appearance-none cursor-pointer pr-8 transition-all"
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
                  <span className="text-sm text-gray-500">학기</span>
                </div>
              </div>
            </div>

            {/* 저장 버튼 - 폼 영역 내 우하단 */}
            <div className="flex justify-end mt-10">
              <button
                type="submit"
                disabled={isLoading}
                className="px-10 py-3 text-white font-medium rounded-full shadow-lg transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
                style={{
                  background:
                    "radial-gradient(63.37% 63.37% at 50% 50%, #4E92FF 0%, rgba(78, 146, 255, 0.5) 100%)",
                  boxShadow: "0px 0px 40px 0px rgba(105, 162, 255, 0.24)",
                }}
              >
                {isLoading ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};
