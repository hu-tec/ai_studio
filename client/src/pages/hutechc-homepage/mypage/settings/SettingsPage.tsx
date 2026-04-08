/* 원본: hutechc_hompage_real/app/mypage/settings/page.tsx */
import { useState } from 'react';

interface NotificationSettings {
  문자: boolean;
  카카오톡: boolean;
  이메일: boolean;
  examRelatedAlerts: boolean;
  paymentRelatedAlerts: boolean;
  scheduleRelatedAlerts: boolean;
  marketingConsent: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings>({
    문자: false,
    카카오톡: false,
    이메일: false,
    examRelatedAlerts: false,
    paymentRelatedAlerts: false,
    scheduleRelatedAlerts: false,
    marketingConsent: false
  });

  const toggleSetting = (key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <span>홈</span>
        <span>{'>'}</span>
        <span>마이페이지</span>
        <span>{'>'}</span>
        <span className="text-gray-900 font-semibold">알림설정</span>
      </div>

      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-8 text-gray-900">알림설정</h1>

      <div className="space-y-6">
        {/* Notification Type Selection */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.문자}
                onChange={() => toggleSetting('문자')}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-semibold text-gray-700">문자</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.카카오톡}
                onChange={() => toggleSetting('카카오톡')}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-semibold text-gray-700">카카오톡</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.이메일}
                onChange={() => toggleSetting('이메일')}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-semibold text-gray-700">이메일</span>
            </label>
          </div>

          {/* Notification Toggles */}
          <div className="space-y-4">
            {/* Exam Related */}
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <span className="text-sm text-gray-700">시험 관련 알림 알림</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.examRelatedAlerts}
                  onChange={() => toggleSetting('examRelatedAlerts')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Payment Related */}
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <span className="text-sm text-gray-700">결제 관련 알림</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.paymentRelatedAlerts}
                  onChange={() => toggleSetting('paymentRelatedAlerts')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Schedule Related */}
            <div className="flex items-center justify-between py-4">
              <span className="text-sm text-gray-700">문의 관련 알림</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.scheduleRelatedAlerts}
                  onChange={() => toggleSetting('scheduleRelatedAlerts')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Marketing Consent */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={settings.marketingConsent}
              onChange={() => toggleSetting('marketingConsent')}
              className="w-5 h-5 mt-1 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">마케팅 메일에 수신 동의</span>
                <button className="text-blue-600 text-sm hover:underline">
                  전문보기
                </button>
              </div>
              <p className="text-sm text-gray-500">
                마케팅 메일에 수신에 동의하면 주소변 다양한 메뉴얼과 분석수 있습니다.
              </p>
              <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                저장
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
