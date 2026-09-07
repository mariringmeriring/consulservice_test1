import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { db } from '../firebase';
import type { ConsultationFormData, ConsultationItem, ConsultationStatus } from '../types';

const COLLECTION_NAME = 'consultations';

/**
 * 신규 상담 요청을 Firebase Firestore DB에 저장합니다.
 */
export async function createConsultation(data: ConsultationFormData): Promise<string> {
  const collectionRef = collection(db, COLLECTION_NAME);
  const now = new Date().toISOString();
  
  const docRef = await addDoc(collectionRef, {
    title: data.title.trim(),
    content: data.content.trim(),
    clientName: data.clientName.trim() || '익명 의뢰인',
    contact: data.contact.trim() || '미기재',
    category: data.category,
    isUrgent: !!data.isUrgent,
    status: 'pending' as ConsultationStatus,
    createdAt: now,
  });

  return docRef.id;
}

/**
 * Firestore DB의 실시간 변경 사항을 구독(Listener)합니다.
 * 새 상담글이 등록되거나 수정/삭제되면 자동으로 UI에 전달됩니다.
 */
export function subscribeToConsultations(
  onSuccess: (items: ConsultationItem[]) => void,
  onError: (error: Error) => void
) {
  const collectionRef = collection(db, COLLECTION_NAME);
  // 최신 등록순으로 정렬
  const q = query(collectionRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: ConsultationItem[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          title: d.title || '제목 없음',
          content: d.content || '',
          clientName: d.clientName || '익명 의뢰인',
          contact: d.contact || '미기재',
          category: d.category || '일반 문의',
          status: (d.status as ConsultationStatus) || 'pending',
          createdAt: d.createdAt || new Date().toISOString(),
          reply: d.reply,
          repliedAt: d.repliedAt,
          isUrgent: !!d.isUrgent,
        };
      });
      onSuccess(items);
    },
    (err) => {
      console.error('Firestore subscription error:', err);
      onError(err);
    }
  );
}

/**
 * 상담 처리 상태 변경 (접수대기, 상담중, 완료)
 */
export async function updateConsultationStatus(id: string, status: ConsultationStatus): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, { status });
}

/**
 * 상담 답변 또는 관리자 메모 등록
 */
export async function updateConsultationReply(id: string, reply: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, { 
    reply: reply.trim(),
    repliedAt: new Date().toISOString(),
    status: 'completed' as ConsultationStatus
  });
}

/**
 * 상담 데이터 삭제
 */
export async function deleteConsultation(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}
