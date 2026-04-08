// 마스터 네비게이션 바 - 모든 페이지에 공통 삽입
(function() {
  const ROLE_LABELS = { all: '전체', guest: '소비자', staff: '직원', admin: '관리자' };
  const ROLE_COLORS = { all: '#8b5cf6', guest: '#f59e0b', staff: '#3b82f6', admin: '#ef4444' };
  const ROLE_ORDER = ['all', 'guest', 'staff', 'admin'];

  function getRole() { return localStorage.getItem('hutechc_role') || 'all'; }
  function setRole(r) {
    localStorage.setItem('hutechc_role', r);
    window.dispatchEvent(new CustomEvent('hutechc-role-change', { detail: r }));
  }

  function getMenus(role) {
    const guest = [
      { label: '홈', href: '/home.html' },
      { label: 'TESOL 신청', href: '/app/tesol' },
      { label: '레벨테스트', href: '/app/level-test' },
      { label: '면접 안내', href: '/면접_main.html' },
    ];
    const staff = [
      { label: '업무일지', href: '/app/work-log' },
      { label: '서약서', href: '/app/pledge' },
      { label: '사내업무지침', href: '/app/company-guidelines' },
      { label: '레슨플랜', href: '/app/lesson-plan' },
      { label: '메뉴얼', href: '/메뉴얼_메인.html' },
    ];
    const admin = [
      { label: '데이터 관리', href: '/admin.html' },
      { label: '채용관리', href: '/app/recruitment' },
      { label: '출퇴근', href: '/app/attendance' },
      { label: '미팅', href: '/app/meetings' },
      { label: '거래처', href: '/app/outbound-calls' },
      { label: '강의시간표', href: '/app/schedule' },
      { label: '규정관리', href: '/app/rules-mgmt' },
      { label: '관리자통합', href: '/app/admin-system' },
    ];
    if (role === 'all') return [...guest, ...staff, ...admin];
    if (role === 'staff') return [...staff];
    if (role === 'admin') return [...admin];
    return guest;
  }

  function render() {
    const role = getRole();
    const menus = getMenus(role);
    const existing = document.getElementById('master-nav');
    if (existing) existing.remove();

    const nav = document.createElement('div');
    nav.id = 'master-nav';
    nav.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:#1e293b;color:#fff;font-family:Pretendard,-apple-system,sans-serif;font-size:13px;display:flex;align-items:center;height:36px;padding:0 12px;gap:8px;box-shadow:0 2px 8px rgba(0,0,0,.15);';

    // 로고
    nav.innerHTML = '<div style="display:flex;align-items:center;gap:6px;margin-right:8px;"><div style="width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,#5ee7ff,#4c2fff);"></div><b style="font-size:13px;">AI Studio</b></div>';

    // 역할 탭
    const tabs = document.createElement('div');
    tabs.style.cssText = 'display:flex;gap:2px;margin-right:8px;';
    ROLE_ORDER.forEach(function(r) {
      var btn = document.createElement('button');
      btn.textContent = ROLE_LABELS[r];
      btn.style.cssText = 'padding:3px 10px;border:none;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .15s;' + (role === r ? 'background:' + ROLE_COLORS[r] + ';color:#fff;' : 'background:rgba(255,255,255,.1);color:rgba(255,255,255,.6);');
      btn.onclick = function() { setRole(r); render(); };
      tabs.appendChild(btn);
    });
    nav.appendChild(tabs);

    // 메뉴 링크
    var menuWrap = document.createElement('div');
    menuWrap.style.cssText = 'display:flex;gap:2px;flex:1;overflow-x:auto;';
    menus.forEach(function(m) {
      var a = document.createElement('a');
      a.href = m.href;
      a.textContent = m.label;
      var isActive = location.pathname === m.href || location.pathname.startsWith(m.href.replace('.html', ''));
      a.style.cssText = 'padding:3px 8px;border-radius:4px;color:' + (isActive ? '#fff' : 'rgba(255,255,255,.65)') + ';background:' + (isActive ? 'rgba(255,255,255,.15)' : 'none') + ';text-decoration:none;font-size:11px;white-space:nowrap;transition:all .15s;';
      a.onmouseenter = function() { a.style.background = 'rgba(255,255,255,.15)'; };
      a.onmouseleave = function() { if (!isActive) a.style.background = 'none'; };
      menuWrap.appendChild(a);
    });
    nav.appendChild(menuWrap);

    // 현재 역할 표시
    var roleArea = document.createElement('div');
    roleArea.style.cssText = 'display:flex;align-items:center;gap:6px;margin-left:auto;';
    roleArea.innerHTML = '<span style="font-size:11px;color:' + ROLE_COLORS[role] + ';font-weight:600;background:rgba(255,255,255,.1);padding:2px 8px;border-radius:4px;">' + ROLE_LABELS[role] + ' 모드</span>';
    nav.appendChild(roleArea);

    document.body.prepend(nav);

    // breadcrumb
    var existingBc = document.getElementById('master-breadcrumb');
    if (existingBc) existingBc.remove();
    var bc = document.createElement('div');
    bc.id = 'master-breadcrumb';
    bc.style.cssText = 'position:fixed;top:36px;left:0;right:0;z-index:9998;background:#fff;border-bottom:1px solid #e2e8f0;padding:2px 14px;font-family:Pretendard,-apple-system,sans-serif;font-size:11px;color:#94a3b8;height:22px;display:flex;align-items:center;gap:4px;';
    var path = location.pathname;
    var PAGE_NAMES = {
      '/': '홈', '/home.html': '홈', '/dashboard.html': '프로세스', '/admin.html': '데이터 관리',
      '/면접_main.html': '면접 안내', '/면접_알바.html': '면접 › 알바', '/면접_직원.html': '면접 › 직원',
      '/면접_전문직.html': '면접 › 전문직', '/면접_전문직_규정.html': '면접 › 전문직규정',
      '/면접_강사_프롬프트ver.html': '면접 › 강사(프롬프트)', '/면접_강사_윤리ver.html': '면접 › 강사(윤리)',
      '/면접_강사_테솔ver.html': '면접 › 강사(테솔)', '/면접_강사_번역사ver.html': '면접 › 강사(번역)',
      '/업무일지_260225.html': '업무일지', '/메뉴얼_메인.html': '메뉴얼',
      '/app/tesol': 'TESOL 신청', '/app/level-test': '레벨테스트',
      '/app/work-log': '업무일지(직원)', '/app/work-log/admin': '업무일지(관리)',
      '/app/pledge': '서약서', '/app/company-guidelines': '사내업무지침', '/app/lesson-plan': '레슨플랜',
      '/app/interview': '면접 입력', '/app/interview/dashboard': '면접 대시보드',
      '/app/attendance': '출퇴근 관리', '/app/meetings': '미팅 관리',
      '/app/outbound-calls': '거래처 아웃콜', '/app/photo-dashboard': '사진모음',
      '/app/schedule': '강의시간표', '/app/rules-mgmt': '규정관리', '/app/rules-editor': '규정편집',
      '/app/eval-criteria': '평가기준', '/app/admin-system': '관리자통합',
      '/app/recruitment': '채용관리',
    };
    var pageName = PAGE_NAMES[path] || path;
    bc.innerHTML = '<a href="/" style="color:#64748b;text-decoration:none;">AI Studio</a> <span style="color:#cbd5e1;">›</span> <span style="color:' + ROLE_COLORS[role] + ';font-weight:500;">' + ROLE_LABELS[role] + '</span> <span style="color:#cbd5e1;">›</span> <span style="color:#1e293b;font-weight:500;">' + pageName + '</span>';
    nav.after(bc);

    document.body.style.paddingTop = '58px';
  }

  // 초기 렌더
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
