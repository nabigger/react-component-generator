# TDD Rule

**이 규칙은 Rigid — 상황에 맞게 변형하지 마라. 예외는 프로젝트의 CLAUDE.md/AGENTS.md에서만 정의한다.**

## 적용 기준 구분

### TDD 반드시 적용 대상

- **비즈니스 로직**: 도메인 규칙, 상태 전환, 계산 로직
- **API & 서버 라우트**: 요청 검증, 응답 포맷, 에러 처리
- **유틸 함수**: `utils.ts`, `helpers.ts` 등 재사용 가능한 함수
- **훅 (Hooks)**: `useComponentGenerator`, `useState` 래퍼 등 상태 관리
- **버그 수정**: 버그 재현 테스트 먼저, 그 다음 수정

### TDD 불필요 대상

- **타입 정의**: TypeScript 인터페이스, `type` 별칭 (컴파일러가 검증)
- **설정 파일**: `vite.config.ts`, `tsconfig.json`, `.env` 관리
- **순수 UI 컴포넌트**: 렌더링만 하는 프레젠테이션 컴포넌트 (스토리북/시각적 검증 가능)
- **SQL/데이터베이스**: DB 스키마, 마이그레이션 (별도 도구 검증)
- **import/export 문**: 모듈 구조 (타입 체커가 검증)

---

## RED-GREEN-REFACTOR 사이클

### RED 단계: 실패하는 테스트 작성

1. **하나의 동작 = 하나의 테스트**
   - 테스트 이름은 동작을 명확히 서술: `"APIが401を返すとエラーメッセージが表示される"` (O) vs `"API テスト"` (X)
   - 한 테스트는 하나의 assert만 검증 (독립성)

2. **반드시 실행해서 실패 확인**
   - `bun run test` 또는 `bun run test:watch`로 실행
   - 테스트가 빨간색(실패)이 되는 것을 눈으로 확인할 것
   - 스크린샷/터미널 출력 기록 (코드 리뷰 시 증거)

3. **실패 이유가 "기능 미구현"이어야 함**
   - ❌ "Cannot find module 'xyz'" (테스트 설정 오류)
   - ❌ "SyntaxError" (테스트 코드 오타)
   - ✅ "AssertionError: expected undefined to equal 'value'" (기능 미구현)

### GREEN 단계: 최소한의 코드로 통과

