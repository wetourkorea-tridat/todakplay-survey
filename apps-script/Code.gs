// 토닥플레이 홈페이지 구성 설문 → Google Sheets
// 1) SHARED_TOKEN을 랜덤 문자열로 바꾸고 config.js의 SUBMIT_TOKEN과 맞추기
// 2) setup 실행 → 3) 웹 앱으로 배포 (README 참고)

const SHARED_TOKEN = 'CHANGE_ME';

const RESP_HEAD = ['받은 시각', '제출 시각', 'clientId', '선택 항목 수', '메인', '소개', '프로그램', '공통', '추가 내용',
  '디자인 시안', '시안 메모', '좋은 요소', '움직임', '보유 사진', '참고 사이트', '피할 느낌', 'userAgent'];
const ITEM_HEAD = ['받은 시각', 'clientId', '페이지', '항목 ID', '항목', '준비 자료', '선택'];

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const resp = sheet_(ss, 'Responses', RESP_HEAD);
  const items = sheet_(ss, 'Items', ITEM_HEAD);
  const sum = ss.getSheetByName('Summary') || ss.insertSheet('Summary');
  sum.clear();
  sum.getRange('A1:B1').setValues([['응답 수', '=MAX(0,COUNTA(Responses!A:A)-1)']]);
  sum.getRange('A2:B2').setValues([['최근 응답', '=IFERROR(INDEX(Responses!A:A,COUNTA(Responses!A:A)),"")']]);
  sum.getRange('A4').setValue('최근 응답 기준 선택 항목 (Items 탭에서 마지막 clientId 필터)');
  sum.getRange('A5').setFormula('=IFERROR(QUERY(Items!A:G,"select C,E,F where B = \'"&INDEX(Responses!C:C,COUNTA(Responses!C:C))&"\' and G = TRUE order by C",1),"")');
  [resp, items, sum].forEach((s) => s.setFrozenRows(1));
  sum.getRange('A1:A2').setFontWeight('bold');
}

function sheet_(ss, name, head) {
  const s = ss.getSheetByName(name) || ss.insertSheet(name);
  if (s.getMaxColumns() < head.length) s.insertColumnsAfter(s.getMaxColumns(), head.length - s.getMaxColumns());
  s.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold');
  return s;
}

function doPost(e) {
  try {
    const p = JSON.parse(e.postData.contents);
    if (p.token !== SHARED_TOKEN) return json_({ ok: false, error: 'invalid token' });
    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const now = new Date(), a = p.answers || {}, items = p.items || [];
      const byPage = (name) => items.filter((x) => x.page === name && x.selected).map((x) => x.title).join(', ');
      ss.getSheetByName('Responses').appendRow([now, p.submittedAt, p.clientId, items.filter((x) => x.selected).length,
        byPage('메인 페이지'), byPage('소개 페이지'), byPage('프로그램 페이지'), byPage('공통'), a.contentExtra || '',
        a.design || '', a.designNote || '', (a.likes || []).join(', '), a.motion || '', (a.photos || []).join(', '),
        a.refs || '', a.avoid || '', p.ua || '']);
      const rows = items.map((x) => [now, p.clientId, x.page, x.id, x.title, x.need, !!x.selected]);
      if (rows.length) {
        const sh = ss.getSheetByName('Items');
        sh.getRange(sh.getLastRow() + 1, 1, rows.length, ITEM_HEAD.length).setValues(rows);
      }
    } finally { lock.releaseLock(); }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function testInsert() {
  doPost({ postData: { contents: JSON.stringify({ token: SHARED_TOKEN, clientId: 'TEST', submittedAt: new Date().toISOString(),
    answers: { design: 'D', likes: ['넓은 여백'] }, items: [{ page: '메인 페이지', id: 'm1', title: '대표 사진과 한 줄 소개', need: '사진', selected: true }] }) } });
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
