// todakplay survey response — 설문 공용 수집기
// 설문마다 surveyId 이름의 탭이 생기고, 열은 받은 fields 이름대로 자동으로 만든다.
// 그래서 새 설문을 만들어도 이 코드는 고치거나 다시 배포하지 않아도 된다.

const SHARED_TOKEN = 'CHANGE_ME';
const NOTIFY_TO = 'wetourkorea@gmail.com';

function doPost(e) {
  try {
    const p = JSON.parse(e.postData.contents);
    if (p.token !== SHARED_TOKEN) return json_({ ok: false, error: 'invalid token' });
    if (!p.surveyId || !p.fields) return json_({ ok: false, error: 'missing surveyId or fields' });
    const now = new Date();
    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      append_(ss, p.surveyId, [{ '받은 시각': now, clientId: p.clientId, ...p.fields }]);
      if (p.details && p.details.length) {
        append_(ss, p.surveyId + ' 상세', p.details.map((d) => ({ '받은 시각': now, clientId: p.clientId, ...d })));
      }
    } finally { lock.releaseLock(); }
    notify_(p, now);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// 처음 보는 열 이름은 오른쪽 끝에 추가한다.
function append_(ss, name, objs) {
  const sh = ss.getSheetByName(name) || ss.insertSheet(name);
  let head = sh.getLastColumn() ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0] : [];
  const added = [];
  objs.forEach((o) => Object.keys(o).forEach((k) => { if (!head.includes(k) && !added.includes(k)) added.push(k); }));
  if (added.length) {
    if (sh.getMaxColumns() < head.length + added.length) sh.insertColumnsAfter(sh.getMaxColumns(), head.length + added.length - sh.getMaxColumns());
    sh.getRange(1, head.length + 1, 1, added.length).setValues([added]).setFontWeight('bold');
    head = head.concat(added);
    sh.setFrozenRows(1);
  }
  const rows = objs.map((o) => head.map((k) => cell_(o[k])));
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, head.length).setValues(rows);
}

function cell_(v) {
  if (v === undefined || v === null) return '';
  if (Array.isArray(v)) return v.join(', ');
  return v;
}

function notify_(p, now) {
  const body = Object.keys(p.fields).map((k) => `■ ${k}\n${cell_(p.fields[k]) || '-'}`).join('\n\n');
  MailApp.sendEmail(NOTIFY_TO, `[설문 응답] ${p.surveyId}`,
    `${Utilities.formatDate(now, 'Asia/Seoul', 'yyyy-MM-dd HH:mm')} 응답이 들어왔습니다.\n\n${body}\n\n시트: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}`);
}

// 권한 허용 + 동작 확인용. 실행 후 생긴 TEST 탭은 지우면 된다.
function testInsert() {
  doPost({ postData: { contents: JSON.stringify({ token: SHARED_TOKEN, surveyId: 'TEST', clientId: 'test',
    fields: { '디자인 시안': 'D', '좋은 요소': ['넓은 여백', '큰 제목'] },
    details: [{ '항목': '대표 사진', '선택': true }] }) } });
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
