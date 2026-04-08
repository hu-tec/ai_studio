/* 원본: hutechc_hompage_real/app/translate/translator/settings/page.tsx */
import { useState } from 'react';
import { useLanguageConfig } from '../../../lib/languageConfig';

interface RequestSettings {
  autoMatch: boolean;
  sourceLanguages: string[];
  targetLanguages: string[];
  minLength: number; // 최소 글자수
  maxLength: number; // 최대 글자수
  categories: string[];
  minPrice: number;
}

const CATEGORIES = [
  { id: 'law', label: '법률' },
  { id: 'tech', label: '기술/IT' },
  { id: 'medical', label: '의료/제약' },
  { id: 'marketing', label: '마케팅' },
  { id: 'general', label: '일반' },
];

export default function SettingsPage() {
  const { languages } = useLanguageConfig();
  const enabledLanguages = languages.filter((l) => l.enabled);

  const [settings, setSettings] = useState<RequestSettings>({
    autoMatch: true,
    sourceLanguages: ['ko', 'en'],
    targetLanguages: ['en', 'ko'],
    minLength: 1000,
    maxLength: 50000,
    categories: ['law', 'tech', 'general'],
    minPrice: 100000,
  });

  const [isSaved, setIsSaved] = useState(true);
  const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false);
  const [isTargetDropdownOpen, setIsTargetDropdownOpen] = useState(false);

  const handleAutoMatchToggle = () => {
    setSettings({ ...settings, autoMatch: !settings.autoMatch });
    setIsSaved(false);
  };

  const handleSourceLanguageToggle = (lang: string) => {
    const updated = settings.sourceLanguages.includes(lang)
      ? settings.sourceLanguages.filter((l) => l !== lang)
      : [...settings.sourceLanguages, lang];
    setSettings({ ...settings, sourceLanguages: updated });
    setIsSaved(false);
  };

  const handleTargetLanguageToggle = (lang: string) => {
    const updated = settings.targetLanguages.includes(lang)
      ? settings.targetLanguages.filter((l) => l !== lang)
      : [...settings.targetLanguages, lang];
    setSettings({ ...settings, targetLanguages: updated });
    setIsSaved(false);
  };

  const handleCategoryToggle = (cat: string) => {
    const updated = settings.categories.includes(cat)
      ? settings.categories.filter((c) => c !== cat)
      : [...settings.categories, cat];
    setSettings({ ...settings, categories: updated });
    setIsSaved(false);
  };

  const handleSave = () => {
    // 실제로는 서버에 저장
    alert('설정이 저장되었습니다.');
    setIsSaved(true);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">번역 요청 설정</h1>
        <p className="text-gray-600">받고 싶은 번역 요청의 조건을 설정하세요</p>
      </div>

      {/* 자동 매칭 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">자동 매칭</h2>

        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div>
            <div className="font-semibold text-gray-900 mb-1">자동 매칭 활성화</div>
            <p className="text-sm text-gray-600">
              설정한 조건에 맞는 번역 요청이 들어오면 자동으로 매칭됩니다.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoMatch}
              onChange={handleAutoMatchToggle}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {settings.autoMatch && (
          <p className="text-sm text-green-600 mt-4 flex items-center gap-2">
            <span>✅</span> 자동 매칭이 활성화되었습니다. 조건에 맞는 요청이 자동으로 배정됩니다.
          </p>
        )}
      </div>

      {/* 언어 선택 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">선호하는 언어</h2>

        <div className="grid grid-cols-2 gap-8">
          {/* 출발 언어 */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-lg">출발 언어</h3>

            {/* 드롭다운 버튼 */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSourceDropdownOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <span className="text-gray-700">
                  {settings.sourceLanguages.length > 0
                    ? `선택된 언어 ${settings.sourceLanguages.length}개`
                    : '출발 언어를 선택하세요'}
                </span>
                <span className="ml-2 text-gray-400 text-xs">
                  {isSourceDropdownOpen ? '▲' : '▼'}
                </span>
              </button>

              {isSourceDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full max-h-48 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg text-sm">
              {enabledLanguages.filter(
                (lang) => !settings.sourceLanguages.includes(lang.code)
              ).map((lang) => (
                    <button
                      key={`source-${lang.code}`}
                      type="button"
                      onClick={() => {
                        handleSourceLanguageToggle(lang.code);
                        // 선택 후에도 드롭다운은 그대로 열어두고 싶으면 이 줄 제거
                        // setIsSourceDropdownOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-left hover:bg-indigo-50"
                    >
                      <span className="text-gray-900">{lang.name}</span>
                    </button>
                  ))}

                  {enabledLanguages.filter(
                    (lang) => !settings.sourceLanguages.includes(lang.code)
                  ).length === 0 && (
                    <div className="px-4 py-2 text-xs text-gray-400">
                      선택 가능한 언어가 없습니다.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 선택된 언어 태그 */}
            <div className="mt-3 flex flex-wrap gap-2">
              {settings.sourceLanguages.map((code) => {
                const lang = enabledLanguages.find((l) => l.code === code);
                if (!lang) return null;
                return (
                  <span
                    key={`selected-source-${code}`}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs border border-indigo-200"
                  >
                    {lang.name}
                    <button
                      type="button"
                      onClick={() => handleSourceLanguageToggle(code)}
                      className="ml-2 text-indigo-400 hover:text-indigo-700"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>

            {settings.sourceLanguages.length === 0 && (
              <p className="text-sm text-red-600 mt-3">최소 1개 이상 선택해주세요</p>
            )}
          </div>

          {/* 도착 언어 */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-lg">도착 언어</h3>

            {/* 드롭다운 버튼 */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTargetDropdownOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <span className="text-gray-700">
                  {settings.targetLanguages.length > 0
                    ? `선택된 언어 ${settings.targetLanguages.length}개`
                    : '도착 언어를 선택하세요'}
                </span>
                <span className="ml-2 text-gray-400 text-xs">
                  {isTargetDropdownOpen ? '▲' : '▼'}
                </span>
              </button>

              {isTargetDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full max-h-48 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg text-sm">
                  {enabledLanguages.filter(
                    (lang) => !settings.targetLanguages.includes(lang.code)
                  ).map((lang) => (
                    <button
                      key={`target-${lang.code}`}
                      type="button"
                      onClick={() => {
                        handleTargetLanguageToggle(lang.code);
                        // setIsTargetDropdownOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-left hover:bg-indigo-50"
                    >
                      <span className="text-gray-900">{lang.name}</span>
                    </button>
                  ))}

                  {enabledLanguages.filter(
                    (lang) => !settings.targetLanguages.includes(lang.code)
                  ).length === 0 && (
                    <div className="px-4 py-2 text-xs text-gray-400">
                      선택 가능한 언어가 없습니다.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 선택된 언어 태그 */}
            <div className="mt-3 flex flex-wrap gap-2">
              {settings.targetLanguages.map((code) => {
                const lang = enabledLanguages.find((l) => l.code === code);
                if (!lang) return null;
                return (
                  <span
                    key={`selected-target-${code}`}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs border border-indigo-200"
                  >
                    {lang.name}
                    <button
                      type="button"
                      onClick={() => handleTargetLanguageToggle(code)}
                      className="ml-2 text-indigo-400 hover:text-indigo-700"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>

            {settings.targetLanguages.length === 0 && (
              <p className="text-sm text-red-600 mt-3">최소 1개 이상 선택해주세요</p>
            )}
          </div>
        </div>
      </div>

      {/* 분야 선택 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">전문 분야</h2>

        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((cat) => (
            <label key={cat.id} className="flex items-center px-4 py-2 border border-gray-300 rounded-full hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={settings.categories.includes(cat.id)}
                onChange={() => handleCategoryToggle(cat.id)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="ml-2 font-medium text-gray-900">{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 분량 범위 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">번역 분량 범위</h2>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">최소 글자수</label>
            <input
              type="number"
              value={settings.minLength}
              onChange={(e) => {
                setSettings({ ...settings, minLength: Number(e.target.value) });
                setIsSaved(false);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-2">{settings.minLength.toLocaleString()}자 이상의 요청만 받습니다</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">최대 글자수</label>
            <input
              type="number"
              value={settings.maxLength}
              onChange={(e) => {
                setSettings({ ...settings, maxLength: Number(e.target.value) });
                setIsSaved(false);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-2">{settings.maxLength.toLocaleString()}자 이하의 요청을 받습니다</p>
          </div>
        </div>
      </div>

      {/* 최소 가격 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">최소 제시 금액</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">최소 가격</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={settings.minPrice}
              onChange={(e) => {
                setSettings({ ...settings, minPrice: Number(e.target.value) });
                setIsSaved(false);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-gray-600 font-medium">₩</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            이 금액 이상의 요청만 표시됩니다. (₩{settings.minPrice.toLocaleString()})
          </p>
        </div>
      </div>

      {/* 현재 설정 요약 */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">현재 설정</h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">자동 매칭:</span>
            <span className="ml-2 font-semibold text-gray-900">{settings.autoMatch ? '활성화' : '비활성화'}</span>
          </div>
          <div>
            <span className="text-gray-600">출발 언어:</span>
            <span className="ml-2 font-semibold text-gray-900">{settings.sourceLanguages.length}개 선택</span>
          </div>
          <div>
            <span className="text-gray-600">도착 언어:</span>
            <span className="ml-2 font-semibold text-gray-900">{settings.targetLanguages.length}개 선택</span>
          </div>
          <div>
            <span className="text-gray-600">분야:</span>
            <span className="ml-2 font-semibold text-gray-900">{settings.categories.length}개 선택</span>
          </div>
          <div>
            <span className="text-gray-600">분량:</span>
            <span className="ml-2 font-semibold text-gray-900">
              {settings.minLength.toLocaleString()} ~ {settings.maxLength.toLocaleString()}자
            </span>
          </div>
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-end gap-3">
        {!isSaved && (
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            설정 저장
          </button>
        )}
        {isSaved && (
          <div className="text-sm text-green-600 flex items-center gap-2">
            <span>✅</span> 설정이 저장되었습니다
          </div>
        )}
      </div>
    </div>
  );
}
