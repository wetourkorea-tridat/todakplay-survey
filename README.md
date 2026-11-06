# 토닥플레이 홈페이지 구성 설문

대표님께 보낼 설문. 1부 홈페이지에 넣을 내용(27개 항목), 2부 디자인 시안(C · D) 선택.
응답은 Apps Script를 거쳐 Google Sheets에 쌓인다. (홍신고 설문과 같은 구조)

```
[설문 페이지 (GitHub Pages)] --POST text/plain--> [Apps Script 웹 앱 /exec] --> [Sheet: Responses · Items · Summary]
```

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

1. 빈 스프레드시트 만들기 (이름 예: `토닥플레이 홈페이지 설문`) → **확장 프로그램 → Apps Script**
2. `Code.gs`를 통째로 붙여넣고, 맨 위 `SHARED_TOKEN`을 랜덤 문자열로 바꾸기 → 저장
3. 함수 `setup` 선택 → **실행** (처음엔 권한 허용: 고급 → 프로젝트로 이동 → 허용) → `Responses` · `Items` · `Summary` 탭 생성
4. (선택) `testInsert` 실행 → TEST 줄 확인 후 삭제
5. **배포 → 새 배포 → 웹 앱** / 실행: **나** / 액세스: **모든 사용자** → `/exec` URL 복사
6. `config.js`에 `SUBMIT_URL`(그 URL), `SUBMIT_TOKEN`(2번 값) 넣기

코드 수정 후에는 **배포 관리 → 연필 → 새 버전 → 배포** (URL 유지). "새 배포"를 누르면 URL이 바뀜.

## 시트 구조

- **Responses** — 응답 1건 = 1줄. 페이지별 선택 항목, 시안, 좋은 요소, 움직임, 보유 사진, 참고 · 피할 느낌
- **Items** — 응답 1건마다 27줄 (항목별 선택 TRUE/FALSE + 준비 자료). 개발 때 CMS 칸 목록 · 자료 요청 목록으로 바로 씀
- **Summary** — 응답 수, 최근 응답의 선택 항목과 준비 자료 목록

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
