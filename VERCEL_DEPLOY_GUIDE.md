# Vercel 배포 가이드 (비개발자용 친절 설명서)

이 프로젝트는 Vite + React + Tailwind CSS + Google Firebase Firestore 기반의 웹 애플리케이션입니다.
Vercel에 배포할 때 아무런 문제 없이 단 2분 만에 배포할 수 있도록 설정되어 있습니다.

---

## 🚀 Vercel 배포 방법 (초간단 3단계)

### 1단계: GitHub에 코드 올리기
1. 현재 프로젝트 코드를 GitHub 리포지토리(Repository)에 업로드(Push)합니다.
   * `firebase-applet-config.json` 및 `vercel.json` 파일이 포함되어 있는지 확인합니다.

### 2단계: Vercel에서 프로젝트 가져오기
1. [Vercel 공식 웹사이트(vercel.com)](https://vercel.com)에 로그인합니다.
2. 대시보드에서 **[Add New...]** > **[Project]**를 클릭합니다.
3. GitHub 계정을 연동한 후, 방금 코드를 올린 리포지토리를 선택하고 **[Import]**를 클릭합니다.

### 3단계: 빌드 설정 및 배포 클릭
1. **Framework Preset**: Vercel이 자동으로 **Vite**로 인식합니다.
2. **Root Directory**: `./` (기본값 그대로 유지)
3. **Build Command**: `npm run build` (기본값)
4. **Output Directory**: `dist` (기본값)
5. **[Deploy]** 버튼을 클릭합니다!

약 1분 후 `https://your-project.vercel.app` 과 같은 무료 HTTPS 도메인이 생성되며 전 세계 어디서나 접근 가능한 상태가 됩니다.

---

## 🔑 Firebase 연결 확인 (중요)
* 프로젝트 루트의 `firebase-applet-config.json`에 Firebase Firestore 접속 정보가 미리 설정되어 있어, Vercel의 Environment Variables(환경 변수)를 따로 복잡하게 넣지 않아도 Firebase Firestore 및 관리자 로그인 기능이 즉시 정상 작동합니다.
* 혹시 환경 변수를 이용하고 싶으실 경우 Vercel 대시보드의 **Settings > Environment Variables**에서 설정하실 수도 있습니다.
