/* 원본: hutechc_hompage_real/app/(client-layout)/admin/translators/page.tsx */
import { Link } from 'react-router';
import { useState, useMemo } from 'react';
import { adminTranslators, type AdminTranslator } from '../../lib/adminTranslatorsMock';

export default function TranslatorsPage() {
  const [filters, setFilters] = useState({
    level: '',
    expertType: '',
    time: '',
    serviceType: '',
    workUnit: '',
    difficulty: '',
    area: '',
    minRating: '',
    minCompletedCount: '',
    searchName: '',
  });

  // 필터링된 번역사 목록
  const filteredTranslators = useMemo(() => {
    return adminTranslators.filter((translator) => {
      // 이름 검색
      if (filters.searchName && !translator.name.includes(filters.searchName)) {
        return false;
      }

      // 레벨 필터
      if (filters.level && translator.level !== filters.level) {
        return false;
      }

      // 전문가 구분 필터
      if (filters.expertType && translator.expertType !== filters.expertType) {
        return false;
      }

      // 활동 가능 시간 필터
      if (filters.time && translator.time !== filters.time) {
        return false;
      }

      // 서비스 유형 필터
      if (filters.serviceType && translator.serviceType !== filters.serviceType) {
        return false;
      }

      // 작업 단위 필터
      if (filters.workUnit && translator.workUnit !== filters.workUnit) {
        return false;
      }

      // 난이도 필터
      if (filters.difficulty && translator.difficulty !== filters.difficulty) {
        return false;
      }

      // 전문 영역 필터
      if (filters.area && translator.area !== filters.area) {
        return false;
      }

      // 최소 평점 필터
      if (filters.minRating && translator.rating < parseFloat(filters.minRating)) {
        return false;
      }

      // 최소 완료 수 필터
      if (filters.minCompletedCount && translator.completedCount < parseInt(filters.minCompletedCount)) {
        return false;
      }

      return true;
    });
  }, [filters]);

  // 고유한 값들 추출 (필터 옵션용)
  const uniqueLevels = useMemo(() => Array.from(new Set(adminTranslators.map(t => t.level))).sort(), []);
  const uniqueExpertTypes = useMemo(() => Array.from(new Set(adminTranslators.map(t => t.expertType))), []);
  const uniqueTimes = useMemo(() => Array.from(new Set(adminTranslators.map(t => t.time))), []);
  const uniqueServiceTypes = useMemo(() => Array.from(new Set(adminTranslators.map(t => t.serviceType))), []);
  const uniqueWorkUnits = useMemo(() => Array.from(new Set(adminTranslators.map(t => t.workUnit))), []);
  const uniqueDifficulties = useMemo(() => Array.from(new Set(adminTranslators.map(t => t.difficulty))), []);
  const uniqueAreas = useMemo(() => Array.from(new Set(adminTranslators.map(t => t.area))).sort(), []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      level: '',
      expertType: '',
      time: '',
      serviceType: '',
      workUnit: '',
      difficulty: '',
      area: '',
      minRating: '',
      minCompletedCount: '',
      searchName: '',
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">현재 번역사 리스트</h1>
        <p className="text-sm text-gray-600">
          플랫폼에 등록된 번역사 목록을 확인하고, 레벨·전문분야·활동 가능 시간 정보를 한 눈에 볼 수 있습니다.
        </p>
      </div>

      {/* 필터 섹션 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">필터</h2>
          <button
            onClick={resetFilters}
            className="text-xs text-gray-600 hover:text-gray-900 underline"
          >
            초기화
          </button>
        </div>

        {/* 한 줄 필터 */}
        <div className="overflow-x-auto">
          <div className="inline-flex gap-3 min-w-max pb-2">
            {/* 이름 검색 */}
            <div className="flex-shrink-0">
              <input
                type="text"
                value={filters.searchName}
                onChange={(e) => handleFilterChange('searchName', e.target.value)}
                placeholder="이름 검색"
                className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* 레벨 필터 */}
            <div className="flex-shrink-0">
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">레벨 전체</option>
                {uniqueLevels.map(level => (
                  <option key={level} value={level}>{level}등급</option>
                ))}
              </select>
            </div>

            {/* 전문가 구분 필터 */}
            <div className="flex-shrink-0">
              <select
                value={filters.expertType}
                onChange={(e) => handleFilterChange('expertType', e.target.value)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">전문가 전체</option>
                {uniqueExpertTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* 활동 가능 시간 필터 */}
            <div className="flex-shrink-0">
              <select
                value={filters.time}
                onChange={(e) => handleFilterChange('time', e.target.value)}
                className="w-36 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">시간 전체</option>
                {uniqueTimes.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            {/* 서비스 유형 필터 */}
            <div className="flex-shrink-0">
              <select
                value={filters.serviceType}
                onChange={(e) => handleFilterChange('serviceType', e.target.value)}
                className="w-36 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">서비스 전체</option>
                {uniqueServiceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* 작업 단위 필터 */}
            <div className="flex-shrink-0">
              <select
                value={filters.workUnit}
                onChange={(e) => handleFilterChange('workUnit', e.target.value)}
                className="w-28 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">단위 전체</option>
                {uniqueWorkUnits.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            {/* 난이도 필터 */}
            <div className="flex-shrink-0">
              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">난이도 전체</option>
                {uniqueDifficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>

            {/* 전문 영역 필터 */}
            <div className="flex-shrink-0">
              <select
                value={filters.area}
                onChange={(e) => handleFilterChange('area', e.target.value)}
                className="w-28 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">영역 전체</option>
                {uniqueAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            {/* 최소 평점 필터 */}
            <div className="flex-shrink-0">
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                placeholder="최소 평점"
                className="w-28 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* 최소 완료 수 필터 */}
            <div className="flex-shrink-0">
              <input
                type="number"
                min="0"
                value={filters.minCompletedCount}
                onChange={(e) => handleFilterChange('minCompletedCount', e.target.value)}
                placeholder="최소 완료수"
                className="w-28 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* 필터 결과 표시 */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            검색 결과: <span className="font-semibold text-purple-600">{filteredTranslators.length}명</span> / 전체 {adminTranslators.length}명
          </p>
        </div>
      </div>

      <div className="mt-4 bg-white border border-gray-200 rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">우선순위</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">이름</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">레벨</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 whitespace-nowrap">전문가 구분</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 whitespace-nowrap">활동 가능 시간</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 whitespace-nowrap">서비스 유형</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 whitespace-nowrap">작업 단위</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 whitespace-nowrap">난이도</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 whitespace-nowrap">전문 영역</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 whitespace-nowrap">평점 / 완료수</th>
            </tr>
          </thead>
          <tbody>
            {filteredTranslators.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                  필터 조건에 맞는 번역사가 없습니다.
                </td>
              </tr>
            ) : (
              filteredTranslators.map((t) => (
              <tr key={t.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="px-4 py-2 text-xs text-gray-500 text-center">{t.priority}</td>
                <td className="px-4 py-2 font-medium text-purple-700 text-center">
                  <Link to={`/hutechc-homepage/admin/translators/${t.id}`}
                    className="hover:underline"
                  >
                    {t.name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-center">
                  <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 whitespace-nowrap">
                    {t.level}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-700 whitespace-nowrap text-center">{t.expertType}</td>
                <td className="px-4 py-2 text-gray-700 whitespace-nowrap text-center">{t.time}</td>
                <td className="px-4 py-2 text-gray-700 whitespace-nowrap text-center">{t.serviceType}</td>
                <td className="px-4 py-2 text-gray-700 text-center">{t.workUnit}</td>
                <td className="px-4 py-2 text-gray-700 text-center">{t.difficulty}</td>
                <td className="px-4 py-2 text-gray-700 text-center whitespace-nowrap">
                  {t.area} / {t.subArea}
                </td>
                <td className="px-4 py-2 text-gray-700 whitespace-nowrap text-center">
                  <span className="font-semibold text-yellow-600">{t.rating.toFixed(2)}★</span>
                  <span className="ml-1 text-xs text-gray-500">/ {t.completedCount}건</span>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
