import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-lg bg-white/70 dark:bg-slate-900/70 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            to="/"
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            개인정보 처리방침
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 md:p-8 space-y-8">
          {/* 개인정보처리방침 개요 */}
          <section className="bg-blue-50/50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
              <strong>강냉봇</strong>(이하 "서비스")은 「개인정보 보호법」
              제30조에 따라 정보주체(이용자)의 개인정보를 보호하고 이와 관련한
              고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보
              처리방침을 수립·공개합니다. 본 방침은 서비스 이용 시 적용됩니다.
            </p>
          </section>

          {/* 제1조: 개인정보 처리 목적 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제1조 (개인정보의 처리 목적)
            </h2>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
              <p>
                서비스는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고
                있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
                이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라
                별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
              </p>
              <div className="space-y-4 mt-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    1. 서비스 제공
                  </h3>
                  <ul className="space-y-1 list-disc list-inside ml-2 text-sm">
                    <li>AI 기반 강남대학교 학사정보 질의응답 서비스 제공</li>
                    <li>대화 이력 저장 및 관리</li>
                    <li>개인화된 학사 정보 및 일정 안내</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    2. 회원 관리
                  </h3>
                  <ul className="space-y-1 list-disc list-inside ml-2 text-sm">
                    <li>회원 가입 의사 확인 및 본인 식별·인증</li>
                    <li>회원 자격 유지·관리</li>
                    <li>서비스 부정 이용 방지</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    3. 서비스 개선
                  </h3>
                  <ul className="space-y-1 list-disc list-inside ml-2 text-sm">
                    <li>서비스 이용 현황 분석 및 통계</li>
                    <li>AI 모델 품질 개선 (익명화된 데이터 활용)</li>
                    <li>신규 서비스 개발 및 기능 개선</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 제2조: 수집하는 개인정보 항목 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제2조 (수집하는 개인정보 항목)
            </h2>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 px-3 py-2 text-left font-semibold">
                        구분
                      </th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-semibold">
                        수집 항목
                      </th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-semibold">
                        필수/선택
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 px-3 py-2 font-medium">
                        회원가입 시
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        이메일 주소, Google 계정 프로필 정보(이름, 프로필
                        이미지)
                      </td>
                      <td className="border border-gray-200 px-3 py-2">필수</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 px-3 py-2 font-medium">
                        프로필 설정 시
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        닉네임, 학번, 소속(단과대학, 학부, 전공), 학년, 학기
                      </td>
                      <td className="border border-gray-200 px-3 py-2">선택</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-3 py-2 font-medium">
                        서비스 이용 시
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        대화 내용(질문 및 AI 응답), 대화 세션 정보
                      </td>
                      <td className="border border-gray-200 px-3 py-2">필수</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 px-3 py-2 font-medium">
                        자동 수집
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        접속 IP, 접속 일시, 브라우저 정보, 디바이스 정보, 쿠키
                      </td>
                      <td className="border border-gray-200 px-3 py-2">필수</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-yellow-50/70 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800 mt-4">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  <strong>⚠️ 주의:</strong> 서비스 이용 시 민감한
                  개인정보(주민등록번호, 금융정보, 건강정보, 비밀번호 등)를 AI
                  대화에 입력하지 마시기 바랍니다. 입력된 민감정보에 대한 책임은
                  이용자에게 있습니다.
                </p>
              </div>
            </div>
          </section>

          {/* 제3조: 개인정보 수집 방법 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제3조 (개인정보의 수집 방법)
            </h2>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
              <p>서비스는 다음과 같은 방법으로 개인정보를 수집합니다:</p>
              <ul className="space-y-2 list-decimal list-inside ml-2">
                <li>
                  <strong>회원가입:</strong> Google OAuth 2.0을 통한 소셜 로그인
                </li>
                <li>
                  <strong>프로필 설정:</strong> 이용자의 자발적 입력
                </li>
                <li>
                  <strong>서비스 이용:</strong> AI 챗봇과의 대화 과정에서
                  이용자가 입력한 내용
                </li>
                <li>
                  <strong>자동 수집:</strong> 서비스 이용 과정에서 자동으로
                  생성되는 접속 로그
                </li>
              </ul>
            </div>
          </section>

          {/* 제4조: 개인정보의 보유 및 이용 기간 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제4조 (개인정보의 보유 및 이용 기간)
            </h2>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
              <p>
                서비스는 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를
                지체 없이 파기합니다. 다만, 다음의 정보에 대해서는 아래의 이유로
                명시한 기간 동안 보존합니다:
              </p>
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 px-3 py-2 text-left font-semibold">
                        보유 항목
                      </th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-semibold">
                        보유 기간
                      </th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-semibold">
                        보유 근거
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 px-3 py-2">
                        회원 계정 정보
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        회원 탈퇴 시까지
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        서비스 이용계약
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 px-3 py-2">
                        대화 이력
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        회원 탈퇴 시 또는 삭제 요청 시까지
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        서비스 제공
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-3 py-2">
                        서비스 이용 기록, 접속 로그
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        3개월
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        통신비밀보호법 제15조의2
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 px-3 py-2">
                        게스트 대화 이력
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        세션 종료 시 또는 7일 후
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        서비스 제공
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* 제5조: 개인정보의 파기 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제5조 (개인정보의 파기 절차 및 방법)
            </h2>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
              <p>
                서비스는 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가
                불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.
              </p>
              <div className="space-y-4 mt-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    파기 절차
                  </h3>
                  <p className="text-sm ml-2">
                    이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져 내부
                    방침 및 기타 관련 법령에 따라 일정 기간 저장된 후 혹은 즉시
                    파기됩니다.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    파기 방법
                  </h3>
                  <ul className="space-y-1 list-disc list-inside ml-2 text-sm">
                    <li>
                      <strong>전자적 파일:</strong> 복구 및 재생이 불가능한
                      기술적 방법을 사용하여 삭제
                    </li>
                    <li>
                      <strong>종이 문서:</strong> 분쇄기로 분쇄하거나 소각
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 제6조: 개인정보의 제3자 제공 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제6조 (개인정보의 제3자 제공)
            </h2>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
              <p>
                서비스는 원칙적으로 이용자의 개인정보를 제1조에서 명시한 목적
                범위 내에서 처리하며, 정보주체의 사전 동의 없이는 본래의 목적
                범위를 초과하여 처리하거나 제3자에게 제공하지 않습니다.
              </p>
              <p>다만, 다음의 경우에는 예외로 합니다:</p>
              <ul className="space-y-2 list-decimal list-inside ml-2">
                <li>정보주체가 사전에 제3자 제공에 동의한 경우</li>
                <li>
                  법령에 특별한 규정이 있거나 법령상 의무를 준수하기 위하여
                  불가피한 경우
                </li>
                <li>
                  정보주체 또는 그 법정대리인이 의사표시를 할 수 없는 상태에
                  있거나 주소불명 등으로 사전 동의를 받을 수 없는 경우로서
                  명백히 정보주체 또는 제3자의 급박한 생명, 신체, 재산의 이익을
                  위하여 필요하다고 인정되는 경우
                </li>
                <li>
                  통계작성 및 학술연구 등의 목적을 위하여 필요한 경우로서 특정
                  개인을 알아볼 수 없는 형태로 개인정보를 제공하는 경우
                </li>
              </ul>
            </div>
          </section>

          {/* 제7조: 개인정보 처리의 위탁 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제7조 (개인정보 처리의 위탁)
            </h2>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
              <p>
                서비스는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리
                업무를 위탁하고 있습니다:
              </p>
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 px-3 py-2 text-left font-semibold">
                        위탁받는 자
                      </th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-semibold">
                        위탁 업무 내용
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 px-3 py-2">
                        Google LLC
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        소셜 로그인 인증 서비스 제공
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 px-3 py-2">
                        클라우드 서비스 제공업체
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        서버 호스팅 및 데이터 저장
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-3 py-2">
                        AI 서비스 제공업체
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        AI 모델 API를 통한 응답 생성
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm mt-3">
                위탁계약 체결 시 「개인정보 보호법」에 따라 위탁업무 수행 목적
                외 개인정보 처리 금지, 기술적·관리적 보호조치, 재위탁 제한,
                수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 계약서
                등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를
                감독하고 있습니다.
              </p>
            </div>
          </section>

          {/* 제8조: AI 학습 데이터 처리 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제8조 (AI 학습 데이터 처리)
            </h2>
            <div className="bg-purple-50/50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800 mb-4">
              <p className="text-purple-800 dark:text-purple-200 text-sm font-medium">
                🤖 AI 서비스 특화 조항
              </p>
            </div>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
              <ul className="space-y-3 list-decimal list-inside ml-2">
                <li>
                  <strong>학습 데이터 활용:</strong> 서비스 품질 향상을 위해
                  익명화된 대화 데이터를 AI 모델 개선에 활용할 수 있습니다. 이
                  경우 개인을 식별할 수 있는 정보는 완전히 제거됩니다.
                </li>
                <li>
                  <strong>비식별화 조치:</strong> AI 학습에 활용되는 데이터는
                  가명처리 또는 익명화 처리를 거쳐 특정 개인을 알아볼 수 없도록
                  조치합니다.
                </li>
                <li>
                  <strong>AI 응답 생성:</strong> 서비스는 외부 AI 모델 API를
                  활용하여 응답을 생성합니다. 이용자의 질문은 응답 생성을 위해
                  해당 AI 서비스 제공업체에 전송될 수 있으며, 이 과정에서
                  개인정보 보호를 위한 기술적 조치가 적용됩니다.
                </li>
                <li>
                  <strong>학습 데이터 거부권:</strong> 이용자는 자신의 대화
                  데이터가 AI 학습에 활용되는 것을 거부할 수 있습니다. 거부
                  의사는 개인정보보호책임자에게 연락하여 표시할 수 있습니다.
                </li>
              </ul>
            </div>
          </section>

          {/* 제9조: 정보주체의 권리 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제9조 (정보주체와 법정대리인의 권리·의무 및 행사 방법)
            </h2>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
              <p>
                정보주체(이용자)는 서비스에 대해 언제든지 다음 각 호의 개인정보
                보호 관련 권리를 행사할 수 있습니다:
              </p>
              <ul className="space-y-2 list-decimal list-inside ml-2">
                <li>
                  <strong>개인정보 열람 요구:</strong> 본인의 개인정보 처리 현황
                  열람
                </li>
                <li>
                  <strong>개인정보 정정·삭제 요구:</strong> 오류 등이 있을 경우
                  정정 또는 삭제 요청
                </li>
                <li>
                  <strong>개인정보 처리정지 요구:</strong> 개인정보 처리의 정지
                  요청
                </li>
                <li>
                  <strong>동의 철회:</strong> 개인정보 수집·이용에 대한 동의
                  철회
                </li>
                <li>
                  <strong>회원 탈퇴:</strong> 서비스 이용 종료 및 모든 개인정보
                  삭제
                </li>
              </ul>
              <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4 mt-4">
                <h3 className="font-semibold text-gray-700 mb-2">
                  권리 행사 방법
                </h3>
                <ul className="space-y-1 text-sm">
                  <li>
                    • <strong>프로필 설정:</strong> 서비스 내 프로필 설정
                    페이지에서 직접 수정·삭제
                  </li>
                  <li>
                    • <strong>대화 이력:</strong> 서비스 내에서 개별 세션 삭제
                    가능
                  </li>
                  <li>
                    • <strong>회원 탈퇴:</strong> 프로필 설정 또는
                    개인정보보호책임자에게 요청
                  </li>
                  <li>
                    • <strong>기타 요청:</strong>{" "}
                    이메일(privacy@gangnaengbot.com)로 요청
                  </li>
                </ul>
              </div>
              <p className="text-sm mt-3">
                권리 행사는 서면, 전화, 전자우편 등을 통하여 하실 수 있으며,
                서비스는 이에 대해 지체 없이 조치하겠습니다. 정보주체가
                개인정보의 오류 등에 대한 정정 또는 삭제를 요구한 경우에는
                서비스는 정정 또는 삭제를 완료할 때까지 당해 개인정보를
                이용하거나 제공하지 않습니다.
              </p>
            </div>
          </section>

          {/* 제10조: 자동화된 결정에 대한 권리 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제10조 (자동화된 결정에 대한 정보주체의 권리)
            </h2>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
              <p>
                서비스는 AI를 활용하여 이용자의 질문에 자동으로 응답을
                생성합니다. 이와 관련하여 정보주체는 다음의 권리를 가집니다:
              </p>
              <ul className="space-y-2 list-decimal list-inside ml-2">
                <li>
                  <strong>자동화된 결정에 대한 설명 요구:</strong> AI가 어떤
                  방식으로 응답을 생성하는지에 대한 일반적인 설명을 요청할 수
                  있습니다.
                </li>
                <li>
                  <strong>이의제기 권리:</strong> AI의 응답이 부정확하거나
                  부적절하다고 판단되는 경우, 이에 대해 이의를 제기할 수
                  있습니다.
                </li>
              </ul>
              <p className="text-sm mt-3">
                다만, 본 서비스의 AI 응답은 학사정보 안내 목적으로만 제공되며,
                이용자의 권리나 의무에 중대한 영향을 미치는 법적 결정을 내리지
                않습니다.
              </p>
            </div>
          </section>

          {/* 제11조: 만 14세 미만 아동 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제11조 (만 14세 미만 아동의 개인정보 처리)
            </h2>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
              <p>
                서비스는 만 14세 미만의 아동에 대한 개인정보를 수집하지
                않습니다. 서비스는 대학생 및 대학 관계자를 주요 이용자로 하며,
                만 14세 미만 아동의 이용을 대상으로 하지 않습니다.
              </p>
              <p>
                만약 만 14세 미만 아동의 개인정보가 수집된 사실을 알게 된 경우,
                해당 정보를 지체 없이 파기하겠습니다.
              </p>
            </div>
          </section>

          {/* 제12조: 쿠키 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제12조 (쿠키의 설치·운영 및 거부)
            </h2>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
              <p>
                서비스는 이용자에게 개별적인 맞춤 서비스를 제공하기 위해
                이용정보를 저장하고 수시로 불러오는 '쿠키(Cookie)'를 사용합니다.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 mt-3">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  사용하는 쿠키
                </h3>
                <ul className="space-y-2 text-blue-700 dark:text-blue-300 text-sm">
                  <li>
                    <strong>• 인증 토큰 쿠키</strong>
                    <span className="ml-2 text-xs bg-blue-100 px-2 py-0.5 rounded">
                      HttpOnly, Secure, SameSite
                    </span>
                    <p className="ml-4 text-blue-600 text-xs mt-1">
                      로그인 상태 유지 및 보안 인증에 사용
                    </p>
                  </li>
                  <li>
                    <strong>• 리프레시 토큰 쿠키</strong>
                    <span className="ml-2 text-xs bg-blue-100 px-2 py-0.5 rounded">
                      HttpOnly, Secure, SameSite
                    </span>
                    <p className="ml-4 text-blue-600 text-xs mt-1">
                      인증 토큰 갱신에 사용
                    </p>
                  </li>
                  <li>
                    <strong>• 세션 쿠키</strong>
                    <p className="ml-4 text-blue-600 text-xs mt-1">
                      브라우저 종료 시 자동 삭제
                    </p>
                  </li>
                </ul>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold text-gray-700 mb-2">
                  쿠키 설정 거부 방법
                </h3>
                <p className="text-sm">
                  이용자는 웹 브라우저 설정을 통해 쿠키 저장을 거부할 수
                  있습니다. 다만, 쿠키 저장을 거부할 경우 로그인이 필요한 서비스
                  이용에 어려움이 있을 수 있습니다.
                </p>
                <ul className="space-y-1 text-sm mt-2 ml-2">
                  <li>
                    • Chrome: 설정 → 개인정보 및 보안 → 쿠키 및 기타 사이트
                    데이터
                  </li>
                  <li>
                    • Safari: 환경설정 → 개인정보 보호 → 쿠키 및 웹사이트 데이터
                  </li>
                  <li>
                    • Firefox: 설정 → 개인정보 및 보안 → 쿠키 및 사이트 데이터
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 제13조: 안전성 확보 조치 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제13조 (개인정보의 안전성 확보 조치)
            </h2>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
              <p>
                서비스는 「개인정보 보호법」 제29조에 따라 다음과 같이 안전성
                확보에 필요한 기술적·관리적·물리적 조치를 하고 있습니다:
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    🔒 기술적 조치
                  </h3>
                  <ul className="space-y-1 list-disc list-inside text-sm">
                    <li>SSL/TLS를 통한 데이터 암호화 전송</li>
                    <li>민감 정보 암호화 저장 (해시, AES)</li>
                    <li>인증 토큰 HttpOnly 쿠키 보호</li>
                    <li>보안 취약점 정기 점검</li>
                    <li>침입 탐지 및 방지 시스템 운영</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    📋 관리적 조치
                  </h3>
                  <ul className="space-y-1 list-disc list-inside text-sm">
                    <li>개인정보 취급자 최소화</li>
                    <li>개인정보 처리 권한 분리</li>
                    <li>내부관리계획 수립·시행</li>
                    <li>접근 권한 관리 및 로그 기록</li>
                    <li>정기적인 자체 감사 실시</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 제14조: 개인정보 보호책임자 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제14조 (개인정보 보호책임자)
            </h2>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
              <p>
                서비스는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보
                처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와
                같이 개인정보 보호책임자를 지정하고 있습니다.
              </p>
              <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4 mt-3">
                <h3 className="font-semibold text-gray-700 mb-3">
                  개인정보 보호책임자
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>서비스명:</strong> 강냉봇 (GangNaengBot)
                  </p>
                  <p>
                    <strong>담당:</strong> 개인정보 보호 담당
                  </p>
                  <p>
                    <strong>이메일:</strong> privacy@gangnaengbot.com
                  </p>
                  <p>
                    <strong>문의 가능 시간:</strong> 평일 09:00 ~ 18:00 (공휴일
                    제외)
                  </p>
                </div>
              </div>
              <p className="text-sm mt-3">
                정보주체는 서비스를 이용하시면서 발생한 모든 개인정보 보호 관련
                문의, 불만처리, 피해구제 등에 관한 사항을 개인정보
                보호책임자에게 문의하실 수 있습니다. 서비스는 정보주체의 문의에
                대해 지체 없이 답변 및 처리해 드릴 것입니다.
              </p>
            </div>
          </section>

          {/* 제15조: 권익침해 구제방법 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제15조 (권익침해 구제방법)
            </h2>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
              <p>
                정보주체는 개인정보침해로 인한 구제를 받기 위하여
                개인정보분쟁조정위원회, 한국인터넷진흥원 개인정보침해신고센터
                등에 분쟁해결이나 상담 등을 신청할 수 있습니다.
              </p>
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 px-3 py-2 text-left font-semibold">
                        기관
                      </th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-semibold">
                        연락처
                      </th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-semibold">
                        웹사이트
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 px-3 py-2">
                        개인정보분쟁조정위원회
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        1833-6972
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        www.kopico.go.kr
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 px-3 py-2">
                        개인정보침해신고센터
                      </td>
                      <td className="border border-gray-200 px-3 py-2">118</td>
                      <td className="border border-gray-200 px-3 py-2">
                        privacy.kisa.or.kr
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-3 py-2">
                        대검찰청 사이버수사과
                      </td>
                      <td className="border border-gray-200 px-3 py-2">1301</td>
                      <td className="border border-gray-200 px-3 py-2">
                        www.spo.go.kr
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 px-3 py-2">
                        경찰청 사이버수사국
                      </td>
                      <td className="border border-gray-200 px-3 py-2">182</td>
                      <td className="border border-gray-200 px-3 py-2">
                        ecrm.police.go.kr
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* 제16조: 개인정보 처리방침 변경 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제16조 (개인정보 처리방침의 변경)
            </h2>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
              <ul className="space-y-2 list-decimal list-inside ml-2">
                <li>
                  이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에
                  따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의
                  시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
                </li>
                <li>
                  다만, 개인정보의 수집·이용 목적, 제3자 제공 대상 등 중요한
                  사항이 변경되는 경우에는 최소 30일 전에 공지하며, 필요 시
                  이용자 동의를 다시 받을 수 있습니다.
                </li>
              </ul>
            </div>
          </section>

          {/* 부칙 */}
          <section className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              부칙
            </h2>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-2">
              <p>
                <strong>제1조 (시행일)</strong>
              </p>
              <p>이 개인정보 처리방침은 2025년 12월 10일부터 시행됩니다.</p>
            </div>
          </section>

          {/* 개정이력 */}
          <section className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              개정이력
            </h3>
            <ul className="text-gray-500 dark:text-gray-400 text-sm space-y-1">
              <li>
                • 2025년 12월 10일: 개인정보처리방침 전면 개정 (AI 학습 데이터
                조항 추가, 자동화된 결정 권리 추가, 처리 위탁 상세화)
              </li>
              <li>• 2024년 12월 10일: 최초 제정</li>
            </ul>
          </section>

          {/* 관련 문서 */}
          <section className="pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              관련 문서
            </h3>
            <div className="flex gap-3">
              <Link
                to="/terms"
                className="text-blue-600 text-sm hover:underline"
              >
                이용약관 →
              </Link>
            </div>
          </section>

          {/* 최종 업데이트 */}
          <section className="pt-4 border-t border-gray-100">
            <p className="text-gray-400 text-xs text-center">
              최종 업데이트: 2025년 12월 10일
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};
