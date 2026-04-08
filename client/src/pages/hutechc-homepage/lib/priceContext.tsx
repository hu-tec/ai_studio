'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CategoryPrices {
  // 카테고리별 추가 요금 (₩/단어 또는 %) - 동적 관리
  // 대 카테고리: { 키: { name: 이름, icon: 아이콘, price: 가격 } }
  category_large: Record<string, { name: string; icon: string; price: number }>;
  
  // 중 카테고리: { 대카테고리키: { 중카테고리키: { name: 이름, price: 가격 } } }
  category_mid: Record<string, Record<string, { name: string; price: number }>>;

  // 소 카테고리 (동적 추가 가능) - 중 카테고리별로 소 카테고리 리스트
  category_small: Record<string, Record<string, number>>; // { 중카테고리키: { 소카테고리명: 가격 } }
}

export interface PriceSettings {
  // 번역 방식별 기본 요금
  translator_text: number;
  translator_voice: number;
  translator_video: number;
  ai_text: number;
  ai_voice: number;
  ai_video: number;
  
  // 분야별 추가 요금
  marketing: number;
  law: number;
  tech: number;
  academic: number;
  medical: number;
  finance: number;
  
  // 긴급도 할증
  urgent1: number;
  urgent2: number;

  // 매칭 방법별 추가 요금 (₩/단어 또는 건당)
  match_direct: number; // 직접 찾기
  match_request: number; // 매칭 요청
  match_auto: number; // 자동 매칭
  match_corporate: number; // 기타(기업)

  // 결제 분류별 기본 단가 (₩/글자)
  payment_point_per_char: number; // 포인트
  payment_subscribe_per_char: number; // 구독
  payment_oneoff_per_char: number; // 1회결제

  // 결제 내용별 금액 (₩)
  payment_point_charge: number; // 포인트 충전
  payment_basic_sub: number; // 베이직 구독
  payment_standard_sub: number; // 스탠다드 구독
  payment_premium_sub: number; // 프리미엄 구독
  payment_service_use: number; // 서비스 이용 (1회 결제)

  // 의뢰자 가격표
  clientPrices: CategoryPrices;
  
  // 번역사 가격표
  translatorPrices: CategoryPrices;

  /** 에디터비 (₩) - 에디터 유형별 단가 */
  editorPrices: Record<string, number>;

  /** 수업료 (₩) - 과정별 단가 */
  tuitionPrices: Record<string, number>;

  /** 통독 (₩) - 문서사용·제공·전문가 의뢰·문서판매 등 */
  proofreadPrices: Record<string, number>;

  /** 전시회 (₩) - 사용료·영상·음성·텍스트·다운 */
  exhibitionPrices: Record<string, number>;
  /** 전시회 지역별 (지역명 → 가격) */
  exhibitionRegions: Record<string, number>;
  /** 전시회 작품별 (작품명 → 가격) */
  exhibitionWorks: Record<string, number>;

  /** 전문가 감수비용측정 (₩) - 메일·분당·시간당·만남·화상·전화·카톡 */
  expertReviewPrices: Record<string, number>;

  // 번역사 비율 설정 (%)
  translatorRatios: {
    // 기본 번역 방식별 비율
    translator_text_ratio: number;
    translator_voice_ratio: number;
    translator_video_ratio: number;
    ai_text_ratio: number;
    ai_voice_ratio: number;
    ai_video_ratio: number;
    // 분야별 추가 요금 비율
    marketing_ratio: number;
    law_ratio: number;
    tech_ratio: number;
    academic_ratio: number;
    medical_ratio: number;
    finance_ratio: number;
    // 긴급도 할증 비율
    urgent1_ratio: number;
    urgent2_ratio: number;
    // 매칭 방법별 비율
    match_direct_ratio: number;
    match_request_ratio: number;
    match_auto_ratio: number;
    match_corporate_ratio: number;
    // 결제 분류별 비율
    payment_point_per_char_ratio: number;
    payment_subscribe_per_char_ratio: number;
    payment_oneoff_per_char_ratio: number;
    // 결제 내용별 비율 (일반적으로 번역사에게는 해당 없음, 기본값 0)
    payment_point_charge_ratio: number;
    payment_basic_sub_ratio: number;
    payment_standard_sub_ratio: number;
    payment_premium_sub_ratio: number;
    payment_service_use_ratio: number;
  };
}

