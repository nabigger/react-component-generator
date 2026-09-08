---
name: create-pr
description: Create a GitHub pull request from the current branch. Automatically detects project language (Korean or English) from CLAUDE.md and applies the appropriate PR template. Use this skill whenever you need to create a PR, propose changes back to a repository, or submit work for code review. The skill handles branch creation, committing changes, and opening the PR on GitHub using a fork-based approach via a background agent.
compatibility:
  required_tools:
    - Bash
    - Agent (fork)
---

# Create PR Skill

완료한 작업을 GitHub PR로 제출하기 위한 스킬입니다. 이 스킬은 포크 기반 서브 에이전트를 사용해 백그라운드에서 PR을 생성합니다.

## 사용법

PR을 생성하려면 다음 정보를 제공하세요:

### 필수 정보
- **PR 제목** (title): 한 줄 요약 (50자 이내 권장)
- **PR 본문** (body): 변경사항 설명

### 선택 정보
- **브랜치명** (branch): 자동 생성됨 (기본: feature/{timestamp})
- **베이스 브랜치** (base): 기본값 main/master 자동 감지

## 작동 방식

1. **언어 감지**: 프로젝트의 CLAUDE.md에서 language 설정을 읽음
   - `language: 한국어` → 한국어 PR 템플릿 적용
   - 기타 → 영문 PR 템플릿 적용

2. **포크 기반 에이전트**: 백그라운드 fork 서브 에이전트가:
   - 새 feature 브랜치 생성
   - 현재 변경사항 커밋 (AI attribution 포함)
   - GitHub에 푸시
   - PR 생성 (적절한 템플릿 사용)

3. **PR 템플릿**: `references/` 폴더의 언어별 템플릿 적용
   - `template-ko.md`: 한국어 PR 템플릿
   - `template-en.md`: 영문 PR 템플릿

## 템플릿 구조

### 한국어 템플릿
```
## 📝 설명
[변경사항 설명]

## 🔄 변경 사항
- [주요 변경]

## ✅ 테스트 계획
- [테스트 방법]

## 📋 체크리스트
- [ ] 코드 리뷰 완료
- [ ] 테스트 통과
```

### 영문 템플릿
```
## Summary
[Summary of changes]

## Changes
- [Key change]

## Test Plan
- [How to test]

## Checklist
- [ ] Code reviewed
- [ ] Tests passing
```

## 주의사항

- 원격 저장소가 설정되어 있어야 합니다 (`git remote -v` 확인)
- 현재 브랜치에 미커밋 변경사항이 있어야 합니다
- GitHub CLI (`gh`) 인증이 필요합니다 (`gh auth login`)

## 예시

사용자가 이렇게 요청할 수 있습니다:

> "새 기능을 완료했어. PR 제목은 'feat(component): add new Button component'이고, 변경사항은 '새로운 Button 컴포넌트를 추가했습니다. props validation과 unit test도 포함되어 있습니다.'"

스킬이 이를 처리하면:
1. CLAUDE.md에서 언어 설정 확인
2. 적절한 PR 템플릿 선택
3. 포크 서브 에이전트 실행
4. 백그라운드에서 PR 생성
5. 사용자에게 PR URL 제공