1. **YAGNI 원칙 (You Aren't Gonna Need It)**
   - 테스트를 통과하기 위한 **최소** 코드만 작성
   - "나중에 쓸 것 같아"라는 코드는 절대 추가 금지
   - 하드코딩 OK (나중에 REFACTOR 단계에서 일반화)

2. **신규 + 기존 테스트 모두 통과 확인**
   - `bun run test` 전체 실행 (새 테스트만 통과는 불충분)
   - 기존 기능이 깨졌는지 확인

3. **최소 구현 예시**
   ```typescript
   // RED: "getUser(1)은 { id: 1, name: 'Alice' }를 반환한다"
   function getUser(id: number) {
     return { id: 1, name: 'Alice' };  // 하드코딩 OK
   }
   // REFACTOR에서 나중에 DB 로직으로 개선
   ```

### REFACTOR 단계: 코드 개선 (테스트 안 바뀜)

1. **허용하는 개선**
   - 중복 제거 (DRY)
   - 변수/함수명 명확화
   - 헬퍼 함수 추출
   - 하드코딩 → 로직으로 일반화

2. **금지 사항**
   - **새로운 동작 추가 금지** (RED로 돌아가기)
   - 테스트 코드 변경 금지 (다른 구현 시도 중)
   - 여러 개선을 동시에 하지 말 것 (한 번에 하나)

3. **GREEN 상태 유지 확인**
   - 각 개선 후 `bun run test` 실행
   - 테스트가 여전히 통과하는지 확인

### 반복

다음 동작에 대해 RED로 돌아가기 (위 사이클 반복)

---

## 삭제 강제 규칙

### 테스트 먼저 원칙 위반 시

**상황:** 테스트를 작성하기 전에 프로덕션 코드를 먼저 작성했다면

**명령:** **완전 삭제 후 RED부터 재시작**
- "참고용으로 주석 처리"는 금지
- "나중에 테스트 추가하겠다"는 금지
- 이미 작동하는 코드라도 TDD 사이클을 따르지 않으면 거부

**이유:** 코드는 항상 테스트에 의해 주도되어야 한다. 사후 테스트는 "좋은 테스트"를 만들지 못함.

---

## 변명 차단표

| 변명 | 반론 | 대응 |
|------|------|------|
| **"너무 단순해서 테스트 불필요"** | 단순할수록 테스트 쓰기 쉽다. "단순하니까 테스트 없어도 되는" 로직은 드물다. | 테스트 작성하라 |
| **"나중에 추가하겠다"** | 나중은 오지 않는다. 나중에 추가하면 "사후 테스트"가 되어 TDD의 이점 상실. | 지금 RED로 시작하라 |
| **"시간이 없다"** | TDD는 시간을 절약한다 (디버깅 시간 90% 감소). 시간 부족은 TDD를 건너뛰는 이유가 아니라 더 필요한 신호. | 시간을 내고 테스트 작성하라 |
| **"삭제하면 이미 작동하는 코드가 낭비된다"** | 테스트 없는 코드는 낭비된 것과 같다. 유지보수 불가능하고 리팩토링할 수 없다. | 삭제하고 TDD로 재구현하라 |
| **"프로토타입이므로 테스트 불필요"** | 프로토타입이 프로덕션이 되는 경우가 많다. 처음부터 테스트하는 습관이 중요. 프로토타입도 TDD로 진행하라. | TDD를 지켜서 프로토타입을 개발하라 |

---

## 프로젝트별 규칙 우선 조항

**이 파일은 Fallback (기본값)이다.**

1. 프로젝트의 **CLAUDE.md** 또는 **AGENTS.md**에 TDD 규칙이 명시되어 있으면 그것을 **우선 따른다**
2. 그곳에서 언급하지 않은 부분만 이 파일을 참고한다
3. 충돌이 생기면 프로젝트 문서를 선택한다

**확인 방법:**
```bash
# 프로젝트별 규칙 확인
grep -i "test\|tdd" CLAUDE.md AGENTS.md
```

---

## 빠른 체크리스트

테스트를 시작하기 전에 이 목록을 확인하라:

- [ ] 이것이 TDD 적용 대상인가? (위의 "적용 기준" 참고)
- [ ] 프로젝트의 CLAUDE.md/AGENTS.md에 TDD 규칙이 있는가? (있으면 그것 따르기)
- [ ] RED 단계: 테스트를 작성했는가?
- [ ] RED 단계: 테스트를 실행해서 **빨간색 실패**를 확인했는가?
- [ ] 실패 이유가 "기능 미구현"인가?
- [ ] GREEN 단계: 최소 코드를 작성했는가?
- [ ] GREEN 단계: 신규 + 기존 테스트가 모두 통과하는가?
- [ ] REFACTOR: 코드를 개선할 부분이 있는가? (GREEN 유지)
- [ ] REFACTOR: 새 동작을 추가하지 않았는가?
- [ ] 반복 준비: 다음 RED 테스트를 작성할 준비가 되었는가?

---

## 실전 예제: 프롬프트 500자 제한 검증 함수

### RED 단계: 실패하는 테스트 작성

```typescript
// src/utils/validatePrompt.test.ts
import { describe, it, expect } from 'vitest';
import { validatePromptLength } from './validatePrompt';

describe('validatePromptLength', () => {
  it('500자 이하의 프롬프트는 true를 반환한다', () => {
    expect(validatePromptLength('a'.repeat(500))).toBe(true);
  });

  it('500자를 초과하는 프롬프트는 false를 반환한다', () => {
    expect(validatePromptLength('a'.repeat(501))).toBe(false);
  });

  it('빈 문자열은 true를 반환한다', () => {
    expect(validatePromptLength('')).toBe(true);
  });
});
```

**실행:** `bun run test -- src/utils/validatePrompt.test.ts`
**결과:** ❌ 실패 (Cannot find module)

### GREEN 단계: 최소 코드로 통과

```typescript
// src/utils/validatePrompt.ts
export function validatePromptLength(prompt: string): boolean {
  return prompt.length <= 500;
}
```

**실행:** `bun run test` (전체 + 기존 테스트 통과 확인)
**결과:** ✅ 모두 통과

### REFACTOR 단계: 상수 추출 + 에러 메시지 함수

```typescript
// src/utils/validatePrompt.ts
const MAX_PROMPT_LENGTH = 500;

export function validatePromptLength(prompt: string): boolean {
  return prompt.length <= MAX_PROMPT_LENGTH;
}

export function getPromptLengthError(prompt: string): string | null {
  if (prompt.length > MAX_PROMPT_LENGTH) {
    const excess = prompt.length - MAX_PROMPT_LENGTH;
    return `프롬프트가 ${excess}자 초과합니다. 최대 ${MAX_PROMPT_LENGTH}자까지 가능합니다.`;
  }
  return null;
}
```

**테스트 추가:**
```typescript
it('초과한 글자 수를 정확히 계산한다', () => {
  const error = getPromptLengthError('a'.repeat(550));
  expect(error).toContain('50자 초과');
});
```

**검증:** `bun run test` (기존 테스트 여전히 통과)
