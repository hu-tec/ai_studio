/* 원본: hutechc_hompage_real/app/(client-layout)/admin/translators/[id]/page.tsx */
import { useParams } from 'react-router';
import { adminTranslators } from '../../../lib/adminTranslatorsMock';

export default function TranslatorsDetailPage() {
  const { id } = useParams();
  const numericId = Number(id);
  const translator = adminTranslators.find((t) => t.id === numericId);

  if (!translator) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">번역사 프로필</h1>
        <p className="text-sm text-gray-600">해당 ID의 번역사를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 상단 기본 정보 */}
      <div className="flex flex-col md:flex-row md:items-center gap-6 bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex-shrink-0">
          <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-200">
            <img
              src={translator.profileImageUrl}
              alt={translator.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{translator.name}</h1>
            <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
              레벨 {translator.level}
            </span>
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
              {translator.expertType}
            </span>
          </div>

          <div className="text-sm text-gray-700">
            <div>
              전문 영역: {translator.area} / {translator.subArea}
            </div>
            <div>활동 가능 시간: {translator.time}</div>
            <div>주요 서비스: {translator.serviceType}</div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div>
              <span className="font-semibold text-yellow-600">{translator.rating.toFixed(2)}★</span>
              <span className="ml-1 text-xs text-gray-500">/ {translator.completedCount}건 완료</span>
            </div>
          </div>
        </div>
      </div>

      {/* 서비스 가능 유형 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">서비스 가능 채널</h2>
          <div className="flex flex-wrap gap-2 text-xs">
            {translator.serviceChannels.map((channel) => (
              <span
                key={channel}
                className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-gray-700"
              >
                {channel}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">서비스 가능 업무 유형</h2>
          <div className="flex flex-wrap gap-2 text-xs">
            {translator.serviceTasks.map((task) => (
              <span
                key={task}
                className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-blue-700"
              >
                {task}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 전문가 레벨 설정표 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">전문가 레벨 설정 정보</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div>
            <dt className="text-gray-500 text-xs mb-0.5">업무 경력</dt>
            <dd className="text-gray-900">{translator.levelCriteria.careerYears}</dd>
          </div>
          <div>
            <dt className="text-gray-500 text-xs mb-0.5">학벌</dt>
            <dd className="text-gray-900">{translator.levelCriteria.education}</dd>
          </div>
          <div>
            <dt className="text-gray-500 text-xs mb-0.5">분야</dt>
            <dd className="text-gray-900">{translator.levelCriteria.field}</dd>
          </div>
          <div>
            <dt className="text-gray-500 text-xs mb-0.5">해외근무여부</dt>
            <dd className="text-gray-900">{translator.levelCriteria.overseasExperience}</dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-gray-500 text-xs mb-0.5">해당분야 경력</dt>
            <dd className="text-gray-900">{translator.levelCriteria.domainExperience}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
