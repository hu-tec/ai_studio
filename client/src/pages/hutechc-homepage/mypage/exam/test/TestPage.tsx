/* 원본: hutechc_hompage_real/app/mypage/exam/test/page.tsx */
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'react-router';
import type { ExamType, AnswerUnit } from '../../../types/exam';

// Mock 시험 데이터
const mockExamContent = {
  title: '시험명이 나오는 영역',
  sourceText: "Artificial intelligence has become an integral part of modern society. From healthcare to education, AI is transforming how we work and live. However, many people still don't fully understand the implications of this technology.",
  sentences: [
    "Artificial intelligence has become an integral part of modern society.",
    "From healthcare to education, AI is transforming how we work and live.",
    "However, many people still don't fully understand the implications of this technology."
  ],
  paragraphs: [
    "Artificial intelligence has become an integral part of modern society. From healthcare to education, AI is transforming how we work and live. However, many people still don't fully understand the implications of this technology."
  ],
  targetSentences: [
    "인공지능은 현대 사회의 필수적인 부분이 되었습니다.",
    "의료에서 교육까지, AI는 우리의 일과 삭의 방식을 변화시키고 있습니다.",
    "그러나 많은 사람들은 여전히 이 기술의 의미를 완전히 이해하지 모하고 있습니다."
  ],
  targetParagraphs: [
    "인공지능은 현대 사회의 필수적인 부분이 되었습니다. 의료에서 교육까지, AI는 우리의 일과 삭의 방식을 변화시키고 있습니다. 그러나 많은 사람들은 여전히 이 기술의 의미를 완전히 이해하지 모하고 있습니다."
  ],
  imageUrl: 'https://via.placeholder.com/1000x300',
  audioUrl: '#'
};