interface PriceContextType {
  prices: PriceSettings;
  updatePrice: (key: keyof PriceSettings, value: number) => void;
  updatePrices: (newPrices: Partial<PriceSettings>) => void;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

const DEFAULT_PRICES: PriceSettings = {
  translator_text: 50,
  translator_voice: 3000,
  translator_video: 5000,
  ai_text: 3,
  ai_voice: 500,
  ai_video: 800,
  marketing: 25,
  law: 30,
  tech: 35,
  academic: 38,
  medical: 40,
  finance: 45,
  urgent1: 30,
  urgent2: 50,
  match_direct: 0,
  match_request: 0,
  match_auto: 0,
  match_corporate: 0,
  payment_point_per_char: 0,
  payment_subscribe_per_char: 0,
  payment_oneoff_per_char: 0,
  payment_point_charge: 0,
  payment_basic_sub: 0,
  payment_standard_sub: 0,
  payment_premium_sub: 0,
  payment_service_use: 0,

  // 의뢰자 가격표 기본값
  clientPrices: {
    category_large: {
      video: { name: '영상', icon: '📹', price: 0 },
      audio: { name: '음성파일', icon: '🎤', price: 0 },
      doc: { name: '문서', icon: '📄', price: 0 },
      field: { name: '세부 분야', icon: '🏷️', price: 0 },
    },
    category_mid: {
      video: {
        'category_mid_video_entertainment': { name: '예능', price: 0 },
        'category_mid_video_drama': { name: '드라마', price: 0 },
        'category_mid_video_movie': { name: '영화', price: 0 },
        'category_mid_video_sns': { name: 'SNS', price: 0 },
        'category_mid_video_youtube': { name: '유투브', price: 0 },
      },
      audio: {
        'category_mid_audio_documentary': { name: '다큐멘터리', price: 0 },
        'category_mid_audio_announcer': { name: '아나운서', price: 0 },
        'category_mid_audio_tour_guide': { name: '관광 가이드', price: 0 },
        'category_mid_audio_curator': { name: '큐레이터', price: 0 },
        'category_mid_audio_guidance': { name: '안내', price: 0 },
        'category_mid_audio_simultaneous': { name: '동시통역', price: 0 },
        'category_mid_audio_lecture': { name: '강의', price: 0 },
        'category_mid_audio_music': { name: '음악', price: 0 },
      },
      doc: {
        'category_mid_doc_webtoon': { name: '웹툰', price: 0 },
        'category_mid_doc_classic': { name: '고전', price: 0 },
        'category_mid_doc_business': { name: '비즈니스', price: 0 },
        'category_mid_doc_ppt': { name: 'PPT', price: 0 },
        'category_mid_doc_business_proposal': { name: '사업소개서', price: 0 },
      },
      field: {
        'category_mid_field_cosmetics': { name: '화장품', price: 0 },
        'category_mid_field_semiconductor': { name: '반도체', price: 0 },
        'category_mid_field_defense': { name: '방산', price: 0 },
        'category_mid_field_news': { name: '뉴스', price: 0 },
        'category_mid_field_politics': { name: '정치', price: 0 },
        'category_mid_field_economy': { name: '경제', price: 0 },
        'category_mid_field_literature': { name: '문학', price: 0 },
        'category_mid_field_engineering': { name: '공학', price: 0 },
      },
    },
    category_small: {},
  },
  
  // 번역사 가격표 기본값 (비율 저장용 - price 필드에 비율 % 저장)
  translatorPrices: {
    category_large: {
      video: { name: '영상', icon: '📹', price: 70 }, // 70% 기본값
      audio: { name: '음성파일', icon: '🎤', price: 70 },
      doc: { name: '문서', icon: '📄', price: 70 },
      field: { name: '세부 분야', icon: '🏷️', price: 70 },
    },
    category_mid: {
      video: {
        'category_mid_video_entertainment': { name: '예능', price: 70 },
        'category_mid_video_drama': { name: '드라마', price: 70 },
        'category_mid_video_movie': { name: '영화', price: 70 },
        'category_mid_video_sns': { name: 'SNS', price: 70 },
        'category_mid_video_youtube': { name: '유투브', price: 70 },
      },
      audio: {
        'category_mid_audio_documentary': { name: '다큐멘터리', price: 70 },
        'category_mid_audio_announcer': { name: '아나운서', price: 70 },
        'category_mid_audio_tour_guide': { name: '관광 가이드', price: 70 },
        'category_mid_audio_curator': { name: '큐레이터', price: 70 },
        'category_mid_audio_guidance': { name: '안내', price: 70 },
        'category_mid_audio_simultaneous': { name: '동시통역', price: 70 },
        'category_mid_audio_lecture': { name: '강의', price: 70 },
        'category_mid_audio_music': { name: '음악', price: 70 },
      },
      doc: {
        'category_mid_doc_webtoon': { name: '웹툰', price: 70 },
        'category_mid_doc_classic': { name: '고전', price: 70 },
        'category_mid_doc_business': { name: '비즈니스', price: 70 },
        'category_mid_doc_ppt': { name: 'PPT', price: 70 },
        'category_mid_doc_business_proposal': { name: '사업소개서', price: 70 },
      },
      field: {
        'category_mid_field_cosmetics': { name: '화장품', price: 70 },
        'category_mid_field_semiconductor': { name: '반도체', price: 70 },
        'category_mid_field_defense': { name: '방산', price: 70 },
        'category_mid_field_news': { name: '뉴스', price: 70 },
        'category_mid_field_politics': { name: '정치', price: 70 },
        'category_mid_field_economy': { name: '경제', price: 70 },
        'category_mid_field_literature': { name: '문학', price: 70 },
        'category_mid_field_engineering': { name: '공학', price: 70 },
      },
    },
    category_small: {},
  },

  editorPrices: {
    editor_doc_form: 0,
    editor_translation: 0,
    editor_prompt: 0,
    editor_video: 0,
    editor_image: 0,
    editor_dev: 0,
    editor_music: 0,
    editor_creative: 0,
  },

  tuitionPrices: {
    tuition_tesol: 0,
    tuition_prompt: 0,
    tuition_ai_translation: 0,
    tuition_itt_exam: 0,
    tuition_ethics: 0,
  },

  proofreadPrices: {
    proofread_doc_use: 0,
    proofread_doc_provide: 0,
    proofread_expert_request: 0,
    proofread_doc_sale_general: 0,
    proofread_doc_sale_expert: 0,
  },

  exhibitionPrices: {
    exhibition_usage: 0,
    exhibition_video: 0,
    exhibition_voice: 0,
    exhibition_text: 0,
    exhibition_down: 0,
  },
  exhibitionRegions: {},
  exhibitionWorks: {},

  expertReviewPrices: {
    expert_email: 0,
    expert_per_minute: 0,
    expert_per_hour: 0,
    expert_meeting: 0,
    expert_video: 0,
    expert_phone: 0,
    expert_kakao: 0,
  },

  // 번역사 비율 설정 (%)
  translatorRatios: {
    translator_text_ratio: 70,
    translator_voice_ratio: 70,
    translator_video_ratio: 70,
    ai_text_ratio: 70,
    ai_voice_ratio: 70,
    ai_video_ratio: 70,
    marketing_ratio: 70,
    law_ratio: 70,
    tech_ratio: 70,
    academic_ratio: 70,
    medical_ratio: 70,
    finance_ratio: 70,
    urgent1_ratio: 70,
    urgent2_ratio: 70,
    match_direct_ratio: 70,
    match_request_ratio: 70,
    match_auto_ratio: 70,
    match_corporate_ratio: 70,
    payment_point_per_char_ratio: 70,
    payment_subscribe_per_char_ratio: 70,
    payment_oneoff_per_char_ratio: 70,
    payment_point_charge_ratio: 0,
    payment_basic_sub_ratio: 0,
    payment_standard_sub_ratio: 0,
    payment_premium_sub_ratio: 0,
    payment_service_use_ratio: 0,
  },
};

export function PriceProvider({ children }: { children: React.ReactNode }) {
  const [prices, setPrices] = useState<PriceSettings>(DEFAULT_PRICES);

  const persist = (next: PriceSettings) => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('priceSettings', JSON.stringify(next));
      }
    } catch (e) {
      console.error('Failed to save price settings to localStorage', e);
    }
  };

  // 클라이언트에 저장된 가격 설정(localStorage) 불러오기
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const stored = window.localStorage.getItem('priceSettings');
      let finalPrices = { ...DEFAULT_PRICES };
      
      if (stored) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parsed = JSON.parse(stored) as any;
        
        // 기존 형식의 필드가 있으면 새 구조로 마이그레이션
        const oldLargeFields = ['category_large_video', 'category_large_audio', 'category_large_doc', 'category_large_field'];
        const hasOldFormat = oldLargeFields.some(field => parsed[field] !== undefined);
        
        // category_large가 있으면 clientPrices와 translatorPrices로 마이그레이션
        if (parsed.category_large && !parsed.clientPrices && !parsed.translatorPrices) {
          const categoryData = {
            category_large: parsed.category_large || DEFAULT_PRICES.clientPrices.category_large,
            category_mid: parsed.category_mid || DEFAULT_PRICES.clientPrices.category_mid,
            category_small: parsed.category_small || DEFAULT_PRICES.clientPrices.category_small,
          };
          // 깊은 복사로 분리
          finalPrices.clientPrices = {
            category_large: { ...categoryData.category_large },
            category_mid: JSON.parse(JSON.stringify(categoryData.category_mid)),
            category_small: JSON.parse(JSON.stringify(categoryData.category_small)),
          };
          finalPrices.translatorPrices = {
            category_large: { ...categoryData.category_large },
            category_mid: JSON.parse(JSON.stringify(categoryData.category_mid)),
            category_small: JSON.parse(JSON.stringify(categoryData.category_small)),
          };
        } else if (hasOldFormat && (!parsed.category_large || Object.keys(parsed.category_large || {}).length === 0)) {
          // 기존 형식에서 새 형식으로 마이그레이션
          const categoryData = {
            category_large: {
              video: { name: '영상', icon: '📹', price: parsed.category_large_video ?? 0 },
              audio: { name: '음성파일', icon: '🎤', price: parsed.category_large_audio ?? 0 },
              doc: { name: '문서', icon: '📄', price: parsed.category_large_doc ?? 0 },
              field: { name: '세부 분야', icon: '🏷️', price: parsed.category_large_field ?? 0 },
            },
            category_mid: {
              video: {
                'category_mid_video_entertainment': { name: '예능', price: parsed.category_mid_video_entertainment ?? 0 },
                'category_mid_video_drama': { name: '드라마', price: parsed.category_mid_video_drama ?? 0 },
                'category_mid_video_movie': { name: '영화', price: parsed.category_mid_video_movie ?? 0 },
                'category_mid_video_sns': { name: 'SNS', price: parsed.category_mid_video_sns ?? 0 },
                'category_mid_video_youtube': { name: '유투브', price: parsed.category_mid_video_youtube ?? 0 },
              },
              audio: {
                'category_mid_audio_documentary': { name: '다큐멘터리', price: parsed.category_mid_audio_documentary ?? 0 },
                'category_mid_audio_announcer': { name: '아나운서', price: parsed.category_mid_audio_announcer ?? 0 },
                'category_mid_audio_tour_guide': { name: '관광 가이드', price: parsed.category_mid_audio_tour_guide ?? 0 },
                'category_mid_audio_curator': { name: '큐레이터', price: parsed.category_mid_audio_curator ?? 0 },
                'category_mid_audio_guidance': { name: '안내', price: parsed.category_mid_audio_guidance ?? 0 },
                'category_mid_audio_simultaneous': { name: '동시통역', price: parsed.category_mid_audio_simultaneous ?? 0 },
                'category_mid_audio_lecture': { name: '강의', price: parsed.category_mid_audio_lecture ?? 0 },
                'category_mid_audio_music': { name: '음악', price: parsed.category_mid_audio_music ?? 0 },
              },
              doc: {
                'category_mid_doc_webtoon': { name: '웹툰', price: parsed.category_mid_doc_webtoon ?? 0 },
                'category_mid_doc_classic': { name: '고전', price: parsed.category_mid_doc_classic ?? 0 },
                'category_mid_doc_business': { name: '비즈니스', price: parsed.category_mid_doc_business ?? 0 },
                'category_mid_doc_ppt': { name: 'PPT', price: parsed.category_mid_doc_ppt ?? 0 },
                'category_mid_doc_business_proposal': { name: '사업소개서', price: parsed.category_mid_doc_business_proposal ?? 0 },
              },
              field: {
                'category_mid_field_cosmetics': { name: '화장품', price: parsed.category_mid_field_cosmetics ?? 0 },
                'category_mid_field_semiconductor': { name: '반도체', price: parsed.category_mid_field_semiconductor ?? 0 },
                'category_mid_field_defense': { name: '방산', price: parsed.category_mid_field_defense ?? 0 },
                'category_mid_field_news': { name: '뉴스', price: parsed.category_mid_field_news ?? 0 },
                'category_mid_field_politics': { name: '정치', price: parsed.category_mid_field_politics ?? 0 },
                'category_mid_field_economy': { name: '경제', price: parsed.category_mid_field_economy ?? 0 },
                'category_mid_field_literature': { name: '문학', price: parsed.category_mid_field_literature ?? 0 },
                'category_mid_field_engineering': { name: '공학', price: parsed.category_mid_field_engineering ?? 0 },
              },
            },
            category_small: parsed.category_small || {},
          };
          // 깊은 복사로 분리
          finalPrices.clientPrices = {
            category_large: { ...categoryData.category_large },
            category_mid: JSON.parse(JSON.stringify(categoryData.category_mid)),
            category_small: JSON.parse(JSON.stringify(categoryData.category_small)),
          };
          finalPrices.translatorPrices = {
            category_large: { ...categoryData.category_large },
            category_mid: JSON.parse(JSON.stringify(categoryData.category_mid)),
            category_small: JSON.parse(JSON.stringify(categoryData.category_small)),
          };
        } else {
          // 새 형식이 이미 있으면 그대로 사용
          finalPrices = { ...DEFAULT_PRICES, ...parsed };
          
          // clientPrices와 translatorPrices가 있으면 깊은 복사로 분리
          if (parsed.clientPrices) {
            finalPrices.clientPrices = {
              category_large: { ...parsed.clientPrices.category_large },
              category_mid: JSON.parse(JSON.stringify(parsed.clientPrices.category_mid || {})),
              category_small: JSON.parse(JSON.stringify(parsed.clientPrices.category_small || {})),
            };
          } else if (!finalPrices.clientPrices || !finalPrices.clientPrices.category_large || Object.keys(finalPrices.clientPrices.category_large).length === 0) {
            finalPrices.clientPrices = {
              category_large: { ...DEFAULT_PRICES.clientPrices.category_large },
              category_mid: JSON.parse(JSON.stringify(DEFAULT_PRICES.clientPrices.category_mid)),
              category_small: JSON.parse(JSON.stringify(DEFAULT_PRICES.clientPrices.category_small)),
            };
          }
          
          if (parsed.translatorPrices) {
            finalPrices.translatorPrices = {
              category_large: { ...parsed.translatorPrices.category_large },
              category_mid: JSON.parse(JSON.stringify(parsed.translatorPrices.category_mid || {})),
              category_small: JSON.parse(JSON.stringify(parsed.translatorPrices.category_small || {})),
            };
          } else if (!finalPrices.translatorPrices || !finalPrices.translatorPrices.category_large || Object.keys(finalPrices.translatorPrices.category_large).length === 0) {
            finalPrices.translatorPrices = {
              category_large: { ...DEFAULT_PRICES.translatorPrices.category_large },
              category_mid: JSON.parse(JSON.stringify(DEFAULT_PRICES.translatorPrices.category_mid)),
              category_small: JSON.parse(JSON.stringify(DEFAULT_PRICES.translatorPrices.category_small)),
            };
          }
        }
        
          // 다른 필드들도 병합
        Object.keys(parsed).forEach(key => {
          if (!['category_large', 'category_mid', 'category_small', 'clientPrices', 'translatorPrices',
                'category_large_video', 'category_large_audio', 'category_large_doc', 'category_large_field',
                'category_mid_video_entertainment', 'category_mid_video_drama', 'category_mid_video_movie',
                'category_mid_video_sns', 'category_mid_video_youtube',
                'category_mid_audio_documentary', 'category_mid_audio_announcer', 'category_mid_audio_tour_guide',
                'category_mid_audio_curator', 'category_mid_audio_guidance', 'category_mid_audio_simultaneous',
                'category_mid_audio_lecture', 'category_mid_audio_music',
                'category_mid_doc_webtoon', 'category_mid_doc_classic', 'category_mid_doc_business',
                'category_mid_doc_ppt', 'category_mid_doc_business_proposal',
                'category_mid_field_cosmetics', 'category_mid_field_semiconductor', 'category_mid_field_defense',
                'category_mid_field_news', 'category_mid_field_politics', 'category_mid_field_economy',
                'category_mid_field_literature', 'category_mid_field_engineering'].includes(key)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (finalPrices as any)[key] = parsed[key];
          }
        });

        // translatorRatios가 없으면 기본값 설정
        if (!finalPrices.translatorRatios) {
          finalPrices.translatorRatios = DEFAULT_PRICES.translatorRatios;
        }

        // editorPrices: 기본값에 저장값 병합
        finalPrices.editorPrices = {
          ...DEFAULT_PRICES.editorPrices,
          ...(parsed.editorPrices && typeof parsed.editorPrices === 'object' ? parsed.editorPrices : {}),
        };

        // tuitionPrices: 기본값에 저장값 병합
        finalPrices.tuitionPrices = {
          ...DEFAULT_PRICES.tuitionPrices,
          ...(parsed.tuitionPrices && typeof parsed.tuitionPrices === 'object' ? parsed.tuitionPrices : {}),
        };

        // proofreadPrices: 기본값에 저장값 병합
        finalPrices.proofreadPrices = {
          ...DEFAULT_PRICES.proofreadPrices,
          ...(parsed.proofreadPrices && typeof parsed.proofreadPrices === 'object' ? parsed.proofreadPrices : {}),
        };

        // exhibition*: 기본값에 저장값 병합
        finalPrices.exhibitionPrices = {
          ...DEFAULT_PRICES.exhibitionPrices,
          ...(parsed.exhibitionPrices && typeof parsed.exhibitionPrices === 'object' ? parsed.exhibitionPrices : {}),
        };
        finalPrices.exhibitionRegions = {
          ...(parsed.exhibitionRegions && typeof parsed.exhibitionRegions === 'object' ? parsed.exhibitionRegions : {}),
        };
        finalPrices.exhibitionWorks = {
          ...(parsed.exhibitionWorks && typeof parsed.exhibitionWorks === 'object' ? parsed.exhibitionWorks : {}),
        };

        // expertReviewPrices: 기본값에 저장값 병합
        finalPrices.expertReviewPrices = {
          ...DEFAULT_PRICES.expertReviewPrices,
          ...(parsed.expertReviewPrices && typeof parsed.expertReviewPrices === 'object' ? parsed.expertReviewPrices : {}),
        };
      }
      
      setPrices(finalPrices as PriceSettings);
      // 마이그레이션된 데이터 저장
      if (stored) {
        persist(finalPrices as PriceSettings);
      }
    } catch (e) {
      console.error('Failed to load price settings from localStorage', e);
      setPrices(DEFAULT_PRICES);
    }
  }, []);

  const updatePrice = (key: keyof PriceSettings, value: number) => {
    setPrices((prev) => {
      const next = { ...prev, [key]: value };
      persist(next);
      return next;
    });
  };

  const updatePrices = (newPrices: Partial<PriceSettings>) => {
    setPrices((prev) => {
      const next = { ...prev };
      
      // clientPrices와 translatorPrices는 깊은 병합 필요
      if (newPrices.clientPrices) {
        const newClientPrices = newPrices.clientPrices;
        next.clientPrices = {
          ...prev.clientPrices,
          category_large: {
            ...prev.clientPrices.category_large,
            ...(newClientPrices.category_large || {}),
          },
          category_mid: (() => {
            const mergedMid: Record<string, Record<string, { name: string; price: number }>> = {
              ...prev.clientPrices.category_mid,
            };
            if (newClientPrices.category_mid) {
              Object.keys(newClientPrices.category_mid).forEach(largeKey => {
                mergedMid[largeKey] = {
                  ...(mergedMid[largeKey] || {}),
                  ...newClientPrices.category_mid[largeKey],
                };
              });
            }
            return mergedMid;
          })(),
          category_small: (() => {
            const mergedSmall: Record<string, Record<string, number>> = {
              ...prev.clientPrices.category_small,
            };
            if (newClientPrices.category_small) {
              Object.keys(newClientPrices.category_small).forEach(midKey => {
                mergedSmall[midKey] = {
                  ...(mergedSmall[midKey] || {}),
                  ...newClientPrices.category_small[midKey],
                };
              });
            }
            return mergedSmall;
          })(),
        };
      }
      
      if (newPrices.editorPrices) {
        next.editorPrices = {
          ...prev.editorPrices,
          ...newPrices.editorPrices,
        };
      }

      if (newPrices.tuitionPrices) {
        next.tuitionPrices = {
          ...prev.tuitionPrices,
          ...newPrices.tuitionPrices,
        };
      }

      if (newPrices.proofreadPrices) {
        next.proofreadPrices = {
          ...prev.proofreadPrices,
          ...newPrices.proofreadPrices,
        };
      }

      if (newPrices.exhibitionPrices) {
        next.exhibitionPrices = {
          ...prev.exhibitionPrices,
          ...newPrices.exhibitionPrices,
        };
      }
      if (newPrices.exhibitionRegions) {
        next.exhibitionRegions = {
          ...prev.exhibitionRegions,
          ...newPrices.exhibitionRegions,
        };
      }
      if (newPrices.exhibitionWorks) {
        next.exhibitionWorks = {
          ...prev.exhibitionWorks,
          ...newPrices.exhibitionWorks,
        };
      }

      if (newPrices.expertReviewPrices) {
        next.expertReviewPrices = {
          ...prev.expertReviewPrices,
          ...newPrices.expertReviewPrices,
        };
      }

      if (newPrices.translatorPrices) {
        const newTranslatorPrices = newPrices.translatorPrices;
        next.translatorPrices = {
          ...prev.translatorPrices,
          category_large: {
            ...prev.translatorPrices.category_large,
            ...(newTranslatorPrices.category_large || {}),
          },
          category_mid: (() => {
            const mergedMid: Record<string, Record<string, { name: string; price: number }>> = {
              ...prev.translatorPrices.category_mid,
            };
            if (newTranslatorPrices.category_mid) {
              Object.keys(newTranslatorPrices.category_mid).forEach(largeKey => {
                mergedMid[largeKey] = {
                  ...(mergedMid[largeKey] || {}),
                  ...newTranslatorPrices.category_mid[largeKey],
                };
              });
            }
            return mergedMid;
          })(),
          category_small: (() => {
            const mergedSmall: Record<string, Record<string, number>> = {
              ...prev.translatorPrices.category_small,
            };
            if (newTranslatorPrices.category_small) {
              Object.keys(newTranslatorPrices.category_small).forEach(midKey => {
                mergedSmall[midKey] = {
                  ...(mergedSmall[midKey] || {}),
                  ...newTranslatorPrices.category_small[midKey],
                };
              });
            }
            return mergedSmall;
          })(),
        };
      }
      
          // 다른 필드들은 일반 병합
          Object.keys(newPrices).forEach(key => {
            if (key !== 'clientPrices' && key !== 'translatorPrices' && key !== 'editorPrices' && key !== 'tuitionPrices' && key !== 'proofreadPrices' && key !== 'exhibitionPrices' && key !== 'exhibitionRegions' && key !== 'exhibitionWorks' && key !== 'expertReviewPrices') {
              (next as Record<string, unknown>)[key] = (newPrices as Record<string, unknown>)[key];
            }
          });
      
      persist(next);
      return next;
    });
  };

  return (
    <PriceContext.Provider value={{ prices, updatePrice, updatePrices }}>
      {children}
    </PriceContext.Provider>
  );
}

export function usePrice() {
  const context = useContext(PriceContext);
  if (!context) {
    throw new Error('usePrice must be used within PriceProvider');
  }
  return context;
}
