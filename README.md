# 토닥플레이 홈페이지 구성 설문

대표님께 보낼 설문. 1부 홈페이지에 넣을 내용(27개 항목), 2부 디자인 시안(C · D) 선택.
응답은 Apps Script를 거쳐 공용 시트 `todakplay survey response`에 쌓이고, 응답마다 wetourkorea@gmail.com으로 메일이 간다.

```
[설문 페이지 (GitHub Pages)] --POST text/plain--> [Apps Script 웹 앱 /exec] --> [Sheet: <surveyId> · <surveyId> 상세] + 메일
```

**시트는 설문마다 새로 만들지 않고 재사용한다.** 설문마다 `data.js`의 `id`(예: `2026-11 홈페이지 구성`) 이름으로 탭이 생기고, 열은 보낸 `fields` 이름대로 자동으로 추가된다. 새 설문을 만들 때는 Apps Script를 고치거나 다시 배포하지 않고 같은 `SUBMIT_URL` · `SUBMIT_TOKEN`을 쓴다.

보내는 형식: `{ token, surveyId, clientId, fields: { 열 이름: 값 }, details?: [{ 열 이름: 값 }] }`
배열 값은 `, `로 이어 한 칸에 넣는다. `details`가 있으면 `<surveyId> 상세` 탭에 줄 단위로 쌓인다.

## 파일

| 파일 | 내용 |
|---|---|
| `index.html` · `styles.css` · `app.js` | 설문 페이지 (빌드 없음, 바닐라 JS) |
| `data.js` | 문항 · 항목 · 시안 설명. **문구 수정은 여기서만** |
| `config.js` | Apps Script URL · 토큰 (배포 후 채우기) |
| `designs/` | 시안 C · D 전체 페이지 ("전체 화면 보기" 링크) |
| `img/` | 시안 캡처 (히어로 · 긴 캡처) |
| `apps-script/Code.gs` | 시트에 붙여넣을 수집 코드 |

## 시트 연결

처음 한 번만 하면 된다.

1. 구글 시트에서 빈 스프레드시트 `todakplay survey response` 만들기 → **확장 프로그램 → Apps Script**
2. `Code.gs`를 통째로 붙여넣고, 맨 위 `SHARED_TOKEN`을 랜덤 문자열로 바꾸기 → 저장
3. 함수 `testInsert` 선택 → **실행** → 권한 허용 (고급 → 프로젝트로 이동 → 허용. 시트 · 메일 권한)
4. `TEST` · `TEST 상세` 탭과 테스트 메일이 왔는지 확인 → 두 탭 삭제
5. **배포 → 새 배포 → 유형: 웹 앱** / 실행: **나** / 액세스: **모든 사용자** → `/exec` URL 복사
6. `config.js`에 `SUBMIT_URL`(그 URL), `SUBMIT_TOKEN`(2번 값) 넣기

코드를 고친 뒤에는 **배포 관리 → 연필 → 버전: 새 버전 → 배포**로 올린다 (URL 유지). "새 배포"를 누르면 URL이 바뀐다.

## 시트 구조 (이 설문 기준)

- **2026-11 홈페이지 구성** — 응답 1건 = 1줄. 페이지별 선택 항목, 시안, 좋은 요소, 움직임, 보유 사진, 참고 · 피할 느낌
- **2026-11 홈페이지 구성 상세** — 응답 1건마다 27줄 (항목별 선택 TRUE/FALSE + 준비 자료). 개발 때 CMS 칸 목록 · 자료 요청 목록으로 바로 쓴다

## 다음 설문 만들 때

이 폴더를 복사해 새 레포로 만들고 `data.js`의 `id`를 새로 정한다 → 문항 · `app.js`의 `fields`를 바꾼다 → `config.js`는 그대로 둔다.

## 배포 (GitHub Pages)

1. 깃허브에 Public 레포 생성 (예: `todakplay-survey`) → 이 폴더 내용 업로드
2. Settings → Pages → Branch `main` / root → 저장
3. 주소: `https://<계정>.github.io/todakplay-survey/`

## 기타

- 진행 중 내용은 브라우저에 임시 저장 → 닫았다 다시 열어도 이어서 진행
- 제출 후 다시 열면 완료 화면. 테스트할 땐 주소 뒤에 `?reset=1`
- `SUBMIT_URL`이 비어 있으면: 로컬(localhost)에서는 콘솔 출력만, 배포 주소에서는 오류 표시(가짜 성공 방지)
- 로컬 실행: `python -m http.server 8000` → http://localhost:8000
- 문항 수정: `data.js` / 캐시 때문에 반영이 안 보이면 `index.html`의 `?v=1`을 `?v=2`로
- 시안 C · D를 고치면 `designs/`와 `img/` 캡처도 같이 교체