// 오프라인 시험 세팅 컴포넌트
function OfflineExamSetup({ onComplete }: { onComplete: () => void }) {
  const [cameraStatus, setCameraStatus] = useState<'checking' | 'connected' | 'failed'>('checking');
  const [microphoneStatus, setMicrophoneStatus] = useState<'checking' | 'connected' | 'failed'>('checking');
  const [screenShareStatus, setScreenShareStatus] = useState<'checking' | 'connected' | 'failed'>('checking');
  const [environmentCheck, setEnvironmentCheck] = useState(false);
  const [canStart, setCanStart] = useState(false);

  useEffect(() => {
    // 카메라 확인
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        setCameraStatus('connected');
        stream.getTracks().forEach((track) => track.stop());
      })
      .catch(() => {
        setCameraStatus('failed');
      });

    // 마이크 확인
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setMicrophoneStatus('connected');
        stream.getTracks().forEach((track) => track.stop());
      })
      .catch(() => {
        setMicrophoneStatus('failed');
      });

    // 화면 공유 권한 확인 (실제로는 시험 시작 시 요청)
    setScreenShareStatus('checking');
  }, []);

  useEffect(() => {
    if (
      cameraStatus === 'connected' &&
      microphoneStatus === 'connected' &&
      environmentCheck &&
      screenShareStatus !== 'failed'
    ) {
      setCanStart(true);
    } else {
      setCanStart(false);
    }
  }, [cameraStatus, microphoneStatus, screenShareStatus, environmentCheck]);

  const getStatusIcon = (status: string) => {
    if (status === 'checking') {
      return (
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      );
    } else if (status === 'connected') {
      return (
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    }
  };

  const getStatusText = (status: string) => {
    if (status === 'checking') return '확인 중...';
    if (status === 'connected') return '연결 완료';
    return '연결 실패';
  };

  const retryCamera = () => {
    setCameraStatus('checking');
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        setCameraStatus('connected');
        stream.getTracks().forEach((track) => track.stop());
      })
      .catch(() => {
        setCameraStatus('failed');
      });
  };

  const retryMicrophone = () => {
    setMicrophoneStatus('checking');
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setMicrophoneStatus('connected');
        stream.getTracks().forEach((track) => track.stop());
      })
      .catch(() => {
        setMicrophoneStatus('failed');
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">오프라인 시험 세팅</h1>
        <p className="text-gray-600 mb-8">시험 시작 전 필요한 설정을 확인해주세요.</p>

        {/* 카메라 연결 */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">화면 캠 연결</h3>
                <p className="text-sm text-gray-500">시험 감독을 위한 카메라 권한이 필요합니다</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${cameraStatus === 'connected' ? 'text-green-600' : cameraStatus === 'failed' ? 'text-red-600' : 'text-blue-600'}`}>
                {getStatusText(cameraStatus)}
              </span>
              {getStatusIcon(cameraStatus)}
              {cameraStatus === 'failed' && (
                <button
                  onClick={retryCamera}
                  className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                >
                  재시도
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 마이크 연결 */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">마이크 연결</h3>
                <p className="text-sm text-gray-500">주변 소음 감지를 위한 마이크 권한이 필요합니다</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${microphoneStatus === 'connected' ? 'text-green-600' : microphoneStatus === 'failed' ? 'text-red-600' : 'text-blue-600'}`}>
                {getStatusText(microphoneStatus)}
              </span>
              {getStatusIcon(microphoneStatus)}
              {microphoneStatus === 'failed' && (
                <button
                  onClick={retryMicrophone}
                  className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                >
                  재시도
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 화면 공유 */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">화면 공유</h3>
                <p className="text-sm text-gray-500">시험 시작 시 화면 공유 권한을 요청합니다</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600">시험 시작 시 설정</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* 주변 환경 체크 */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">주변 환경 체크</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>조용한 환경인지 확인해주세요</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>다른 사람이 옆에 있지 않은지 확인해주세요</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>책상 위에 부정행위 용품이 없는지 확인해주세요</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>모바일 기기, 이어폰 등을 멀리 두었는지 확인해주세요</span>
                </div>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={environmentCheck}
                onChange={(e) => setEnvironmentCheck(e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">확인 완료</span>
            </label>
          </div>
        </div>

        {/* 시험 규칙 안내 */}
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-900 mb-2">시험 규칙</h3>
          <div className="space-y-1 text-sm text-yellow-800">
            <p>• 시험 중에는 다른 창을 열거나 다른 프로그램을 사용할 수 없습니다</p>
            <p>• 시험 중 자리를 비우거나 다른 사람과 대화하는 것은 금지됩니다</p>
            <p>• 부정행위가 감지될 경우 시험 결과가 무효 처리됩니다</p>
          </div>
        </div>

        {/* 시작 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={() => window.history.back()}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
          >
            돌아가기
          </button>
          <button
            onClick={onComplete}
            disabled={!canStart}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold ${
              canStart
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            시험 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}

function ExamTestContent() {
  const searchParams = useSearchParams();
  const examId = searchParams.get('id');
  const examType = searchParams.get('type');
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0); // 문장/문단 탭 선택
  const [timeRemaining, setTimeRemaining] = useState(3600); // 1시간
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [uploadedImages, setUploadedImages] = useState<Record<number, string>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTab, setCurrentTab] = useState('sentence'); // 'sentence' | 'paragraph'

  // 타이머 - 모든 Hooks는 조건부 return 전에 호출되어야 함
  useEffect(() => {
    // 오프라인 시험 세팅이 완료되지 않았으면 타이머 시작하지 않음
    if (examType === 'offline' && !isSetupComplete) {
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examType, isSetupComplete]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDisplayItems = useCallback(() => {
    if (currentTab === 'sentence') {
      return {
        source: mockExamContent.sentences,
        target: mockExamContent.targetSentences || [],
        label: '문장'
      };
    } else {
      return {
        source: mockExamContent.paragraphs,
        target: mockExamContent.targetParagraphs || [],
        label: '문단'
      };
    }
  }, [currentTab]);

  const displayItems = getDisplayItems();

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: value
    }));
    setIsSaved(false);
  };

  const handleImageUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 이미지 파일만 허용
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }

      // 파일 크기 체크 (10MB 제한)
      if (file.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB 이하여야 합니다.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setUploadedImages((prev) => ({
          ...prev,
          [index]: imageUrl
        }));
        setIsSaved(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => {
      const newImages = { ...prev };
      delete newImages[index];
      return newImages;
    });
    setIsSaved(false);
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSubmit = () => {
    if (window.confirm('시험을 제출하시겠습니까?')) {
      console.log('시험 제출:', answers, uploadedImages);
    }
  };

  // 오프라인 시험인 경우 세팅이 완료되지 않았으면 세팅 페이지 표시
  if (examType === 'offline' && !isSetupComplete) {
    return <OfflineExamSetup onComplete={() => setIsSetupComplete(true)} />;
  }

  // 오프라인 시험인 경우 문제 영역만 표시
  if (examType === 'offline' && isSetupComplete) {
    return (
      <div className="h-screen bg-white flex flex-col overflow-hidden">
        {/* 문제 이미지 */}
        <div className="border-b border-gray-200 flex-shrink-0 px-6 py-4 bg-white">
          <div className="bg-gray-100 rounded-lg h-48 overflow-hidden">
            <img src={mockExamContent.imageUrl} alt="문제" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* 문제 영역 - 3개 패널 */}
        <div className="flex-1 flex overflow-hidden">
          {/* Panel 1: Source */}
          <div className="flex-1 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-bold text-gray-900">원문</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 text-sm text-gray-800 leading-relaxed">
              {currentTab === 'sentence' ? (
                <div className="space-y-4">
                  {mockExamContent.sentences.map((sentence, index) => (
                    <div key={index} className="pb-3 border-b border-dashed border-gray-300">
                      <span className="font-semibold text-blue-600 mr-2">{index + 1}.</span>
                      {sentence}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {mockExamContent.paragraphs.map((paragraph, index) => (
                    <div key={index} className="pb-3 border-b border-gray-300">
                      <span className="font-semibold text-blue-600 mr-2">{index + 1}.</span>
                      {paragraph}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Panel 2: AI Translation */}
          <div className="flex-1 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-yellow-50">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">AI 번역기</h3>
                <button className="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                  ChatGPT
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 text-sm text-gray-800 leading-relaxed bg-yellow-50">
              {currentTab === 'sentence' ? (
                <div className="space-y-4">
                  {mockExamContent.targetSentences.map((sentence, index) => (
                    <div key={index} className="pb-3 border-b border-dashed border-yellow-300">
                      <span className="font-semibold text-blue-600 mr-2">{index + 1}.</span>
                      {sentence}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {mockExamContent.targetParagraphs.map((paragraph, index) => (
                    <div key={index} className="pb-3 border-b border-yellow-300">
                      <span className="font-semibold text-blue-600 mr-2">{index + 1}.</span>
                      {paragraph}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Panel 3: My Answer - 사진 업로드 */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-blue-50">
              <h3 className="text-sm font-bold text-gray-900">내 답안 (사진 업로드)</h3>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto p-4">
              {uploadedImages[0] ? (
                <div className="relative flex-1">
                  <img
                    src={uploadedImages[0]}
                    alt="업로드된 답안"
                    className="w-full h-auto max-h-full object-contain rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => handleRemoveImage(0)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg"
                    title="이미지 삭제"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(0, e)}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-3 text-gray-500">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <div className="text-center">
                      <p className="text-base font-semibold text-gray-700 mb-1">사진 업로드</p>
                      <p className="text-sm text-gray-500">클릭하거나 드래그하여 업로드</p>
                      <p className="text-xs text-gray-400 mt-1">최대 10MB</p>
                    </div>
                  </div>
                </label>
              )}
            </div>
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex gap-2">
              {uploadedImages[0] && (
                <label className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm font-semibold hover:bg-gray-100 cursor-pointer">
                  사진 변경
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(0, e)}
                    className="hidden"
                  />
                </label>
              )}
              <button
                onClick={handleSave}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm font-semibold hover:bg-gray-100"
              >
                저장
              </button>
              <button
                onClick={handleSubmit}
                className="ml-auto px-4 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700"
              >
                제출
              </button>
            </div>
          </div>
        </div>

        {/* 하단 컨트롤 바 */}
        <div className="border-t border-gray-200 px-6 py-3 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentTab('sentence')}
              className={`px-4 py-2 text-sm font-semibold ${currentTab === 'sentence' ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-700'} rounded`}
            >
              문장
            </button>
            <button
              onClick={() => setCurrentTab('paragraph')}
              className={`px-4 py-2 text-sm font-semibold ${currentTab === 'paragraph' ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-700'} rounded`}
            >
              문단
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-base text-gray-700">
              남은 시간: <span className="font-bold text-blue-600">{formatTime(timeRemaining)}</span>
            </div>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700"
            >
              제출하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* 1. Top: Exam Info */}
      <div className="border-b border-gray-200 px-6 py-4 bg-white">
        <div className="flex gap-4 items-start">
          {/* Left: Avatar + Info */}
          <div className="w-20 h-20 rounded-lg bg-gray-300 flex-shrink-0 overflow-hidden">
            <img src="https://via.placeholder.com/80" alt="프로필" className="w-full h-full object-cover" />
          </div>

          {/* Middle: Exam Details */}
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1">
              <span className="text-gray-700">번역 자격증</span>
              <span className="ml-2 text-blue-600 font-semibold">전문1급</span>
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-1">시험명이 나오는 영역</h2>
            <div className="text-xs text-gray-600 mb-2">
              <span className="text-gray-700">번역 &gt;</span>
              <span className="ml-2">영상 &gt;</span>
              <span className="ml-2">다큐멘터리</span>
            </div>
            <p className="text-sm text-gray-600">A형 태국 여행에 대해 기획서를 작성해보시고.</p>
          </div>

          {/* Right: Timer + Language */}
          <div className="text-right flex-shrink-0">
            <div className="mb-3">
              <p className="text-xs text-gray-500">한국어 &gt;</p>
              <p className="text-sm text-blue-600 font-semibold">English</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center">
              <div className="text-white text-lg font-bold">{formatTime(timeRemaining)}</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">09:00 - 09:15</p>
          </div>
        </div>
      </div>

      {/* 2. Problem Selection Tabs */}
      <div className="border-b border-gray-200 px-6 py-2 bg-white flex gap-4">
        <button className="px-3 py-2 text-sm font-semibold text-blue-600 border-b-2 border-blue-600">
          문제1
        </button>
        <button className="px-3 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
          문제2
        </button>
        <button className="px-3 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
          문제3
        </button>
        <button className="px-3 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
          문제4
        </button>
        <button className="px-3 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
          문제5
        </button>
      </div>

      {/* 3. Control Bar */}
      <div className="border-b border-gray-200 px-6 py-3 bg-white flex items-center justify-between">
        {/* Left: Audio & Reset */}
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-100 rounded" title="음성 내보내기">
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </svg>
          </button>
        </div>

        {/* Middle: Tabs & Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentTab('sentence')}
            className={`px-3 py-1 text-xs font-semibold ${currentTab === 'sentence' ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-700'} rounded`}
          >
            문장
          </button>
          <button
            onClick={() => setCurrentTab('paragraph')}
            className={`px-3 py-1 text-xs font-semibold ${currentTab === 'paragraph' ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-700'} rounded`}
          >
            문단
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded" title="리셋">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded" title="보기">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded" title="전체화면">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6v4m11-5h4v4M4 20h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>

        {/* Right: Submit */}
        <button
          onClick={handleSubmit}
          className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700"
        >
          제출하기
        </button>
      </div>

      {/* 4. Problem Image */}
      <div className="border-b border-gray-200 flex-shrink-0 px-6 py-4 bg-white">
        <div className="bg-gray-100 rounded-lg h-40 overflow-hidden">
          <img src="https://via.placeholder.com/1200x300" alt="문제" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* 5. 3 Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panel 1: Source */}
        <div className="flex-1 border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-600">원문</h3>
            <button className="p-1 hover:bg-gray-200 rounded">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6v4m11-5h4v4M4 20h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 text-xs text-gray-700 leading-relaxed">
            {currentTab === 'sentence' ? (
              <div className="space-y-2">
                {mockExamContent.sentences.map((sentence, index) => (
                  <div key={index} className="pb-2" style={{borderBottom: '1px dashed #d1d5db'}}>
                    {sentence}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {mockExamContent.paragraphs.map((paragraph, index) => (
                  <div key={index} className="pb-2" style={{borderBottom: '1px solid #d1d5db'}}>
                    {paragraph}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel 2: AI Translation */}
        <div className="flex-1 border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-200 bg-yellow-50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-600">AI 번역기</h3>
            <div className="flex items-center gap-1">
              <button className="px-2 py-0.5 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                ChatGPT
              </button>
              <button className="p-1 hover:bg-gray-200 rounded">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6v4m11-5h4v4M4 20h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 text-xs text-gray-700 leading-relaxed bg-yellow-50">
            {currentTab === 'sentence' ? (
              <div className="space-y-2">
                {mockExamContent.targetSentences.map((sentence, index) => (
                  <div key={index} className="pb-2" style={{borderBottom: '1px dashed #fcd34d'}}>
                    {sentence}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {mockExamContent.targetParagraphs.map((paragraph, index) => (
                  <div key={index} className="pb-2" style={{borderBottom: '1px solid #fcd34d'}}>
                    {paragraph}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel 3: My Answer */}
        <div className="flex-1 flex flex-col">
          <div className="p-3 border-b border-gray-200 bg-blue-50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-600">내 답안</h3>
            <button className="p-1 hover:bg-gray-200 rounded">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6v4m11-5h4v4M4 20h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          <textarea
            placeholder="답안을 입력하세요."
            className="flex-1 p-3 text-xs border-0 resize-none focus:outline-none focus:ring-0 focus:ring-offset-0"
            value={answers[0] || ''}
            onChange={(e) => handleAnswerChange(0, e.target.value)}
          />
          <div className="px-3 py-2 border-t border-gray-200 bg-gray-50 flex gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-gray-100"
            >
              저장
            </button>
            <button
              onClick={handleSubmit}
              className="ml-auto px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700"
            >
              제출
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TestPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">로딩 중...</div>}>
      <ExamTestContent />
    </Suspense>
  );
}
