/* 원본: hutechc_hompage_real/app/mypage/profile/page.tsx */
import { useState } from 'react';
import type { UserProfile } from '../../types/exam';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    email: 'email@naver.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    name: '',
    gender: '남자',
    phone: '010 - 1234 - 1234',
    emergencyPhone: '010 - 0000 - 0000',
    address: {
      country: '대한민국',
      region: '',
      city: ''
    },
    birthInfo: {
      birthDate: '',
      birthPlace: '',
      residentNumber: ''
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Profile updated:', profile);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <span>홈</span>
        <span>{'>'}</span>
        <span>마이페이지</span>
        <span>{'>'}</span>
        <span className="text-gray-900 font-semibold">프로필 관리</span>
      </div>

      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-8 text-gray-900">프로필 관리</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <button 
              type="button"
              className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <div className="text-sm text-gray-500">
            <p>• 10MB 미만의 JPG, GIF, PNG 파일로 가능</p>
            <p>• 보안 등급, 지적이하 사용</p>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">이메일</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({...profile, email: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="email@naver.com"
          />
        </div>

        {/* Password Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">현재 비밀번호</label>
          <input
            type="password"
            value={profile.currentPassword}
            onChange={(e) => setProfile({...profile, currentPassword: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="영문+숫자+특수기호"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">수정할 비밀번호</label>
          <input
            type="password"
            value={profile.newPassword}
            onChange={(e) => setProfile({...profile, newPassword: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="영문+숫자+특수기호"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">비밀번호 확인</label>
          <input
            type="password"
            value={profile.confirmPassword}
            onChange={(e) => setProfile({...profile, confirmPassword: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="영문+숫자+특수기호"
          />
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">이름</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({...profile, name: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="홍길동"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">성별</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="남자"
                checked={profile.gender === '남자'}
                onChange={(e) => setProfile({...profile, gender: e.target.value as '남자' | '여자'})}
                className="mr-2"
              />
              남자
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="여자"
                checked={profile.gender === '여자'}
                onChange={(e) => setProfile({...profile, gender: e.target.value as '남자' | '여자'})}
                className="mr-2"
              />
              여자
            </label>
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">연락처</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={profile.phone}
              onChange={(e) => setProfile({...profile, phone: e.target.value})}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="010 - 1234 - 1234"
            />
            <button
              type="button"
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
            >
              변경
            </button>
          </div>
        </div>

        {/* Emergency Phone */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">긴급 연락처</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={profile.emergencyPhone}
              onChange={(e) => setProfile({...profile, emergencyPhone: e.target.value})}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="010 - 0000 - 0000"
            />
            <button
              type="button"
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
            >
              변경
            </button>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">주소</label>
          <div className="space-y-2">
            <select
              value={typeof profile.address === 'object' ? profile.address.country : ''}
              onChange={(e) => setProfile({...profile, address: typeof profile.address === 'object' ? {...profile.address, country: e.target.value} : {country: e.target.value, region: '', city: ''}})}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="대한민국">대한민국</option>
              <option value="미국">미국</option>
              <option value="일본">일본</option>
            </select>
            <div className="flex gap-2">
              <input
                type="text"
                value={typeof profile.address === 'object' ? profile.address.region : ''}
                onChange={(e) => setProfile({...profile, address: typeof profile.address === 'object' ? {...profile.address, region: e.target.value} : {country: '', region: e.target.value, city: ''}})}
                placeholder="주소"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
              >
                검색
              </button>
            </div>
            <input
              type="text"
              value={typeof profile.address === 'object' ? profile.address.city : ''}
              onChange={(e) => setProfile({...profile, address: typeof profile.address === 'object' ? {...profile.address, city: e.target.value} : {country: '', region: '', city: e.target.value}})}
              placeholder="상세주소"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Birth Info */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">생년 정보</label>
          <div className="space-y-2">
            <select
              value={profile.birthInfo?.birthDate || ''}
              onChange={(e) => setProfile({...profile, birthInfo: {...(profile.birthInfo || {birthDate: '', birthPlace: '', residentNumber: ''}), birthDate: e.target.value}})}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">준비 서대</option>
              <option value="1990">1990년</option>
              <option value="1995">1995년</option>
            </select>
            <input
              type="text"
              value={profile.birthInfo?.birthPlace || ''}
              onChange={(e) => setProfile({...profile, birthInfo: {...(profile.birthInfo || {birthDate: '', birthPlace: '', residentNumber: ''}), birthPlace: e.target.value}})}
              placeholder="개인정보"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={profile.birthInfo?.residentNumber || ''}
              onChange={(e) => setProfile({...profile, birthInfo: {...(profile.birthInfo || {birthDate: '', birthPlace: '', residentNumber: ''}), residentNumber: e.target.value}})}
              placeholder="매크로"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700"
          >
            저장
          </button>
        </div>
      </form>
    </div>
  );
}
