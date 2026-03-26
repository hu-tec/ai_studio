// 마스터 네비게이션 바 - 모든 페이지에 공통 삽입
(function() {
  const ACCOUNTS = {
    admin: { pw: 'admin', name: '테스트관리자', role: 'admin' },
    staff: { pw: 'staff', name: '테스트직원', role: 'staff' },
    guest: { pw: 'guest', name: '게스트', role: 'guest' },
  };

  const ROLE_LABELS = { admin: '관리자', staff: '직원', guest: '소비자' };
  const ROLE_COLORS = { admin: '#3b82f6', staff: '#10b981', guest: '#f59e0b' };

  function getAuth() {
    try { return JSON.parse(localStorage.getItem('hutechc_auth') || 'null'); } catch { return null; }
  }
  function setAuth(auth) { localStorage.setItem('hutechc_auth', JSON.stringify(auth)); }
  function clearAuth() { localStorage.removeItem('hutechc_auth'); }

  function getMenus(role) {
    const all = {
      guest: [
        { label: '홈', href: '/home.html' },
        { label: 'TESOL 신청', href: '/app/tesol' },
        { label: '레벨테스트', href: '/app/level-test' },
        { label: '면접 안내', href: '/면접_main.html' },
      ],
      staff: [
        { label: '업무일지', href: '/app/work-log' },
        { label: '서약서', href: '/app/pledge' },
        { label: '사내업무지침', href: '/app/guidelines' },
        { label: '레슨플랜', href: '/app/lesson-plan' },
        { label: '메뉴얼', href: '/메뉴얼_메인.html' },
      ],
      admin: [
        { label: '데이터 관리', href: '/admin.html' },
        { label: '면접 평가', href: '/app/interview' },
        { label: '출퇴근', href: '/app/attendance' },
        { label: '미팅', href: '/app/meetings' },
        { label: '거래처', href: '/app/outbound-calls' },
        { label: '강의시간표', href: '/app/schedule' },
        { label: '규정관리', href: '/app/rules-mgmt' },
        { label: '더보기', href: '/app/admin-system' },
      ],
    };
    return all[role] || all.guest;
  }

  function login(id, pw) {
    const acc = ACCOUNTS[id];
    if (!acc || acc.pw !== pw) return false;
    setAuth({ id, name: acc.name, role: acc.role });
    return true;
  }

  function render() {
    const auth = getAuth();
    const role = auth ? auth.role : 'guest';
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
    ['guest','staff','admin'].forEach(r => {
      const btn = document.createElement('button');
      btn.textContent = ROLE_LABELS[r];
      btn.style.cssText = `padding:3px 10px;border:none;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .15s;${role===r?'background:'+ROLE_COLORS[r]+';color:#fff;':'background:rgba(255,255,255,.1);color:rgba(255,255,255,.6);'}`;
      btn.onclick = () => {
        if (!auth && r !== 'guest') { showLogin(); return; }
        if (auth && r !== auth.role) {
          // 역할 전환: 해당 역할 계정으로 로그인
          const accId = r === 'admin' ? 'admin' : r === 'staff' ? 'staff' : 'guest';
          if (r === 'guest') { clearAuth(); } else { login(accId, accId); }
          render();
          return;
        }
        render();
      };
      tabs.appendChild(btn);
    });
    nav.appendChild(tabs);

    // 메뉴 링크
    const menuWrap = document.createElement('div');
    menuWrap.style.cssText = 'display:flex;gap:2px;flex:1;overflow-x:auto;';
    menus.forEach(m => {
      const a = document.createElement('a');
      a.href = m.href;
      a.textContent = m.label;
      const isActive = location.pathname === m.href || location.pathname.startsWith(m.href.replace('.html',''));
      a.style.cssText = `padding:3px 8px;border-radius:4px;color:${isActive?'#fff':'rgba(255,255,255,.65)'};background:${isActive?'rgba(255,255,255,.15)':'none'};text-decoration:none;font-size:11px;white-space:nowrap;transition:all .15s;`;
      a.onmouseenter = () => a.style.background = 'rgba(255,255,255,.15)';
      a.onmouseleave = () => { if(!isActive) a.style.background = 'none'; };
      menuWrap.appendChild(a);
    });
    nav.appendChild(menuWrap);

    // 로그인 상태
    const userArea = document.createElement('div');
    userArea.style.cssText = 'display:flex;align-items:center;gap:6px;margin-left:auto;';
    if (auth) {
      userArea.innerHTML = `<span style="font-size:11px;color:${ROLE_COLORS[role]};font-weight:600;background:rgba(255,255,255,.1);padding:2px 8px;border-radius:4px;">${ROLE_LABELS[role]}</span><span style="font-size:11px;">${auth.name}</span>`;
      const logoutBtn = document.createElement('button');
      logoutBtn.textContent = '로그아웃';
      logoutBtn.style.cssText = 'padding:2px 8px;border:1px solid rgba(255,255,255,.2);border-radius:4px;background:none;color:rgba(255,255,255,.6);font-size:10px;cursor:pointer;font-family:inherit;';
      logoutBtn.onclick = () => { clearAuth(); render(); };
      userArea.appendChild(logoutBtn);
    } else {
      const loginBtn = document.createElement('button');
      loginBtn.textContent = '로그인';
      loginBtn.style.cssText = 'padding:3px 12px;border:none;border-radius:4px;background:#3b82f6;color:#fff;font-size:11px;cursor:pointer;font-family:inherit;font-weight:600;';
      loginBtn.onclick = showLogin;
      userArea.appendChild(loginBtn);
    }
    nav.appendChild(userArea);

    document.body.prepend(nav);

    // breadcrumb 추가
    const existingBc = document.getElementById('master-breadcrumb');
    if (existingBc) existingBc.remove();
    const bc = document.createElement('div');
    bc.id = 'master-breadcrumb';
    bc.style.cssText = 'position:fixed;top:36px;left:0;right:0;z-index:9998;background:#fff;border-bottom:1px solid #e2e8f0;padding:2px 14px;font-family:Pretendard,-apple-system,sans-serif;font-size:11px;color:#94a3b8;height:22px;display:flex;align-items:center;gap:4px;';
    const path = location.pathname;
    const PAGE_NAMES = {
      '/': '홈', '/home.html': '홈', '/dashboard.html': '프로세스', '/admin.html': '데이터 관리',
      '/면접_main.html': '면접 안내', '/면접_알바.html': '면접 › 알바', '/면접_직원.html': '면접 › 직원',
      '/면접_전문직.html': '면접 › 전문직', '/면접_전문직_규정.html': '면접 › 전문직규정',
      '/면접_강사_프롬프트ver.html': '면접 › 강사(프롬프트)', '/면접_강사_윤리ver.html': '면접 › 강사(윤리)',
      '/면접_강사_테솔ver.html': '면접 › 강사(테솔)', '/면접_강사_번역사ver.html': '면접 › 강사(번역)',
      '/업무일지_260225.html': '업무일지', '/메뉴얼_메인.html': '메뉴얼',
      '/app/tesol': 'TESOL 신청', '/app/level-test': '레벨테스트',
      '/app/work-log': '업무일지(직원)', '/app/work-log/admin': '업무일지(관리)',
      '/app/pledge': '서약서', '/app/guidelines': '사내업무지침', '/app/lesson-plan': '레슨플랜',
      '/app/interview': '면접 입력', '/app/interview/dashboard': '면접 대시보드',
      '/app/attendance': '출퇴근 관리', '/app/meetings': '미팅 관리',
      '/app/outbound-calls': '거래처 아웃콜', '/app/photo-dashboard': '사진모음',
      '/app/schedule': '강의시간표', '/app/rules-mgmt': '규정관리', '/app/rules-editor': '규정편집',
      '/app/eval-criteria': '평가기준', '/app/admin-system': '관리자통합',
    };
    const pageName = PAGE_NAMES[path] || path;
    const roleLabel = ROLE_LABELS[role];
    bc.innerHTML = `<a href="/" style="color:#64748b;text-decoration:none;">AI Studio</a> <span style="color:#cbd5e1;">›</span> <span style="color:#64748b;">${roleLabel}</span> <span style="color:#cbd5e1;">›</span> <span style="color:#1e293b;font-weight:500;">${pageName}</span>`;
    nav.after(bc);

    // body padding 조정 (네비 36px + breadcrumb 22px)
    document.body.style.paddingTop = '58px';
  }

  function showLogin() {
    let overlay = document.getElementById('login-overlay');
    if (overlay) { overlay.remove(); return; }
    overlay = document.createElement('div');
    overlay.id = 'login-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);z-index:10000;display:flex;align-items:center;justify-content:center;';
    overlay.onclick = (e) => { if(e.target===overlay) overlay.remove(); };
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:12px;padding:24px;width:320px;box-shadow:0 20px 60px rgba(0,0,0,.2);font-family:Pretendard,-apple-system,sans-serif;">
        <h3 style="margin:0 0 16px;font-size:16px;color:#1e293b;">로그인</h3>
        <div style="margin-bottom:8px;font-size:12px;color:#64748b;">테스트 계정</div>
        <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px;">
          <button onclick="window._mnLogin('admin','admin')" style="padding:10px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;cursor:pointer;text-align:left;font-family:inherit;">
            <b style="color:#3b82f6;">관리자</b> <span style="color:#94a3b8;font-size:11px;">admin / admin</span>
          </button>
          <button onclick="window._mnLogin('staff','staff')" style="padding:10px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;cursor:pointer;text-align:left;font-family:inherit;">
            <b style="color:#10b981;">직원</b> <span style="color:#94a3b8;font-size:11px;">staff / staff</span>
          </button>
          <button onclick="window._mnLogin('guest','guest')" style="padding:10px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;cursor:pointer;text-align:left;font-family:inherit;">
            <b style="color:#f59e0b;">소비자</b> <span style="color:#94a3b8;font-size:11px;">guest / guest</span>
          </button>
        </div>
        <div style="font-size:10px;color:#94a3b8;text-align:center;">시연용 테스트 계정입니다</div>
      </div>`;
    document.body.appendChild(overlay);
  }

  window._mnLogin = function(id, pw) {
    if (login(id, pw)) {
      const overlay = document.getElementById('login-overlay');
      if (overlay) overlay.remove();
      render();
    }
  };

  // 초기 렌더
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
