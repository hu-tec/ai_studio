/* 원본: hutechc_hompage_real/app/(client-layout)/admin/admins/page.tsx */
import { Link } from 'react-router';
import { useState } from 'react';

interface CategoryItem {
  id: number;
  large: string;
  medium: string;
  small: string;
  pricingGroup: string;
  modificationDate: string;
}

export default function AdminsPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([
    { id: 1, large: '카테고리 대1', medium: '카테고리 중1', small: '카테고리 소1', pricingGroup: '일반', modificationDate: 'YYYY.MM.DD' },
    { id: 2, large: '', medium: '', small: '카테고리 소2', pricingGroup: '표준', modificationDate: 'YYYY.MM.DD' },
    { id: 3, large: '', medium: '', small: '카테고리 소3', pricingGroup: '표준', modificationDate: 'YYYY.MM.DD' },
    { id: 4, large: '카테고리 대2', medium: '', small: '카테고리 소4', pricingGroup: '일반', modificationDate: 'YYYY.MM.DD' },
    { id: 5, large: '카테고리 대1', medium: '카테고리 중1', small: '', pricingGroup: '일반', modificationDate: 'YYYY.MM.DD' },
    { id: 6, large: '카테고리 대3', medium: '카테고리 중3', small: '카테고리 소5', pricingGroup: '일반', modificationDate: 'YYYY.MM.DD' },
  ]);

  const [newCategory, setNewCategory] = useState({
    large: '',
    medium: '',
    small: '',
    pricingGroup: '',
    modificationDate: '',
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  const handleAdd = () => {
    if (!newCategory.small && !newCategory.medium && !newCategory.large) {
      alert('최소 하나의 카테고리를 입력해주세요.');
      return;
    }

    const newId = categories.length > 0 ? Math.max(...categories.map((c) => c.id)) + 1 : 1;
    const newItem: CategoryItem = {
      id: newId,
      large: newCategory.large,
      medium: newCategory.medium,
      small: newCategory.small,
      pricingGroup: newCategory.pricingGroup || '일반',
      modificationDate: newCategory.modificationDate || 'YYYY.MM.DD',
    };

    setCategories([...categories, newItem]);
    setNewCategory({
      large: '',
      medium: '',
      small: '',
      pricingGroup: '',
      modificationDate: '',
    });
  };

  const handleEdit = (item: CategoryItem) => {
    setEditingId(item.id);
    setEditingCategory({ ...item });
  };

  const handleSaveEdit = () => {
    if (editingId && editingCategory) {
      setCategories(
        categories.map((cat) => (cat.id === editingId ? editingCategory : cat))
      );
      setEditingId(null);
      setEditingCategory(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingCategory(null);
  };

  const handleDelete = (id: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setCategories(categories.filter((cat) => cat.id !== id));
    }
  };

  const handleSave = () => {
    alert('저장되었습니다.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="검색"
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">관리자</div>
            <button className="text-sm text-gray-600 hover:text-gray-900">로그아웃</button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-16 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] flex flex-col items-center py-4 gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/hutechc-homepage/admin/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
          <Link to="/hutechc-homepage/admin/members" className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-[1600px] mx-auto px-6 py-6">
          {/* Breadcrumbs */}
          <div className="mb-4">
            <div className="text-sm text-gray-500">
              홈 &gt; 관리자 관리
            </div>
          </div>

          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">관리자 관리</h1>
              <div className="text-sm text-gray-600 mt-1">관리자</div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
              >
                저장
              </button>
            </div>
          </div>

          {/* Add/Filter Row */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-6 gap-4 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">카테고리(대)</label>
                <input
                  type="text"
                  placeholder="카테고리(대)"
                  value={newCategory.large}
                  onChange={(e) => setNewCategory({ ...newCategory, large: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">카테고리(중)</label>
                <input
                  type="text"
                  placeholder="카테고리(중)"
                  value={newCategory.medium}
                  onChange={(e) => setNewCategory({ ...newCategory, medium: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">카테고리(소)</label>
                <input
                  type="text"
                  placeholder="카테고리(소)"
                  value={newCategory.small}
                  onChange={(e) => setNewCategory({ ...newCategory, small: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">요금제 그룹</label>
                <select
                  value={newCategory.pricingGroup}
                  onChange={(e) => setNewCategory({ ...newCategory, pricingGroup: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">요금제 그룹 선택</option>
                  <option value="일반">일반</option>
                  <option value="표준">표준</option>
                  <option value="프리미엄">프리미엄</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">수정 적용일</label>
                <input
                  type="text"
                  placeholder="YYYY.MM.DD"
                  value={newCategory.modificationDate}
                  onChange={(e) => setNewCategory({ ...newCategory, modificationDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <button
                  onClick={handleAdd}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                >
                  추가
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      번호
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      카테고리(대)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      카테고리(중)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      카테고리(소)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      요금제 그룹
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      수정 적용일
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{item.id}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {editingId === item.id ? (
                          <input
                            type="text"
                            value={editingCategory?.large || ''}
                            onChange={(e) =>
                              setEditingCategory({
                                ...editingCategory!,
                                large: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          item.large || '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {editingId === item.id ? (
                          <input
                            type="text"
                            value={editingCategory?.medium || ''}
                            onChange={(e) =>
                              setEditingCategory({
                                ...editingCategory!,
                                medium: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          item.medium || '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {editingId === item.id ? (
                          <input
                            type="text"
                            value={editingCategory?.small || ''}
                            onChange={(e) =>
                              setEditingCategory({
                                ...editingCategory!,
                                small: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          item.small || '-'
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {editingId === item.id ? (
                          <select
                            value={editingCategory?.pricingGroup || ''}
                            onChange={(e) =>
                              setEditingCategory({
                                ...editingCategory!,
                                pricingGroup: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="일반">일반</option>
                            <option value="표준">표준</option>
                            <option value="프리미엄">프리미엄</option>
                          </select>
                        ) : (
                          <span className="text-gray-600">{item.pricingGroup}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {editingId === item.id ? (
                          <input
                            type="text"
                            value={editingCategory?.modificationDate || ''}
                            onChange={(e) =>
                              setEditingCategory({
                                ...editingCategory!,
                                modificationDate: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          item.modificationDate
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {editingId === item.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveEdit}
                              className="text-blue-600 hover:text-blue-800 text-xs"
                            >
                              저장
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-600 hover:text-gray-800 text-xs"
                            >
                              취소
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-blue-600 hover:text-blue-800 text-xs"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              X
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <button className="p-1 hover:bg-gray-100 rounded text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
                <button className="p-1 hover:bg-gray-100 rounded text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-semibold">
                  1
                </button>
                <button className="p-1 hover:bg-gray-100 rounded text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button className="p-1 hover:bg-gray-100 rounded text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
