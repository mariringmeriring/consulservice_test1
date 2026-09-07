import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../firebase';
import type { User } from '../types';

const USERS_COLLECTION = 'users';
const AUTH_STORAGE_KEY = 'consultflow_current_user';

// 기본 관리자 계정 정보 (사용자 요구사항: 아이디 admin / 비밀번호 123)
export const DEFAULT_ADMIN: User & { password?: string } = {
  id: 'admin_root',
  username: 'admin',
  name: '최고 관리자',
  role: 'admin',
  password: '123',
  createdAt: new Date().toISOString(),
};

/**
 * 앱 시작 시 Firebase Firestore에 admin 계정이 존재하는지 확인하고,
 * 없으면 자동으로 생성해 둡니다.
 */
export async function ensureAdminUserExists(): Promise<void> {
  try {
    const adminDocRef = doc(db, USERS_COLLECTION, 'admin');
    const adminSnap = await getDoc(adminDocRef);
    if (!adminSnap.exists()) {
      await setDoc(adminDocRef, {
        username: 'admin',
        name: '최고 관리자',
        role: 'admin',
        password: '123',
        createdAt: new Date().toISOString(),
      });
      console.log('Firebase에 admin 계정이 정상 등록되었습니다.');
    }
  } catch (error) {
    console.warn('Admin user setup note (local fallback available):', error);
  }
}

/**
 * 현재 로컬 스토리지에 저장된 로그인 사용자 정보를 불러옵니다.
 */
export function getCurrentSessionUser(): User | null {
  try {
    const data = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as User;
  } catch {
    return null;
  }
}

/**
 * 로그인 세션을 저장합니다.
 */
export function saveSessionUser(user: User): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

/**
 * 로그아웃
 */
export function clearSessionUser(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * 로그인 처리 함수
 * - 아이디가 admin이고 비밀번호가 123인 경우 관리자로 즉시 로그인
 * - 그 외의 경우 Firestore 'users' 컬렉션에서 아이디/비밀번호 확인
 */
export async function loginUser(usernameInput: string, passwordInput: string): Promise<User> {
  const username = usernameInput.trim();
  const password = passwordInput.trim();

  if (!username) {
    throw new Error('아이디를 입력해 주세요.');
  }
  if (!password) {
    throw new Error('비밀번호를 입력해 주세요.');
  }

  // 1. 관리자(admin / 123) 확인
  if (username === 'admin' && password === '123') {
    const adminUser: User = {
      id: 'admin',
      username: 'admin',
      name: '최고 관리자',
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    saveSessionUser(adminUser);
    // 비동기로 Firestore에도 admin 계정 저장 보장
    ensureAdminUserExists().catch(() => {});
    return adminUser;
  }

  // 2. 일반 회원 로그인 검증 (Firestore)
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('존재하지 않는 아이디입니다. 아이디를 확인해 주시거나 회원가입을 진행해 주세요.');
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    if (userData.password !== password) {
      throw new Error('비밀번호가 올바르지 않습니다.');
    }

    const loggedInUser: User = {
      id: userDoc.id,
      username: userData.username,
      name: userData.name || userData.username,
      role: userData.role || 'user',
      createdAt: userData.createdAt || new Date().toISOString(),
    };

    saveSessionUser(loggedInUser);
    return loggedInUser;
  } catch (err: any) {
    if (err.message && err.message.includes('비밀번호') || err.message.includes('존재하지 않는')) {
      throw err;
    }
    // 네트워크/DB 오류 발생 시 안내
    throw new Error(err.message || '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
  }
}

/**
 * 신규 회원가입 처리 함수
 * - 사용자 아이디, 비밀번호, 이름을 Firestore에 안전하게 저장합니다.
 */
export async function signupUser(usernameInput: string, passwordInput: string, nameInput: string): Promise<User> {
  const username = usernameInput.trim();
  const password = passwordInput.trim();
  const name = nameInput.trim() || username;

  if (!username) {
    throw new Error('사용하실 아이디를 입력해 주세요.');
  }
  if (username.length < 3) {
    throw new Error('아이디는 최소 3자 이상 입력해 주세요.');
  }
  if (username.toLowerCase() === 'admin') {
    throw new Error("'admin' 아이디는 관리자 전용이므로 가입하실 수 없습니다.");
  }
  if (!password) {
    throw new Error('비밀번호를 입력해 주세요.');
  }
  if (password.length < 3) {
    throw new Error('비밀번호는 보안을 위해 3자 이상 입력해 주세요.');
  }

  try {
    // 중복 아이디 검사
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where('username', '==', username));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      throw new Error('이미 사용 중인 아이디입니다. 다른 아이디를 입력해 주세요.');
    }

    // 신규 사용자 등록
    const userDocRef = doc(usersRef);
    const newUserRecord = {
      username,
      name,
      password, // 비개발자 데모용 평문 저장 (실제 환경에서는 암호화 해시 적용)
      role: 'user' as const,
      createdAt: new Date().toISOString(),
    };

    await setDoc(userDocRef, newUserRecord);

    const createdUser: User = {
      id: userDocRef.id,
      username,
      name,
      role: 'user',
      createdAt: newUserRecord.createdAt,
    };

    saveSessionUser(createdUser);
    return createdUser;
  } catch (err: any) {
    if (err.message) {
      throw err;
    }
    throw new Error('회원가입 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
  }
}
