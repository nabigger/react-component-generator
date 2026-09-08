# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## 프로젝트 개요

React Component Generator는 AI 프롬프트로부터 React 컴포넌트를 실시간으로 생성하고 미리보기할 수 있는 웹 애플리케이션입니다. Anthropic Claude 또는 Google Gemini를 AI 제공자로 사용할 수 있습니다.

## 개발 환경 설정

### 의존성 설치
```bash
bun install
```

### .env 파일 설정
```bash
cp .env.example .env
# ANTHROPIC_API_KEY 또는 GOOGLE_API_KEY를 입력
```

## 주요 명령어

### 개발 서버 실행
```bash
bun run dev
```
- API 서버(포트 3002)와 Vite 프론트엔드(포트 5173)를 동시에 실행
- Vite는 `/api/*` 요청을 자동으로 서버로 프록시

### 개별 명령어
```bash
bun run server        # API 서버만 (watch 모드)
bun run build         # TypeScript + Vite 빌드
bun run lint          # ESLint 실행
bun run test          # Vitest 테스트 실행 (한 번)
bun run test:watch    # Vitest 워치 모드
bun run preview       # 빌드된 프론트엔드 미리보기
```

## 프로젝트 구조

```
src/
├── components/        # React UI 컴포넌트
│   ├── PromptInput    # 프롬프트 입력 폼
│   ├── ComponentCard  # 생성된 컴포넌트 카드
│   ├── LivePreview    # react-live 미리보기 렌더러
│   └── CodeView       # 코드 표시 영역
├── hooks/            # 커스텀 React 훅
│   ├── useComponentGenerator  # 컴포넌트 생성 API 호출 로직
│   └── useComponentState      # 컴포넌트 상태 관리
├── utils.ts          # 유틸리티 함수 (formatDate, truncate, clamp, debounce)
├── types/            # TypeScript 타입 정의
├── test/             # 테스트 설정
└── App.tsx           # 메인 애플리케이션 컴포넌트

server/
├── index.ts          # Bun 서버 엔트리 포인트 & API 라우팅
├── generator.ts      # 생성된 코드 처리 로직
├── fallback.ts       # Google 모델 폴백 로직
└── *.test.ts         # 서버 테스트
```

## 핵심 아키텍처

### Frontend-Backend 통신
1. **API 엔드포인트**: `/api/generate` (POST)
   - 프롬프트, API 키(선택), 프로바이더(anthropic/google) 전달
   - 생성된 코드를 응답으로 반환

2. **설정 조회**: `/api/config` (GET)
   - .env에 설정된 API 키 존재 여부 확인

### 프롬프트 → 코드 생성 흐름
1. 사용자가 프롬프트 입력 및 프로바이더 선택
2. `useComponentGenerator.generate()` 호출
3. 서버에서 선택된 AI API 호출
4. 생성된 코드 정처리 (stripCodeFences, ensureRenderCall)
5. react-live로 렌더링 및 코드 표시

### 코드 생성 규칙 (SYSTEM_PROMPT)
- 순수 JavaScript만 사용 (TypeScript 문법 금지)
- 인라인 스타일만 (CSS 임포트/모듈 금지)
- React를 전역으로 사용 가능 (임포트 불필요)
- 자체 포함 컴포넌트 (외부 의존성 없음)
- 마지막에 `render(<ComponentName />)` 호출 필수

### Google Gemini 폴백 로직
- `gemini-3.1-flash-lite` → `gemini-3.5-flash` 순서로 폴백
- 모델 실패 시 다음 모델 자동 시도

## 기술 스택

- **Frontend**: React 19, TypeScript ~5.9, Vite 8, react-live 4
- **Backend**: Bun 1.3+
- **테스트**: Vitest 4, @testing-library/react 16, jsdom 29
- **린팅**: ESLint 9, typescript-eslint 8
- **빌드**: Vite, TypeScript 컴파일러

## 테스트

### 테스트 파일 위치
- `src/**/*.test.tsx` - 프론트엔드 테스트
- `server/**/*.test.ts` - 백엔드 테스트

### 테스트 설정
- 테스트 환경: jsdom
- Setup 파일: `src/test/setup.ts`
- 각 테스트 후 DOM 자동 정리 (격리성 보장)

### 테스트 실행
```bash
bun run test              # 모든 테스트 한 번 실행
bun run test:watch        # 워치 모드
bun run test -- src/components/PromptInput.test.tsx  # 특정 파일 실행
```

## 주요 컴포넌트 역할

| 컴포넌트 | 역할 |
|---------|------|
| `App` | 레이아웃, API 키 관리, 전체 상태 오케스트레이션 |
| `PromptInput` | 프롬프트 입력 폼, 예시 프롬프트 버튼 |
| `ComponentCard` | 생성된 컴포넌트 카드 (미리보기 + 코드) |
| `LivePreview` | react-live를 이용한 동적 렌더링 |
| `CodeView` | 생성된 코드 표시 및 복사 |

## 환경 변수

| 변수 | 설명 |
|------|------|
| `ANTHROPIC_API_KEY` | Claude API 키 (선택) |
| `GOOGLE_API_KEY` | Gemini API 키 (선택) |

- 두 키 모두 설정하거나 둘 다 설정하지 않아도 됨
- 클라이언트에서 UI로 입력 가능
- 서버는 클라이언트 키를 환경변수보다 우선함

## 주의사항

### 코드 생성 관련
- `react-live`는 순수 JS만 지원하므로 TypeScript 문법 사용 불가
- 사용자가 제공한 코드를 `eval` 형태로 실행하므로 신뢰할 수 있는 소스만 사용
- 생성된 컴포넌트는 별도 보안 샌드박스에서 실행되지 않음

### API 호출
- Anthropic: `claude-haiku-4-5-20251001` 모델 사용
- Google: 모델 폴백 지원, 최대 토큰 제한 감지 및 사용자 메시지 표시
- 요청 실패 시 서버에서 CORS 헤더와 함께 에러 응답

## 빌드 및 배포

### 프로덕션 빌드
```bash
bun run build
```
- TypeScript 컴파일 + Vite 번들링
- 출력: `dist/` 디렉토리

### 정적 파일 제공
- `public/` 디렉토리의 파일은 빌드 후 루트에 복사됨
- `index.html`은 Vite 엔트리 포인트

## 개발 팁

- Vite proxy 덕분에 로컬에서 CORS 걱정 없이 개발 가능
- 서버 코드 변경 시 `bun run server`를 재시작해야 함
- 프론트엔드는 Vite의 HMR로 자동 새로고침
- 스타일은 `App.css`와 각 컴포넌트별 CSS 파일에 정의

## 성능 최적화

- `useCallback`을 이용한 함수 재참조 방지
- 컴포넌트 생성 중 로딩 상태 표시 (`isLoading` 플래그)
- 에러 배너로 사용자 피드백 제공
