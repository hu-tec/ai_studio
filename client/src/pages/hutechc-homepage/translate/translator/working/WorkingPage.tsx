/* 원본: hutechc_hompage_real/app/translate/translator/working/page.tsx */
import { useTranslator, type WorkingRequest } from '../../../lib/translatorContext';

type UrgencyTier = 'normal' | 'urgent1' | 'urgent2'; // normal: 일반(5일+), urgent1: 긴급1(3일), urgent2: 긴급2(1일)

export default function WorkingPage() {
  const { workingRequests, removeWorkingRequest } = useTranslator();
  const handleSubmit = (id: string) => {
    removeWorkingRequest(id);
    alert('번역을 제출했습니다. 의뢰자의 최종 확인을 기다리고 있습니다.');
  };

  const getUrgencyInfo = (tier: UrgencyTier) => {
    const tierInfo = {
      normal: { label: '일반', color: 'bg-gray-100 text-gray-700', icon: '📋' },
      urgent1: { label: '🔴 긴급1 (3일, +30%)', color: 'bg-orange-100 text-orange-700', icon: '⏰' },
      urgent2: { label: '🟠 긴급2 (1일, +50%)', color: 'bg-red-100 text-red-700', icon: '⚠️' },
    };
    return tierInfo[tier];
  };

  const daysRemaining = (deadline: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateTotalDays = (createdAt: string, deadline: string) => {
    const created = new Date(createdAt);
    const dead = new Date(deadline);
    const diffTime = dead.getTime() - created.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">진행 중인 번역</h1>
        <p className="text-gray-600">현재 진행하고 있는 번역 프로젝트를 관리하세요</p>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
          <div className="text-sm text-gray-600 mb-1">진행 중인 작업</div>
          <div className="text-3xl font-bold text-blue-600">{workingRequests.length}건</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 p-6">
          <div className="text-sm text-gray-600 mb-1">예상 수익</div>
          <div className="text-3xl font-bold text-yellow-600">
            ₩{workingRequests.reduce((sum, r) => sum + r.price, 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
          <div className="text-sm text-gray-600 mb-1">평균 진행도</div>
          <div className="text-3xl font-bold text-green-600">
            {Math.round(workingRequests.reduce((sum, r) => sum + r.progress, 0) / workingRequests.length || 0)}%
          </div>
        </div>
      </div>

      {/* 작업 목록 */}
      <div className="space-y-4">
        {workingRequests.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-4xl mb-2">🎉</div>
            <div className="text-gray-600">현재 진행 중인 번역이 없습니다.</div>
          </div>
        ) : (
          workingRequests.map((request) => {
            const remaining = daysRemaining(request.deadline);
            const urgencyInfo = getUrgencyInfo(request.urgencyTier);
            const totalDays = calculateTotalDays(request.createdAt, request.deadline);

            return (
              <div
                key={request.id}
                className={`bg-white rounded-lg border-2 p-6 hover:shadow-md transition-shadow ${
                  request.urgencyTier === 'urgent2'
                    ? 'border-red-300'
                    : request.urgencyTier === 'urgent1'
                    ? 'border-orange-300'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{request.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap ${urgencyInfo.color}`}>
                        {urgencyInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{request.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-indigo-600">₩{request.price.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">예상 수익</div>
                  </div>
                </div>

                {/* 긴급 티어별 타임라인 정보 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-blue-900">📅 타임라인</span>
                      <span className="text-blue-700">{request.createdAt} → {request.deadline} (총 {totalDays}일)</span>
                    </div>
                    <div className={`font-bold ${
                      remaining <= 1
                        ? 'text-red-600'
                        : remaining <= 3
                        ? 'text-orange-600'
                        : 'text-green-600'
                    }`}>
                      {remaining > 0 ? `남은 시간: ${remaining}일` : '⏰ 오늘이 마감입니다!'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">언어</div>
                    <div className="font-semibold text-gray-900">{request.language}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">분야</div>
                    <div className="font-semibold text-gray-900">{request.field}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">분량</div>
                    <div className="font-semibold text-gray-900">{request.wordCount.toLocaleString()}단어</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">의뢰자</div>
                    <div className="font-semibold text-gray-900">{request.clientName}</div>
                  </div>
                </div>

                {/* 진행도 바 */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">진행도</span>
                    <span className="text-sm font-bold text-indigo-600">{request.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300"
                      style={{ width: `${request.progress}%` }}
                    ></div>
                  </div>
                </div>


                {/* 액션 버튼 */}
                <div className="flex gap-3">
                  {request.progress < 100 ? (
                    <>
                      <button className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 transition-colors">
                        ✏️ 번역 편집
                      </button>
                      <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md font-semibold hover:bg-gray-50 transition-colors">
                        진행도 업데이트
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleSubmit(request.id)}
                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition-colors"
                      >
                        ✅ 완료 제출
                      </button>
                      <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md font-semibold hover:bg-gray-50 transition-colors">
                        상세 보기
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
