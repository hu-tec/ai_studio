const { getDB } = require('./init');

const S3_DOC_BASE = 'https://work-studio-uploads.s3.ap-northeast-2.amazonaws.com/photo-docs/2026';

// id → PDF 파일명 (S3에 업로드된 낱장 PDF)
const PDF_MAP = {
  '1': 'agreement-1-p01.pdf',
  '2': 'agreement-1-p02.pdf',
  '3': 'agreement-1-p03.pdf',
  '4': 'agreement-1-p04.pdf',
  '5': 'agreement-1-p05.pdf',
  '6': 'agreement-1-p06.pdf',
  '7': 'agreement-1-p07.pdf',
  '8': 'agreement-2-p01.pdf',
  '10': 'agreement-2-p02.pdf',
  '11': 'agreement-2-p03.pdf',
  '16': 'agreement-2-p04.pdf',
  '17': 'agreement-2-p05.pdf',
  '18': 'agreement-2-p06.pdf',
  '20': 'agreement-2-p07.pdf',
  '22': 'agreement-2-p08.pdf',
  '23': 'agreement-2-p09.pdf',
  '25': 'agreement-2-p10.pdf',
  '26': 'agreement-2-p11.pdf',
  '21': 'patent-cert-p01.pdf',
  '30': 'patent-cert-p02.pdf',
  '9': 'patent-cert-p03.pdf',
  '13': 'patent-cert-p04.pdf',
  '14': 'patent-cert-p05.pdf',
  '15': 'patent-cert-p06.pdf',
};

// 33개 항목 메타(썸네일 제외 — 썸네일은 클라이언트 THUMBNAIL_MAP에서 id로 lookup)
const PHOTO_ITEMS = [
  { id: '1', title: '국제통번역사절단협회 협약서', category: '협약서', date: '2018-09-18' },
  { id: '2', title: '신한대학교 산학협력협약서', category: '협약서', date: '2021-08-10' },
  { id: '3', title: '연세대학교 언어연구교육원 협약서', category: '협약서', date: '2018-08-03' },
  { id: '4', title: 'Babe Cosmetics Inc MOU', category: '협약서', date: '2022-05-01' },
  { id: '5', title: 'IAE Edu Net MOU', category: '협약서', date: '2021-08-01' },
  { id: '6', title: '와이즈에스티글로벌 협약서', category: '협약서', date: '2019-02-18' },
  { id: '7', title: 'Juillet Beauty Centre MOU', category: '협약서', date: '2021-08-01' },
  { id: '8', title: 'Global Partners MOU (Green)', category: '협약서', date: '2021-09-01' },
  { id: '9', title: '민간자격등록증 (인공지능 언어전문가)', category: '증명서', date: '2021-09-08' },
  { id: '10', title: '휴텍씨-국제통번역사절단협회 교육협약', category: '협약서', date: '2018-09-18' },
  { id: '11', title: '휴텍씨-국제통번역사절단협회 전략적업무제휴', category: '협약서', date: '2018-09-18' },
  { id: '12', title: '법무부 번역문 인증사무지침 설명자료', category: '기타', date: '2013-10-11' },
  { id: '13', title: '벤처기업확인서 (혁신성장유형)', category: '증명서', date: '2022-07-13' },
  { id: '14', title: '수출수입실적의 확인 및 증명서 (캐나다)', category: '증명서', date: '2022-04-26' },
  { id: '15', title: '수출수입실적의 확인 및 증명서 (홍콩)', category: '증명서', date: '2022-04-14' },
  { id: '16', title: '국제통번역사절단협회-시스트란 협약서', category: '협약서', date: '2020-06-04' },
  { id: '17', title: '휴텍씨-시스트란 전략적업무제휴 협약서', category: '협약서', date: '2020-05-18' },
  { id: '18', title: '국제통번역사절단협회-엑스와이씨비 협약서', category: '협약서', date: '2022-07-14' },
  { id: '19', title: '여성기업 확인서 (서울지방중소벤처기업청)', category: '증명서', date: '2021-07-15' },
  { id: '20', title: '여성친화기업 협약서 (서초여성새로일하기센터)', category: '협약서', date: '2021-06-16' },
  { id: '21', title: '특허증 (통역서비스 제공 시스템)', category: '특허출원', date: '2023-04-24' },
  { id: '22', title: '트위그팜 전략적 업무제휴 협약서', category: '협약서', date: '2022-05-02' },
  { id: '23', title: '여성친화기업 협약서 (서초새일센터)', category: '협약서', date: '2021-06-16' },
  { id: '24', title: '연구개발전담부서 인정서 (과학기술정보통신부)', category: '증명서', date: '2021-10-22' },
  { id: '25', title: '와이즈에스티글로벌 협약서 (업무제휴)', category: '협약서', date: '2019-04-15' },
  { id: '26', title: '이즈커뮤니케이션즈 전략적 업무제휴 협약서', category: '협약서', date: '2018-09-18' },
  { id: '27', title: '중소기업 확인서 (소기업/소상공인)', category: '증명서', date: '2022-03-31' },
  { id: '28', title: '창업기업 확인서 (중소벤처기업부)', category: '증명서', date: '2022-03-03' },
  { id: '29', title: '출원사실증명원 (특허 출원 증명)', category: '증명서', date: '2021-09-30' },
  { id: '30', title: '특허증 (번역서비스 제공 시스템)', category: '특허출원', date: '2023-04-24' },
  { id: '31', title: '휴텍씨-한국정보통신윤리지도자협회 협약서', category: '협약서', date: '2022-06-20' },
  { id: '32', title: '출원사실증명원 (LLM 프롬프팅 최적화)', category: '증명서', date: '2024-02-28' },
  { id: '33', title: '출원사실증명원 (본-프롬프팅 최적화)', category: '증명서', date: '2024-02-28' },
];

function seedPhotosIfEmpty() {
  const db = getDB();
  const row = db.prepare('SELECT COUNT(*) AS c FROM photos').get();
  if (row.c > 0) {
    console.log(`[seed-photos] photos 테이블에 ${row.c}행 이미 존재 — 시드 skip`);
    return { seeded: 0, existing: row.c };
  }

  const insert = db.prepare(
    "INSERT INTO photos (photo_id, data, updated_at) VALUES (?, ?, datetime('now'))"
  );
  const tx = db.transaction((items) => {
    for (const it of items) {
      const pdfFile = PDF_MAP[it.id];
      const data = {
        id: it.id,
        title: it.title,
        category: it.category,
        date: it.date,
        url: '', // 썸네일은 클라이언트 THUMBNAIL_MAP에서 id로 lookup
        ...(pdfFile ? {
          fileUrl: `${S3_DOC_BASE}/${pdfFile}`,
          fileName: `${it.title}.pdf`,
        } : {}),
      };
      insert.run(it.id, JSON.stringify(data));
    }
  });
  tx(PHOTO_ITEMS);
  console.log(`[seed-photos] ${PHOTO_ITEMS.length}개 항목 시드 완료 (PDF 매핑 ${Object.keys(PDF_MAP).length}개)`);
  return { seeded: PHOTO_ITEMS.length, existing: 0 };
}

module.exports = { seedPhotosIfEmpty, PHOTO_ITEMS, PDF_MAP };

if (require.main === module) {
  seedPhotosIfEmpty();
}
