import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export const TermsPage = () => {
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
            이용약관
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 md:p-8 space-y-8">
          {/* 서비스 개요 안내 */}
          <section className="bg-blue-50/50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
              본 이용약관(이하 "약관")은 <strong>강냉봇</strong>(이하
              "서비스")의 이용과 관련하여 서비스 운영자(이하 "운영자")와 이용자
              간의 권리, 의무 및 책임사항을 규정합니다. 서비스를 이용하시기 전에
              본 약관을 주의 깊게 읽어주시기 바랍니다.
            </p>
          </section>

          {/* 제1조: 목적 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제1조 (목적)
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              본 약관은 강냉봇(이하 "서비스")이 제공하는 인공지능(AI) 기반
              강남대학교 학사정보 챗봇 서비스의 이용조건 및 절차, 운영자와
              이용자의 권리·의무 및 책임사항, 기타 필요한 사항을 규정함을
              목적으로 합니다.
            </p>
          </section>

          {/* 제2조: 용어의 정의 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제2조 (용어의 정의)
            </h2>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
              <p>본 약관에서 사용하는 용어의 정의는 다음과 같습니다:</p>
              <ul className="space-y-3 list-decimal list-inside ml-2">
                <li>
                  <strong>"서비스"</strong>란 운영자가 제공하는 강남대학교
                  학사정보 AI 챗봇 및 이에 부수되는 제반 서비스를 의미합니다.
                </li>
                <li>
                  <strong>"이용자"</strong>란 본 약관에 동의하고 서비스를
                  이용하는 회원 및 비회원을 의미합니다.
                </li>
                <li>
                  <strong>"회원"</strong>이란 서비스에 가입하여 계정을 보유하고,
                  지속적으로 서비스를 이용할 수 있는 자를 의미합니다.
                </li>
                <li>
                  <strong>"비회원(게스트)"</strong>이란 회원 가입 없이 서비스의
                  일부 기능을 제한적으로 이용하는 자를 의미합니다.
                </li>
                <li>
                  <strong>"계정"</strong>이란 이용자의 식별 및 서비스 이용을
                  위해 이용자가 설정하거나 운영자가 부여한 고유 식별 정보를
                  의미합니다.
                </li>
                <li>
                  <strong>"AI 응답"</strong>이란 인공지능 기술을 활용하여
                  이용자의 질문에 자동으로 생성된 답변을 의미합니다.
                </li>
                <li>
                  <strong>"콘텐츠"</strong>란 서비스 내에서 이용자가 입력하거나
                  서비스가 생성한 텍스트, 이미지, 파일 등 모든 형태의 정보를
                  의미합니다.
                </li>
              </ul>
            </div>
          </section>

          {/* 제3조: 약관의 효력 및 변경 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제3조 (약관의 효력 및 변경)
            </h2>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
              <ul className="space-y-3 list-decimal list-inside ml-2">
                <li>
                  본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게
                  공지함으로써 효력이 발생합니다.
                </li>
                <li>
                  운영자는 「약관의 규제에 관한 법률」, 「정보통신망 이용촉진 및
                  정보보호 등에 관한 법률」 등 관련 법령을 위배하지 않는
                  범위에서 본 약관을 개정할 수 있습니다.
                </li>
                <li>
                  운영자가 약관을 개정할 경우, 적용일자 및 개정사유를 명시하여
                  현행 약관과 함께 서비스 초기화면에 그 적용일자 7일 전부터
                  적용일자 전일까지 공지합니다. 다만, 이용자에게 불리하게 약관
                  내용을 변경하는 경우에는 최소 30일 이상의 사전 유예기간을 두고
                  공지합니다.
                </li>
                <li>
                  이용자가 개정약관의 적용에 동의하지 않는 경우, 서비스 이용을
                  중단하고 탈퇴할 수 있습니다. 개정약관 공지 후 적용일까지 거부
                  의사를 표시하지 않고 서비스를 계속 이용할 경우, 약관 변경에
                  동의한 것으로 간주됩니다.
                </li>
              </ul>
            </div>
          </section>

          {/* 제4조: 서비스 이용계약의 체결 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제4조 (서비스 이용계약의 체결)
            </h2>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
              <ul className="space-y-3 list-decimal list-inside ml-2">
                <li>
                  서비스 이용계약은 이용자가 본 약관의 내용에 동의한 후,
                  회원가입 신청을 하고 운영자가 이를 승낙함으로써 체결됩니다.
                </li>
                <li>
                  회원가입은 Google 계정 연동 방식으로 진행되며, 이용자는
                  정확하고 최신의 정보를 제공해야 합니다.
                </li>
                <li>
                  비회원(게스트)의 경우, 서비스 이용 시작과 동시에 본 약관에
                  동의한 것으로 간주됩니다.
                </li>
                <li>
                  운영자는 다음 각 호에 해당하는 경우 이용신청을 거절하거나
                  사후에 이용계약을 해지할 수 있습니다:
                  <ul className="mt-2 ml-6 space-y-1 list-disc">
                    <li>타인의 정보를 도용하거나 허위 정보를 기재한 경우</li>
                    <li>서비스 운영을 방해할 목적으로 신청한 경우</li>
                    <li>관련 법령 또는 본 약관을 위반한 경우</li>
                    <li>
                      기타 운영자가 합리적 판단에 의해 필요하다고 인정하는 경우
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </section>

          {/* 제5조: 계정 관리 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제5조 (계정 관리)
            </h2>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
              <ul className="space-y-3 list-decimal list-inside ml-2">
                <li>
                  이용자는 자신의 계정 정보를 안전하게 관리할 책임이 있으며,
                  계정의 무단 사용에 대한 책임은 이용자 본인에게 있습니다.
                </li>
                <li>
                  이용자는 계정이 무단으로 사용되고 있음을 인지한 경우, 즉시
                  운영자에게 통지해야 합니다.
                </li>
                <li>
                  이용자는 계정을 제3자에게 양도, 대여하거나 담보로 제공할 수
                  없습니다.
                </li>
                <li>
                  운영자는 이용자의 계정 정보가 도용되거나 제3자가 사용하고
                  있음을 인지한 경우, 즉시 해당 계정의 이용을 정지할 수
                  있습니다.
                </li>
              </ul>
            </div>
          </section>

          {/* 제6조: 서비스의 제공 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제6조 (서비스의 제공)
            </h2>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
              <p>운영자는 이용자에게 다음과 같은 서비스를 제공합니다:</p>
              <ul className="space-y-2 ml-6 list-disc">
                <li>AI 기반 강남대학교 학사정보 질의응답 서비스</li>
                <li>학사일정, 수강신청, 졸업요건 등 학사 관련 정보 안내</li>
                <li>개인화된 학사 일정 알림 및 안내</li>
                <li>대화 이력 저장 및 관리 (회원 한정)</li>
                <li>기타 운영자가 정하는 서비스</li>
              </ul>
              <p className="mt-4">
                서비스는 연중무휴 24시간 제공을 원칙으로 합니다. 다만, 다음의
                경우 서비스 제공이 일시적으로 중단될 수 있습니다:
              </p>
              <ul className="space-y-1 ml-6 list-disc">
                <li>시스템 정기점검, 긴급점검 또는 설비 보수 시</li>
                <li>서비스 업그레이드 또는 기능 개선 작업 시</li>
                <li>천재지변, 정전, 통신장애 등 불가항력적 사유 발생 시</li>
                <li>외부 API(AI 모델, 학사정보 시스템 등) 장애 발생 시</li>
              </ul>
            </div>
          </section>

          {/* 제7조: AI 서비스의 특성 및 한계 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제7조 (AI 서비스의 특성 및 한계)
            </h2>
            <div className="bg-yellow-50/70 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800 mb-4">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
                ⚠️ 중요: AI 서비스 이용 시 반드시 숙지해 주세요
              </p>
            </div>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
              <ul className="space-y-3 list-decimal list-inside ml-2">
                <li>
                  <strong>AI 생성 콘텐츠:</strong> 본 서비스는 인공지능(AI)
                  기술을 활용하여 응답을 생성합니다. 이용자는 본 서비스가 사람이
                  아닌 AI와의 대화임을 인지해야 합니다.
                </li>
                <li>
                  <strong>정확성 미보장:</strong> AI가 생성한 응답은
                  부정확하거나, 불완전하거나, 오래된 정보를 포함할 수 있습니다.
                  중요한 학사 결정(수강신청, 졸업요건, 휴학 등)은 반드시{" "}
                  <strong>
                    강남대학교 공식 홈페이지, 학사지원팀, 또는 담당 부서
                  </strong>
                  를 통해 확인하시기 바랍니다.
                </li>
                <li>
                  <strong>전문 조언 아님:</strong> AI 응답은 법률, 의료, 재정 등
                  전문적인 조언을 대체하지 않습니다. 전문적인 사안에 대해서는
                  해당 분야 전문가와 상담하시기 바랍니다.
                </li>
                <li>
                  <strong>편향 가능성:</strong> AI 모델은 학습 데이터에 내재된
                  편향을 반영할 수 있으며, 운영자는 이를 최소화하기 위해
                  지속적으로 노력합니다.
                </li>
                <li>
                  <strong>실시간 정보 한계:</strong> AI는 학습된 데이터를
                  기반으로 응답하므로, 최신 공지사항이나 실시간 정보를 반영하지
                  못할 수 있습니다.
                </li>
                <li>
                  <strong>이용자 검증 의무:</strong> 이용자는 AI 응답의 정확성과
                  적합성을 스스로 검증해야 하며, AI 응답에 대한 전적인 의존은
                  권장되지 않습니다.
                </li>
              </ul>
            </div>
          </section>

          {/* 제8조: 이용자의 의무 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제8조 (이용자의 의무)
            </h2>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
              <p>이용자는 다음 각 호의 행위를 하여서는 안 됩니다:</p>
              <ul className="space-y-2 ml-6 list-decimal">
                <li>회원가입 또는 변경 시 허위 정보를 등록하는 행위</li>
                <li>타인의 개인정보, 계정, 아이디 등을 도용하는 행위</li>
                <li>운영자 또는 제3자의 지적재산권을 침해하는 행위</li>
                <li>
                  운영자 또는 제3자의 명예를 훼손하거나 업무를 방해하는 행위
                </li>
                <li>
                  서비스를 통해 다음의 콘텐츠를 입력하거나 배포하는 행위:
                  <ul className="mt-2 ml-4 space-y-1 list-disc">
                    <li>음란물, 폭력적, 혐오적, 차별적인 내용</li>
                    <li>불법적이거나 사기성이 있는 내용</li>
                    <li>악성코드, 바이러스 등 유해 프로그램</li>
                    <li>허위사실 또는 기만적인 정보</li>
                  </ul>
                </li>
                <li>
                  서비스의 안정적 운영을 방해하거나 과도한 부하를 유발하는 행위
                </li>
                <li>
                  자동화된 수단(봇, 스크래퍼 등)을 이용하여 서비스에 접근하는
                  행위
                </li>
                <li>AI 시스템을 악용하여 유해한 콘텐츠를 생성하려는 시도</li>
                <li>
                  서비스의 보안 취약점을 탐지, 스캔, 테스트하거나 악용하는 행위
                </li>
                <li>기타 관련 법령 또는 본 약관을 위반하는 행위</li>
              </ul>
            </div>
          </section>

          {/* 제9조: 지적재산권 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제9조 (지적재산권)
            </h2>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
              <ul className="space-y-3 list-decimal list-inside ml-2">
                <li>
                  <strong>서비스 소유권:</strong> 서비스의 디자인, 소스코드,
                  로고, 상표, UI/UX 및 서비스 운영에 사용되는 모든 지적재산권은
                  운영자에게 귀속됩니다.
                </li>
                <li>
                  <strong>이용자 콘텐츠:</strong> 이용자가 서비스에 입력하는
                  질문, 텍스트 등의 콘텐츠에 대한 소유권은 이용자에게 있습니다.
                </li>
                <li>
                  <strong>AI 응답:</strong> AI가 생성한 응답은 이용자가 개인적,
                  비상업적 용도로 자유롭게 사용할 수 있습니다. 다만, 상업적
                  목적으로 사용하고자 하는 경우 사전에 운영자의 동의를 받아야
                  합니다.
                </li>
                <li>
                  <strong>서비스 개선 활용:</strong> 운영자는 서비스 품질 향상
                  및 AI 모델 개선을 위해 익명화된 이용자 상호작용 데이터를
                  활용할 수 있습니다. 개인을 식별할 수 있는 정보는 제외됩니다.
                </li>
                <li>
                  이용자는 서비스를 이용함으로써 얻은 정보를 운영자의 사전 승낙
                  없이 복제, 송신, 출판, 배포, 방송 기타 방법으로 영리 목적으로
                  이용하거나 제3자에게 제공할 수 없습니다.
                </li>
              </ul>
            </div>
          </section>

          {/* 제10조: 서비스 이용 제한 및 계정 정지 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제10조 (서비스 이용 제한 및 계정 정지)
            </h2>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
              <ul className="space-y-3 list-decimal list-inside ml-2">
                <li>
                  운영자는 이용자가 본 약관을 위반하거나 서비스의 정상적인
                  운영을 방해한 경우, 사전 통지 없이 서비스 이용을 제한하거나
                  계정을 정지·삭제할 수 있습니다.
                </li>
                <li>
                  운영자는 다음 각 호의 경우 이용자에게 사전 통지 후 서비스
                  이용을 제한할 수 있습니다:
                  <ul className="mt-2 ml-6 space-y-1 list-disc">
                    <li>
                      서비스 관련 설비의 보수 등 공사로 인한 부득이한 경우
                    </li>
                    <li>
                      이용자의 과도한 서비스 사용으로 시스템에 무리가 가는 경우
                    </li>
                    <li>
                      기타 운영자가 서비스 운영상 필요하다고 판단하는 경우
                    </li>
                  </ul>
                </li>
                <li>
                  계정 정지 또는 삭제 시, 해당 계정과 관련된 데이터(대화 이력
                  등)는 복구되지 않을 수 있습니다.
                </li>
                <li>
                  이용자는 이용 제한에 대해 이의가 있는 경우, 운영자에게
                  이의신청을 할 수 있으며, 운영자는 정당한 사유가 인정되는 경우
                  이용 제한을 해제합니다.
                </li>
              </ul>
            </div>
          </section>

          {/* 제11조: 서비스의 변경 및 중단 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제11조 (서비스의 변경 및 중단)
            </h2>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
              <ul className="space-y-3 list-decimal list-inside ml-2">
                <li>
                  운영자는 운영상, 기술상의 필요에 따라 제공하고 있는 서비스의
                  전부 또는 일부를 변경하거나 중단할 수 있습니다.
                </li>
                <li>
                  서비스의 내용, 이용방법, 이용시간에 대한 변경이 있는 경우에는
                  변경사유, 변경될 서비스의 내용 및 제공일자 등을 그 변경 전에
                  서비스 내에 공지합니다.
                </li>
                <li>
                  운영자는 무료로 제공되는 서비스의 일부 또는 전부를 운영자의
                  정책 및 운영의 필요상 수정, 중단, 변경할 수 있으며, 이에
                  대하여 관련 법령에 특별한 규정이 없는 한 이용자에게 별도의
                  보상을 하지 않습니다.
                </li>
              </ul>
            </div>
          </section>

          {/* 제12조: 면책조항 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제12조 (면책조항)
            </h2>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
              <ul className="space-y-3 list-decimal list-inside ml-2">
                <li>
                  운영자는 천재지변, 전쟁, 기간통신사업자의 서비스 중지, 해킹,
                  기타 불가항력적인 사유로 인하여 서비스를 제공할 수 없는 경우
                  서비스 제공에 대한 책임이 면제됩니다.
                </li>
                <li>
                  운영자는 이용자의 귀책사유로 인한 서비스의 이용장애에 대하여
                  책임을 지지 않습니다.
                </li>
                <li>
                  <strong>AI 응답 면책:</strong> 운영자는 AI가 생성한 응답의
                  정확성, 완전성, 적시성, 적합성에 대하여 어떠한 보증도 하지
                  않습니다. 이용자가 AI 응답에 의존하여 발생한 손해에 대하여
                  운영자는 책임을 지지 않습니다.
                </li>
                <li>
                  운영자는 이용자가 서비스 이용과 관련하여 기대하는 수익을 얻지
                  못하거나 상실한 것에 대하여 책임을 지지 않습니다.
                </li>
                <li>
                  운영자는 이용자 상호 간 또는 이용자와 제3자 상호 간에 서비스를
                  매개로 발생한 분쟁에 대하여 개입할 의무가 없으며, 이로 인한
                  손해를 배상할 책임이 없습니다.
                </li>
                <li>
                  본 서비스는 "있는 그대로(AS-IS)" 제공되며, 운영자는 서비스의
                  무결성, 무중단성, 상품성, 특정 목적에 대한 적합성에 대해
                  명시적 또는 묵시적 보증을 하지 않습니다.
                </li>
              </ul>
            </div>
          </section>

          {/* 제13조: 손해배상 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제13조 (손해배상)
            </h2>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
              <ul className="space-y-3 list-decimal list-inside ml-2">
                <li>
                  운영자의 책임 있는 사유로 이용자에게 손해가 발생한 경우,
                  운영자는 이용자에게 실제 발생한 직접적인 손해에 한하여
                  배상합니다.
                </li>
                <li>
                  <strong>책임 제한:</strong> 어떠한 경우에도 운영자의 총
                  손해배상 책임은 해당 이용자가 서비스 이용과 관련하여 지불한
                  금액을 초과하지 않습니다. 무료 서비스의 경우, 운영자의
                  손해배상 책임은 법률이 허용하는 최대 범위 내에서 제한됩니다.
                </li>
                <li>
                  운영자는 간접손해, 특별손해, 결과적 손해, 징벌적 손해,
                  일실이익에 대하여 책임을 지지 않습니다.
                </li>
                <li>
                  이용자가 본 약관을 위반하여 운영자에게 손해를 발생시킨 경우,
                  이용자는 운영자의 손해를 배상하여야 합니다.
                </li>
              </ul>
            </div>
          </section>

          {/* 제14조: 개인정보 보호 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제14조 (개인정보 보호)
            </h2>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
              <ul className="space-y-3 list-decimal list-inside ml-2">
                <li>
                  운영자는 「개인정보 보호법」, 「정보통신망 이용촉진 및
                  정보보호 등에 관한 법률」 등 관련 법령에 따라 이용자의
                  개인정보를 보호합니다.
                </li>
                <li>
                  개인정보의 수집·이용·제공·관리에 관한 구체적인 사항은 별도의
                  <Link
                    to="/privacy"
                    className="text-blue-600 font-medium underline hover:text-blue-800 mx-1"
                  >
                    개인정보처리방침
                  </Link>
                  에서 정합니다.
                </li>
                <li>
                  이용자는 서비스 이용 시 민감한 개인정보(주민등록번호,
                  금융정보, 의료정보 등)를 입력하지 않도록 주의해야 합니다. AI
                  대화 내용은 암호화되어 저장되지만, 이용자가 입력한 민감정보에
                  대한 책임은 이용자에게 있습니다.
                </li>
                <li>
                  운영자는 서비스 개선 목적으로 익명화된 대화 데이터를 분석할 수
                  있습니다.
                </li>
              </ul>
            </div>
          </section>

          {/* 제15조: 분쟁 해결 및 준거법 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제15조 (분쟁 해결 및 준거법)
            </h2>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
              <ul className="space-y-3 list-decimal list-inside ml-2">
                <li>본 약관은 대한민국 법률에 따라 규율되고 해석됩니다.</li>
                <li>
                  서비스 이용과 관련하여 운영자와 이용자 사이에 분쟁이 발생한
                  경우, 양 당사자는 분쟁 해결을 위해 성실히 협의합니다.
                </li>
                <li>
                  협의에도 불구하고 분쟁이 해결되지 않는 경우, 「민사소송법」에
                  따른 관할 법원에 소를 제기할 수 있습니다.
                </li>
                <li>
                  운영자와 이용자 간에 제기된 소송에는 대한민국 법을 적용합니다.
                </li>
              </ul>
            </div>
          </section>

          {/* 제16조: 연락처 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              제16조 (연락처)
            </h2>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
              <p>
                서비스 이용에 관한 문의, 불만사항 처리, 피해구제 등은 아래
                연락처로 문의하시기 바랍니다:
              </p>
              <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4 mt-3 space-y-2">
                <p>
                  <strong>서비스명:</strong> 강냉봇 (GangNaengBot)
                </p>
                <p>
                  <strong>이메일:</strong> contact@gangnengbot.com
                </p>
                <p>
                  <strong>운영시간:</strong> 평일 09:00 - 18:00 (공휴일 제외)
                </p>
              </div>
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
              <p>본 약관은 2025년 12월 10일부터 시행됩니다.</p>

              <p className="mt-4">
                <strong>제2조 (경과조치)</strong>
              </p>
              <p>
                본 약관 시행 전에 가입한 회원에게도 본 약관이 적용됩니다. 다만,
                본 약관 시행 전에 발생한 사안에 대해서는 종전의 약관을
                적용합니다.
              </p>
            </div>
          </section>

          {/* 개정이력 */}
          <section className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              약관 개정이력
            </h3>
            <ul className="text-gray-500 dark:text-gray-400 text-sm space-y-1">
              <li>
                • 2025년 12월 10일: 이용약관 전면 개정 (AI 서비스 조항 추가,
                면책조항 강화)
              </li>
              <li>• 2024년 12월 10일: 최초 제정</li>
            </ul>
          </section>

          {/* 최종 업데이트 */}
          <section className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-gray-400 dark:text-gray-500 text-xs text-center">
              최종 업데이트: 2025년 12월 10일
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};
