'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { safeFetch } from '@/lib/utils';

interface SessionListSession {
  id: string;
  messageCount: number;
  sourceCount: number;
  status: string;
  template: {
    name: string;
  };
  title: string;
  updatedAt: string;
}

interface SessionListProps {
  sessions: SessionListSession[];
}

interface DeleteResponse {
  message: string;
}

function SessionList({ sessions }: SessionListProps) {
  const router = useRouter();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const handleDeleteClick = (sessionId: string) => {
    setConfirmDeleteId(sessionId);
    setDeleteError('');
  };

  const handleDeleteCancel = () => {
    setConfirmDeleteId(null);
    setDeleteError('');
  };

  const handleDeleteConfirm = async (sessionId: string) => {
    setIsDeletingId(sessionId);
    setDeleteError('');

    const result = await safeFetch<DeleteResponse>(`/api/sessions/${sessionId}`, {
      method: 'DELETE',
    });

    setIsDeletingId(null);
    setConfirmDeleteId(null);

    if (!result.success) {
      setDeleteError(result.error);
      return;
    }

    router.refresh();
  };

  if (sessions.length === 0) {
    return (
      <div className="workspace-card-muted p-6 text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">
          아직 시작한 작업이 없습니다. 새 작업을 만들어 산파술 인터뷰를 시작하세요.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {deleteError.length > 0 ? (
        <div className="border-[var(--color-error)]/20 rounded-[var(--radius-md)] border bg-[var(--color-error-light)] px-4 py-3 text-sm text-[var(--color-error)]">
          {deleteError}
        </div>
      ) : null}

      {sessions.map((session) => {
        const isConfirming = confirmDeleteId === session.id;
        const isDeleting = isDeletingId === session.id;

        return (
          <div
            className="workspace-card group transition hover:border-[var(--color-accent)]"
            key={session.id}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="meta">{session.template.name}</span>
              <div className="flex items-center gap-2">
                <span className="badge badge-neutral">{session.status}</span>
                {isConfirming ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--color-error)]">삭제하시겠습니까?</span>
                    <button
                      className="text-xs font-semibold text-[var(--color-error)] hover:underline disabled:opacity-50"
                      disabled={isDeleting}
                      onClick={() => void handleDeleteConfirm(session.id)}
                      type="button"
                    >
                      {isDeleting ? '삭제 중...' : '확인'}
                    </button>
                    <button
                      className="text-xs font-semibold text-[var(--color-text-secondary)] hover:underline"
                      disabled={isDeleting}
                      onClick={handleDeleteCancel}
                      type="button"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button
                    className="text-xs text-[var(--color-text-tertiary)] opacity-0 transition hover:text-[var(--color-error)] group-hover:opacity-100"
                    onClick={() => handleDeleteClick(session.id)}
                    type="button"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
            <Link href={`/workspace/session/${session.id}`}>
              <h3 className="font-headline mb-2 text-lg font-bold text-[var(--color-text)] group-hover:text-[var(--color-accent)]">
                {session.title}
              </h3>
              <div className="flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
                <p>
                  메시지 {session.messageCount}개 · 자료 {session.sourceCount}개
                </p>
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">
                  {session.updatedAt.slice(0, 16).replace('T', ' ')}
                </p>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}

export { SessionList };
export type { SessionListProps, SessionListSession };
