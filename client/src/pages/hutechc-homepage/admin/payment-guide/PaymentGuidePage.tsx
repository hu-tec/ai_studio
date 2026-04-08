/* 원본: hutechc_hompage_real/app/(client-layout)/admin/payment-guide/page.tsx */
import { useNavigate } from 'react-router';
import { PriceProvider, usePrice } from '../../lib/priceContext';
function PaymentGuidePageInner() {
  const navigate = useNavigate();
  const { prices } = usePrice();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold">번역 서비스</div>
          <nav className="flex items-center gap-12">
            <a
              href="/client/request/new"
              className="text-gray-700 hover:text-gray-900 text-sm"
            >
              의뢰하기
            </a>
            <a
              href="/client/requests"
              className="text-gray-700 hover:text-gray-900 text-sm"
            >
              내 의뢰
            </a>
            <a href="#" className="text-gray-700 hover:text-gray-900 text-sm">
              문의
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              🔙
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">🏠</button>
            <button className="p-2 hover:bg-gray-100 rounded-full">👤</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-6">
          홈 &gt; 번역 의뢰하기 &gt; 결제 시스템 안내
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            💰 결제 시스템 안내
          </h1>
          <p className="text-gray-600 text-sm">
            번역 서비스의 요금 산정 방식을 자세히 안내합니다.
          </p>
        </div>

        {/* 1~6단계 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* 1. 번역 방식별 기본 요금 */}
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold text-blue-600 mb-3 pb-2 border-b-2 border-blue-50">
              1️⃣ 번역 방식별 기본 요금
            </h2>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-3 text-left font-semibold text-blue-600">
                    타입
                  </th>
                  <th className="py-2 px-3 text-left font-semibold text-blue-600">
                    단가
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-blue-50">
                  <td className="py-2 px-3">📝 번역사-텍스트</td>
                  <td className="py-2 px-3">₩{prices.translator_text}/단어</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-blue-50">
                  <td className="py-2 px-3">📝 번역사-음성</td>
                  <td className="py-2 px-3">₩{prices.translator_voice.toLocaleString()}/분</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-blue-50">
                  <td className="py-2 px-3">📝 번역사-동영상</td>
                  <td className="py-2 px-3">₩{prices.translator_video.toLocaleString()}/분</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-blue-50">
                  <td className="py-2 px-3">🤖 AI-텍스트</td>
                  <td className="py-2 px-3">₩{prices.ai_text}/글자</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-blue-50">
                  <td className="py-2 px-3">🤖 AI-음성</td>
                  <td className="py-2 px-3">₩{prices.ai_voice.toLocaleString()}/분</td>
                </tr>
                <tr className="hover:bg-blue-50">
                  <td className="py-2 px-3">🤖 AI-동영상</td>
                  <td className="py-2 px-3">₩{prices.ai_video.toLocaleString()}/분</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. 언어 티어별 계수 */}
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold text-blue-600 mb-3 pb-2 border-b-2 border-blue-50">
              2️⃣ 언어 티어별 계수
            </h2>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-3 text-left font-semibold text-blue-600">
                    티어
                  </th>
                  <th className="py-2 px-3 text-left font-semibold text-blue-600">
                    언어
                  </th>
                  <th className="py-2 px-3 text-left font-semibold text-blue-600">
                    계수
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-blue-50">
                  <td className="py-2 px-3">Tier 1</td>
                  <td className="py-2 px-3">한/영/일/중/스페인</td>
                  <td className="py-2 px-3">
                    <strong>×1.0</strong>
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-blue-50">
                  <td className="py-2 px-3">Tier 2</td>
                  <td className="py-2 px-3">프/독/러/베/태/아랍</td>
                  <td className="py-2 px-3">
                    <strong>×1.2</strong>
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-blue-50">
                  <td className="py-2 px-3">Tier 3</td>
                  <td className="py-2 px-3">포/이/터/네/스웨/폴</td>
                  <td className="py-2 px-3">
                    <strong>×1.5</strong>
                  </td>
                </tr>
                <tr className="hover:bg-blue-50">
                  <td className="py-2 px-3">Tier 4</td>
                  <td className="py-2 px-3">힌/인니/말/벵/우/페</td>
                  <td className="py-2 px-3">
                    <strong>×2.0</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. 전문 분야별 추가 요금 */}
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold text-blue-600 mb-3 pb-2 border-b-2 border-blue-50">
              3️⃣ 전문 분야별 추가 요금
            </h2>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-3 text-left font-semibold text-blue-600">
                    분야
                  </th>
                  <th className="py-2 px-3 text-left font-semibold text-blue-600">
                    추가 단가
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["일반", "₩0"],
                  ["마케팅", `+₩${prices.marketing}/단어`],
                  ["법률/계약", `+₩${prices.law}/단어`],
                  ["기술/IT", `+₩${prices.tech}/단어`],
                  ["학술/논문", `+₩${prices.academic}/단어`],
                  ["의료/제약", `+₩${prices.medical}/단어`],
                  ["금융", `+₩${prices.finance}/단어`],
                ].map(([field, price], idx) => (
                  <tr
                    key={idx}
                    className={`${
                      idx < 6 ? "border-b border-gray-100" : ""
                    } hover:bg-blue-50`}
                  >
                    <td className="py-2 px-3">{field}</td>
                    <td className="py-2 px-3">{price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. 번역사 레벨별 추가 요금 */}
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold text-blue-600 mb-3 pb-2 border-b-2 border-blue-50">
              4️⃣ 번역사 레벨별 추가 요금
            </h2>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-3 text-left font-semibold text-blue-600">
                    레벨
                  </th>
                  <th className="py-2 px-3 text-left font-semibold text-blue-600">
                    설명
                  </th>
                  <th className="py-2 px-3 text-left font-semibold text-blue-600">
                    추가
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["원어민", "원어민 번역사", "+50%"],
                  ["A등급", "5년+, 90점+", "+40%"],
                  ["B등급", "3년+, 80점+", "+25%"],
                  ["C등급", "1년+, 70점+", "+10%"],
                  ["신입", "시험 60점+", "+0%"],
                ].map(([level, desc, add], idx) => (
                  <tr
                    key={idx}
                    className={`${
                      idx < 4 ? "border-b border-gray-100" : ""
                    } hover:bg-blue-50`}
                  >
                    <td className="py-2 px-3">{level}</td>
                    <td className="py-2 px-3">{desc}</td>
                    <td className="py-2 px-3">
                      <strong>{add}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 5. 긴급도별 할증 */}
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold text-blue-600 mb-3 pb-2 border-b-2 border-blue-50">
              5️⃣ 긴급도별 할증
            </h2>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-3 text-left font-semibold text-blue-600">
                    긴급도
                  </th>
                  <th className="py-2 px-3 text-left font-semibold text-blue-600">
                    기간
                  </th>
                  <th className="py-2 px-3 text-left font-semibold text-blue-600">
                    할증률
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-blue-50">
                  <td className="py-2 px-3">일반</td>
                  <td className="py-2 px-3">5일+</td>
                  <td className="py-2 px-3">
                    <strong>+0%</strong>
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-blue-50">
                  <td className="py-2 px-3">긴급1</td>
                  <td className="py-2 px-3">3일</td>
                  <td className="py-2 px-3">
                    <strong>+30%</strong>
                  </td>
                </tr>
                <tr className="hover:bg-blue-50">
                  <td className="py-2 px-3">긴급2</td>
                  <td className="py-2 px-3">1일</td>
                  <td className="py-2 px-3">
                    <strong>+50%</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 6. 번역 타입별 추가 요금 */}
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold text-blue-600 mb-3 pb-2 border-b-2 border-blue-50">
              6️⃣ 번역 타입별 추가 요금
            </h2>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-3 text-left font-semibold text-blue-600">
                    타입
                  </th>
                  <th className="py-2 px-3 text-left font-semibold text-blue-600">
                    설명
                  </th>
                  <th className="py-2 px-3 text-left font-semibold text-blue-600">
                    추가
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-blue-50">
                  <td className="py-2 px-3">TTT</td>
                  <td className="py-2 px-3">텍스트→텍스트</td>
                  <td className="py-2 px-3">기본</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-blue-50">
                  <td className="py-2 px-3">STT</td>
                  <td className="py-2 px-3">음성→텍스트</td>
                  <td className="py-2 px-3">
                    <strong>+₩7k/분</strong>
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-blue-50">
                  <td className="py-2 px-3">TTS</td>
                  <td className="py-2 px-3">텍스트→음성</td>
                  <td className="py-2 px-3">
                    <strong>+₩5k/분</strong>
                  </td>
                </tr>
                <tr className="hover:bg-blue-50">
                  <td className="py-2 px-3">STS</td>
                  <td className="py-2 px-3">음성→음성</td>
                  <td className="py-2 px-3">
                    <strong>+₩10k/분</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 최종 금액 계산 공식 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-xl mb-6">
          <h3 className="text-2xl font-bold mb-6">📊 최종 금액 계산 공식</h3>

          {[
            {
              step: 1,
              title: "기본 금액 계산",
              desc: "(단어수 또는 글자수 또는 분) × 기본 단가",
            },
            {
              step: 2,
              title: "분야 요금 추가",
              desc: "기본 금액 + (단어수 × 분야별 추가 단가)",
            },
            {
              step: 3,
              title: "언어 티어 계수 적용",
              desc: "2단계 금액 × 언어 티어 계수",
            },
            {
              step: 4,
              title: "번역사 레벨 추가",
              desc: "3단계 금액 × 번역사 레벨별 추가 요금",
            },
            {
              step: 5,
              title: "긴급도 할증 적용",
              desc: "4단계 금액 × (1 + 긴급도%)",
            },
            {
              step: 6,
              title: "번역 타입 추가",
              desc: "5단계 금액 + 번역 타입별 추가 요금",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white bg-opacity-10 p-4 rounded-lg mb-3"
            >
              <strong>{item.step}단계:</strong> {item.title}
              <br />= {item.desc}
            </div>
          ))}

          <div className="mt-6 pt-6 border-t-2 border-white border-opacity-30 text-xl font-bold">
            <strong>최종 결제 금액</strong> = 6단계 금액 (VAT 별도)
          </div>
        </div>

        {/* 실제 계산 예시 */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <h2 className="text-2xl font-bold text-blue-600 mb-6 pb-3 border-b-2 border-blue-50">
            📋 실제 계산 예시
          </h2>

          {/* 예시 1 */}
          <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500 mb-6">
            <h4 className="text-xl font-bold text-blue-600 mb-4">
              예시 1: 법률 계약서 번역 (일반 의뢰)
            </h4>
            <ul className="space-y-2 mb-6">
              <li>✅ 번역 방식: 번역사 의뢰</li>
              <li>✅ 매체: 텍스트 문서 (2,500 단어)</li>
              <li>✅ 언어쌍: 한국어 → 영어 (Tier 1, ×1.0)</li>
              <li>✅ 분야: 법률/계약 (+₩{prices.law}/단어)</li>
              <li>✅ 번역사 레벨: A등급 (+40%)</li>
              <li>✅ 긴급도: 일반 (+0%)</li>
              <li>✅ 번역 타입: TTT (기본)</li>
            </ul>
            <div className="bg-white p-5 rounded-lg space-y-2">
              <p>
                <strong>1단계:</strong> 기본 금액 = 2,500 × ₩{prices.translator_text} = ₩{(2500 * prices.translator_text).toLocaleString()}
              </p>
              <p>
                <strong>2단계:</strong> 분야 추가 = ₩{(2500 * prices.translator_text).toLocaleString()} + (2,500 × ₩{prices.law}) = ₩{(2500 * (prices.translator_text + prices.law)).toLocaleString()}
              </p>
              <p>
                <strong>3단계:</strong> 언어 티어 = ₩{(2500 * (prices.translator_text + prices.law)).toLocaleString()} × 1.0 = ₩{(2500 * (prices.translator_text + prices.law)).toLocaleString()}
              </p>
              <p>
                <strong>4단계:</strong> 번역사 레벨 = ₩{(2500 * (prices.translator_text + prices.law)).toLocaleString()} × 1.4 = ₩{Math.round(2500 * (prices.translator_text + prices.law) * 1.4).toLocaleString()}
              </p>
              <p>
                <strong>5단계:</strong> 긴급도 = ₩{Math.round(2500 * (prices.translator_text + prices.law) * 1.4).toLocaleString()} × 1.0 = ₩{Math.round(2500 * (prices.translator_text + prices.law) * 1.4).toLocaleString()}
              </p>
              <p>
                <strong>6단계:</strong> 번역 타입 = ₩{Math.round(2500 * (prices.translator_text + prices.law) * 1.4).toLocaleString()} + ₩0 = ₩{Math.round(2500 * (prices.translator_text + prices.law) * 1.4).toLocaleString()}
              </p>
              <p className="mt-4 pt-4 border-t-2 border-blue-600 text-2xl font-bold text-blue-600">
                최종 금액: ₩{Math.round(2500 * (prices.translator_text + prices.law) * 1.4).toLocaleString()} (VAT 별도)
              </p>
            </div>
          </div>

          {/* 예시 2 */}
          <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500 mb-6">
            <h4 className="text-xl font-bold text-blue-600 mb-4">
              예시 2: 동영상 자막 번역 (긴급 의뢰)
            </h4>
            <ul className="space-y-2 mb-6">
              <li>✅ 번역 방식: 번역사 의뢰</li>
              <li>✅ 매체: 동영상 (20분)</li>
              <li>✅ 언어쌍: 한국어 → 일본어 (Tier 1, ×1.0)</li>
              <li>✅ 분야: 마케팅 (+₩{prices.marketing}/단어, 약 2000단어 추정)</li>
              <li>✅ 번역사 레벨: B등급 (+25%)</li>
              <li>✅ 긴급도: 긴급 1단계 (+{prices.urgent1}%)</li>
              <li>✅ 번역 타입: STT (음성인식 추가)</li>
            </ul>
            <div className="bg-white p-5 rounded-lg space-y-2">
              <p>
                <strong>1단계:</strong> 기본 금액 = 20분 × ₩{prices.translator_video.toLocaleString()} = ₩{(20 * prices.translator_video).toLocaleString()}
              </p>
              <p>
                <strong>2단계:</strong> 분야 추가 = ₩{(20 * prices.translator_video).toLocaleString()} + (2,000 × ₩{prices.marketing}) = ₩{((20 * prices.translator_video) + (2000 * prices.marketing)).toLocaleString()}
              </p>
              <p>
                <strong>3단계:</strong> 언어 티어 = ₩{((20 * prices.translator_video) + (2000 * prices.marketing)).toLocaleString()} × 1.0 = ₩{((20 * prices.translator_video) + (2000 * prices.marketing)).toLocaleString()}
              </p>
              <p>
                <strong>4단계:</strong> 번역사 레벨 = ₩{((20 * prices.translator_video) + (2000 * prices.marketing)).toLocaleString()} × 1.25 = ₩{Math.round(((20 * prices.translator_video) + (2000 * prices.marketing)) * 1.25).toLocaleString()}
              </p>
              <p>
                <strong>5단계:</strong> 긴급도 = ₩{Math.round(((20 * prices.translator_video) + (2000 * prices.marketing)) * 1.25).toLocaleString()} × (1 + {prices.urgent1}%) = ₩{Math.round(((20 * prices.translator_video) + (2000 * prices.marketing)) * 1.25 * (1 + prices.urgent1 / 100)).toLocaleString()}
              </p>
              <p>
                <strong>6단계:</strong> 번역 타입 = ₩{Math.round(((20 * prices.translator_video) + (2000 * prices.marketing)) * 1.25 * (1 + prices.urgent1 / 100)).toLocaleString()} + (20분 × ₩7,000) = ₩{(Math.round(((20 * prices.translator_video) + (2000 * prices.marketing)) * 1.25 * (1 + prices.urgent1 / 100)) + (20 * 7000)).toLocaleString()}
              </p>
              <p className="mt-4 pt-4 border-t-2 border-blue-600 text-2xl font-bold text-blue-600">
                최종 금액: ₩{(Math.round(((20 * prices.translator_video) + (2000 * prices.marketing)) * 1.25 * (1 + prices.urgent1 / 100)) + (20 * 7000)).toLocaleString()} (VAT 별도)
              </p>
            </div>
          </div>

          {/* 예시 3 */}
          <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500">
            <h4 className="text-xl font-bold text-blue-600 mb-4">
              예시 3: AI 번역 (빠른 처리)
            </h4>
            <ul className="space-y-2 mb-6">
              <li>✅ 번역 방식: AI 번역</li>
              <li>✅ 매체: 텍스트 (5,000 글자)</li>
              <li>✅ 언어쌍: 한국어 → 영어 (Tier 1, ×1.0)</li>
            </ul>
            <div className="bg-white p-5 rounded-lg space-y-2">
              <p>
                <strong>계산:</strong> 5,000 글자 × ₩{prices.ai_text} = ₩{(5000 * prices.ai_text).toLocaleString()}
              </p>
              <p className="mt-4 pt-4 border-t-2 border-blue-600 text-2xl font-bold text-blue-600">
                최종 금액: ₩{(5000 * prices.ai_text).toLocaleString()} (VAT 별도)
              </p>
              <p className="mt-3 text-gray-600 text-sm">
                * AI 번역은 추가 옵션이 적용되지 않습니다.
              </p>
            </div>
          </div>
        </div>

        {/* 돌아가기 버튼 */}
        <div className="text-center my-12">
          <button
            onClick={() => navigate(-1)}
            className="px-12 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← 의뢰 등록으로 돌아가기
          </button>
        </div>
      </main>
    </div>
  );
}

export default function PaymentGuidePage() {
  return <PriceProvider><PaymentGuidePageInner /></PriceProvider>;
}
