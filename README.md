# HellMap 🔥

실시간 감정 공유 플랫폼 - 지역별 감정을 시각화하고 공유하는 사이버펑크 테마의 웹 애플리케이션

## 🚀 빠른 시작

### 1. 프로젝트 클론 및 설치

```bash
git clone <repository-url>
cd hellmap
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일 생성:

```bash
cp .env.example .env
```

`.env` 파일에서 네이버 지도 API 클라이언트 ID를 설정:

```env
VITE_NAVER_MAPS_CLIENT_ID=your_naver_maps_client_id_here
```

### 3. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 애플리케이션을 확인할 수 있습니다.

## 🛠️ 기술 스택

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS v4, CSS Variables
- **UI Components**: Radix UI
- **Build Tool**: Vite
- **Maps**: Naver Maps API
- **Notifications**: Sonner
- **Icons**: Lucide React

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── ui/                  # 기본 UI 컴포넌트
│   ├── icons/              # 감정 아이콘 컴포넌트
│   ├── figma/              # Figma 전용 컴포넌트
│   ├── Header.tsx          # 상단 헤더
│   ├── MainSection.tsx     # 메인 섹션 (지도+피드)
│   ├── MapSection.tsx      # 네이버 지도 컴포넌트
│   ├── ReportFeed.tsx      # 제보 피드
│   ├── ReportForm.tsx      # 제보 작성 폼
│   ├── LoginPage.tsx       # 로그인 페이지
│   └── ...
├── styles/
│   └── globals.css         # 전역 CSS 및 사이버펑크 테마
├── types/
│   └── naver-maps.d.ts     # 네이버 지도 API 타입 정의
├── App.tsx                 # 메인 앱 컴포넌트
└── main.tsx               # 앱 진입점
```

## 🌟 주요 기능

### 🗺️ 네이버 지도 통합
- 실시간 지역별 감정 분석 시각화
- 감정별 색상 코딩된 마커
- 지역 클릭 시 상세 통계 표시

### 📱 소셜 로그인
- 카카오/구글 로그인 지원
- 신규 사용자 닉네임 설정
- 환영 화면 및 온보딩

### 📝 감정 제보 시스템
- 세 가지 감정 카테고리 (개무섭, 개짜증, 개웃김)
- 이미지/동영상 업로드
- 위치 기반 제보
- 제보 수정 기능

### 🤖 AI 분석
- 지역별 감정 통계 분석
- AI 이미지 생성
- 키워드 추출
- 지옥도 레벨 계산

### 🎨 사이버펑크 테마
- 네온 컬러 시스템
- 커스텀 애니메이션
- 다크 모드 디자인
- 반응형 레이아웃

## 🔧 개발 스크립트

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# 린트 검사
npm run lint
```

## 🌐 API 설정

### 네이버 지도 API
1. [네이버 클라우드 플랫폼](https://www.ncloud.com/)에서 계정 생성
2. Maps API 서비스 신청
3. 웹 동적 지도 API 사용 신청
4. 클라이언트 ID 발급
5. `.env` 파일에 클라이언트 ID 설정

### 🤖 Hugging Face AI 이미지 생성 (100% 무료!)
1. [Hugging Face](https://huggingface.co/) 계정 생성
2. [Settings > Access Tokens](https://huggingface.co/settings/tokens)에서 무료 토큰 발급
3. 프로젝트 루트에 `.env` 파일 생성:
```bash
# .env 파일
VITE_HUGGING_FACE_TOKEN=your_token_here
VITE_NAVER_MAPS_CLIENT_ID=your_naver_maps_client_id
```
4. 토큰이 없어도 Mock 이미지로 작동하지만, 실제 AI 이미지를 원하면 토큰 설정 필요

### 🎯 AI 이미지 생성 작동 방식
- **토큰 없음**: 자동으로 Mock 이미지 사용 (즉시 작동)
- **토큰 설정**: Stable Diffusion 2.1로 실제 AI 이미지 생성 
- **API 오류**: 자동으로 Mock 이미지로 fallback
- **완전 무료**: Hugging Face Inference API는 100% 무료 (속도 제한만 있음)

### 📝 .env 파일 생성 방법
프로젝트 루트에 `.env` 파일 생성 후 다음 내용 추가:
```
VITE_HUGGING_FACE_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_NAVER_MAPS_CLIENT_ID=your_naver_maps_client_id
```

## 📦 의존성

### 주요 의존성
- `react`: React 라이브러리
- `@radix-ui/*`: 접근성 좋은 UI 컴포넌트
- `tailwindcss`: 유틸리티 CSS 프레임워크
- `lucide-react`: 아이콘 라이브러리
- `sonner`: 토스트 알림
- `react-hook-form`: 폼 관리

### 개발 의존성
- `vite`: 빌드 도구
- `typescript`: 타입스크립트
- `@vitejs/plugin-react`: React Vite 플러그인

## 🎯 주요 컴포넌트

### MapSection
- 네이버 지도 API 통합
- 감정별 마커 표시
- 지역별 데이터 분석

### ReportFeed
- 실시간 제보 목록
- 감정별 필터링
- 제보 상세보기

### LoginPage
- 소셜 로그인 인터페이스
- 사이버펑크 디자인
- 반응형 레이아웃

## 🚨 문제 해결

### 네이버 지도 로드 오류
- 네이버 지도 API 클라이언트 ID 확인
- 네트워크 연결 상태 확인
- 브라우저 콘솔에서 오류 메시지 확인

### 빌드 오류
- Node.js 버전 확인 (v16 이상 권장)
- 의존성 재설치: `rm -rf node_modules package-lock.json && npm install`

## 📄 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 생성해 주세요.