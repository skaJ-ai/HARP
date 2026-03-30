'use client';

import { useEffect, useRef, useState, type ReactElement } from 'react';

import Link from 'next/link';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import useSWR from 'swr';

import type { DeliverableDetail } from '@/lib/deliverables/types';
import type { SessionChatMessage, SessionDetail } from '@/lib/sessions/types';
import { safeFetch } from '@/lib/utils';

interface SessionCanvasProps {
  initialSession: SessionDetail;
}

interface SessionDetailResponse {
  data: {
    session: SessionDetail;
  };
}

interface SourceCreateResponse {
  message: string;
}

interface GenerateDeliverableResponse {
  data: {
    deliverable: DeliverableDetail;
  };
  message: string;
}

interface SessionDetailFetcherResult {
  session: SessionDetail;
}

type CanvasTab = 'canvas' | 'references' | 'tools';

const PREVIEW_SECTION_CONTENT_MAX_LENGTH = 120;
const READINESS_PARTIAL_GENERATE_THRESHOLD = 70;

function createUiMessages(messages: SessionChatMessage[]): UIMessage[] {
  return messages.map((message) => ({
    id: message.id,
    parts: [
      {
        text: message.content,
        type: 'text',
      },
    ],
    role: message.role,
  }));
}

async function fetchSessionDetail(url: string): Promise<SessionDetailFetcherResult> {
  const result = await safeFetch<SessionDetailResponse>(url, {
    cache: 'no-store',
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  return {
    session: result.data.data.session,
  };
}

function getVisibleMessageText(message: UIMessage): string {
  return message.parts
    .filter(
      (part): part is Extract<(typeof message.parts)[number], { type: 'text' }> =>
        part.type === 'text',
    )
    .map((part) => part.text)
    .join('')
    .trim();
}

function getReadinessColor(percent: number): string {
  if (percent >= 100) {
    return 'var(--color-success)';
  }

  if (percent >= READINESS_PARTIAL_GENERATE_THRESHOLD) {
    return 'var(--color-teal)';
  }

  if (percent >= 50) {
    return 'var(--color-warning)';
  }

  return 'var(--color-error)';
}

function getReadinessMessage(percent: number): string {
  if (percent >= 100) {
    return '모든 항목이 채워졌습니다';
  }

  if (percent >= READINESS_PARTIAL_GENERATE_THRESHOLD) {
    return '나머지 없이 정리할 수 있습니다';
  }

  if (percent >= 50) {
    return '일부 항목이 남아 있습니다';
  }

  return '핵심 항목이 부족합니다';
}

function getReadinessBadgeClassName(percent: number): string {
  if (percent >= 100) {
    return 'badge-success';
  }

  if (percent >= READINESS_PARTIAL_GENERATE_THRESHOLD) {
    return 'badge-teal';
  }

  if (percent >= 50) {
    return 'badge-warning';
  }

  return 'badge-error';
}

function renderChecklistWeightDots(weight: number, isChecked: boolean): ReactElement[] {
  const dotToneClassName = isChecked ? 'status-dot-success' : 'status-dot-neutral';

  return Array.from({ length: weight }, (_, dotIndex) => (
    <span className={`status-dot ${dotToneClassName}`} key={`weight-dot-${weight}-${dotIndex}`} />
  ));
}

function getPreviewSectionContent(content: string): string {
  if (content.length === 0) {
    return '수집된 내용 없음 — 추정으로 작성됩니다';
  }

  if (content.length <= PREVIEW_SECTION_CONTENT_MAX_LENGTH) {
    return content;
  }

  return `${content.slice(0, PREVIEW_SECTION_CONTENT_MAX_LENGTH)}...`;
}

function SessionCanvas({ initialSession }: SessionCanvasProps) {
  const [activeTab, setActiveTab] = useState<CanvasTab>('canvas');
  const [chatInput, setChatInput] = useState('');
  const [expandedHelpItemId, setExpandedHelpItemId] = useState<string | null>(null);
  const [sourceContent, setSourceContent] = useState('');
  const [sourceLabel, setSourceLabel] = useState('');
  const [sourceType, setSourceType] = useState<'data' | 'table' | 'text'>('text');
  const [sourceError, setSourceError] = useState('');
  const [generateError, setGenerateError] = useState('');
  const [generateMessage, setGenerateMessage] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [lastGeneratedDeliverableId, setLastGeneratedDeliverableId] = useState('');
  const [isGenerateSubmitting, setIsGenerateSubmitting] = useState(false);
  const [isSourceSubmitting, setIsSourceSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: `/api/sessions/${initialSession.id}/chat`,
      }),
  );
  const {
    data: sessionResult,
    error: sessionError,
    isLoading: isSessionLoading,
    mutate: mutateSession,
  } = useSWR(`/api/sessions/${initialSession.id}`, fetchSessionDetail, {
    fallbackData: {
      session: initialSession,
    },
  });
  const {
    error: chatError,
    messages,
    sendMessage,
    status,
    stop,
  } = useChat({
    id: initialSession.id,
    messages: createUiMessages(initialSession.messages),
    onFinish: () => {
      void mutateSession();
    },
    transport,
  });
  const currentSession = sessionResult?.session ?? initialSession;
  const latestDeliverable = currentSession.latestDeliverable;
  const recentReferences = currentSession.recentReferences;
  const hasLatestDeliverable = Boolean(latestDeliverable) || lastGeneratedDeliverableId.length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCanvasTabClick = () => {
    setActiveTab('canvas');
  };

  const handleToolsTabClick = () => {
    setActiveTab('tools');
  };

  const handleReferencesTabClick = () => {
    setActiveTab('references');
  };

  const handleChatInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatInput(event.currentTarget.value);
  };

  const handleChatSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (chatInput.trim().length === 0 || status !== 'ready') {
      return;
    }

    sendMessage({
      text: chatInput.trim(),
    });
    setChatInput('');
  };

  const handleChecklistAskClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const itemLabel = event.currentTarget.dataset.itemLabel;

    if (!itemLabel) {
      return;
    }

    setChatInput(`"${itemLabel}" 항목이 정확히 뭘 말하는 건지 설명해 주세요.`);
  };

  const handleChecklistHelpToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const itemId = event.currentTarget.dataset.itemId;

    if (!itemId) {
      return;
    }

    setExpandedHelpItemId((previousId) => (previousId === itemId ? null : itemId));
  };

  const handleMethodologySuggestionClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const methodologyName = event.currentTarget.dataset.methodologyName;

    if (!methodologyName) {
      return;
    }

    setChatInput(`${methodologyName} 프레임으로 같이 정리해볼게요. 필요한 질문부터 이어가주세요.`);
  };

  const handleSourceContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSourceContent(event.currentTarget.value);
  };

  const handleSourceLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSourceLabel(event.currentTarget.value);
  };

  const handleSourceTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextType = event.currentTarget.value;

    if (nextType === 'text' || nextType === 'table' || nextType === 'data') {
      setSourceType(nextType);
    }
  };

  const handleSourceSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (sourceContent.trim().length === 0 || isSourceSubmitting) {
      return;
    }

    setIsSourceSubmitting(true);
    setSourceError('');

    const result = await safeFetch<SourceCreateResponse>(
      `/api/sessions/${initialSession.id}/source`,
      {
        body: JSON.stringify({
          content: sourceContent.trim(),
          label: sourceLabel.trim() || undefined,
          type: sourceType,
        }),
        headers: {
          'content-type': 'application/json',
        },
        method: 'POST',
      },
    );

    setIsSourceSubmitting(false);

    if (!result.success) {
      setSourceError(result.error);
      return;
    }

    setSourceContent('');
    setSourceLabel('');
    await mutateSession();
  };

  const handleGenerateClick = async () => {
    if (currentSession.readinessPercent < READINESS_PARTIAL_GENERATE_THRESHOLD) {
      return;
    }

    if (isGenerateSubmitting || status !== 'ready') {
      return;
    }

    setIsGenerateSubmitting(true);
    setGenerateError('');
    setGenerateMessage('');

    const result = await safeFetch<GenerateDeliverableResponse>(
      `/api/sessions/${initialSession.id}/generate`,
      {
        method: 'POST',
      },
    );

    setIsGenerateSubmitting(false);

    if (!result.success) {
      setGenerateError(result.error);
      return;
    }

    setLastGeneratedDeliverableId(result.data.data.deliverable.id);
    setGenerateMessage(
      `${result.data.message} · ${result.data.data.deliverable.status} v${result.data.data.deliverable.version}`,
    );
    await mutateSession();
  };

  const handleGeneratePreviewCancel = () => {
    setIsPreviewMode(false);
  };

  const handleGeneratePreviewConfirm = () => {
    setIsPreviewMode(false);
    void handleGenerateClick();
  };

  const handleGeneratePreviewOpen = () => {
    if (currentSession.readinessPercent < READINESS_PARTIAL_GENERATE_THRESHOLD) {
      return;
    }

    if (isGenerateSubmitting || status !== 'ready') {
      return;
    }

    setIsPreviewMode(true);
  };

  const isCanvasTabActive = activeTab === 'canvas';
  const isToolsTabActive = activeTab === 'tools';
  const isReferencesTabActive = activeTab === 'references';
  const completedChecklistCount = Object.values(currentSession.checklist).filter(Boolean).length;
  const readinessPercent = currentSession.readinessPercent;
  const readinessBarStyle = {
    backgroundColor: getReadinessColor(readinessPercent),
    width: `${readinessPercent}%`,
  };
  const readinessBadgeClassName = getReadinessBadgeClassName(readinessPercent);
  const readinessMessage = getReadinessMessage(readinessPercent);
  const hasEmptyPreviewSections = currentSession.canvas.sections.some(
    (section) => section.status === 'empty',
  );
  const isPartialGenerateAvailable =
    readinessPercent >= READINESS_PARTIAL_GENERATE_THRESHOLD && !currentSession.canGenerate;

  const renderMessage = (message: UIMessage) => {
    const visibleText = getVisibleMessageText(message);
    const roleLabel = message.role === 'user' ? '담당자' : 'HARP';
    const toneClass =
      message.role === 'user'
        ? 'border-[var(--color-accent)]/20 bg-[var(--color-accent-light)] text-[var(--color-text)]'
        : 'border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text)]';

    return (
      <article
        className={`rounded-[var(--radius-md)] border px-4 py-3 ${toneClass}`}
        key={message.id}
      >
        <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">
          <span>{roleLabel}</span>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-6">{visibleText}</p>
      </article>
    );
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
      {/* 왼쪽: 채팅 패널 */}
      <section className="surface flex min-h-[780px] flex-col shadow-[var(--shadow-2)]">
        <div className="border-b border-[var(--color-border)] px-6 py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-2">
              <span className="section-label">Canvas Chat</span>
              <h1 className="text-2xl font-bold text-[var(--color-text)]">
                {currentSession.title}
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {currentSession.template.name} · 대화 기반 산파술 인터뷰
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge badge-neutral">{currentSession.status}</span>
              {status === 'streaming' || status === 'submitted' ? (
                <button className="btn-secondary" onClick={stop} type="button">
                  응답 중지
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
          {messages.map(renderMessage)}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-[var(--color-border)] px-6 py-5">
          {chatError || sessionError ? (
            <div className="border-[var(--color-error)]/20 mb-4 rounded-[var(--radius-md)] border bg-[var(--color-error-light)] px-4 py-3 text-sm text-[var(--color-error)]">
              {chatError?.message ?? sessionError?.message}
            </div>
          ) : null}

          <form className="flex flex-col gap-3" onSubmit={handleChatSubmit}>
            <label className="text-sm font-semibold text-[var(--color-text)]" htmlFor="chat-input">
              질문이나 상황 설명
            </label>
            <textarea
              className="input-surface min-h-28"
              disabled={status !== 'ready'}
              id="chat-input"
              onChange={handleChatInputChange}
              placeholder="예: 이번 교육은 신임 리더 대상이었고, 만족도는 4.6점이었습니다."
              value={chatInput}
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-[var(--color-text-tertiary)]">
                한 번에 하나씩 답하면 HARP가 체크리스트를 추적합니다.
              </p>
              <button
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                disabled={status !== 'ready' || chatInput.trim().length === 0}
                type="submit"
              >
                {status === 'ready' ? '보내기' : '응답 대기 중'}
              </button>
            </div>
          </form>

          <form
            className="mt-6 flex flex-col gap-3 rounded-[var(--radius-md)] bg-[var(--color-bg-sunken)] p-4"
            onSubmit={handleSourceSubmit}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-[var(--color-text)]">근거자료 추가</h2>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  복사/붙여넣기한 메모, 표, 수치를 세션에 저장합니다.
                </p>
              </div>
              <span className="badge badge-teal">{currentSession.sources.length}개 저장됨</span>
            </div>

            {sourceError.length > 0 ? (
              <div className="border-[var(--color-error)]/20 rounded-[var(--radius-md)] border bg-[var(--color-error-light)] px-4 py-3 text-sm text-[var(--color-error)]">
                {sourceError}
              </div>
            ) : null}

            <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
              <input
                className="input-surface"
                onChange={handleSourceLabelChange}
                placeholder="자료 이름 (선택)"
                value={sourceLabel}
              />
              <select
                className="input-surface"
                onChange={handleSourceTypeChange}
                value={sourceType}
              >
                <option value="text">텍스트</option>
                <option value="table">표</option>
                <option value="data">데이터</option>
              </select>
            </div>
            <textarea
              className="input-surface min-h-24"
              onChange={handleSourceContentChange}
              placeholder="예: 참여율 92%, 만족도 4.6/5, 사전·사후 테스트 점수 평균 17% 상승"
              value={sourceContent}
            />
            <div className="flex justify-end">
              <button
                className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSourceSubmitting || sourceContent.trim().length === 0}
                type="submit"
              >
                {isSourceSubmitting ? '저장 중...' : '자료 저장'}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="surface flex min-h-[780px] flex-col overflow-hidden shadow-[var(--shadow-2)]">
        <div className="border-b border-[var(--color-border)] px-6 py-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex max-w-2xl flex-col gap-2">
                <span className="badge badge-neutral w-fit">Document Workspace</span>
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-semibold text-[var(--color-text)]">
                    {currentSession.canvas.title}
                  </h2>
                  <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                    체크리스트를 채우면서 같은 유형의 이전 산출물과 근거자료를 함께 참고할 수
                    있습니다.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`badge ${readinessBadgeClassName}`}>{readinessPercent}% 준비</span>
                <span className="badge badge-neutral">
                  {completedChecklistCount} / {currentSession.template.checklist.length} 완료
                </span>
                <span className="badge badge-neutral">자료 {currentSession.sources.length}개</span>
                {isPartialGenerateAvailable ? (
                  <button
                    className="btn-secondary focus-ring disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isGenerateSubmitting || status !== 'ready'}
                    onClick={handleGeneratePreviewOpen}
                    type="button"
                  >
                    {isGenerateSubmitting ? '정리 중...' : '부족한 채로 정리하기'}
                  </button>
                ) : null}
                <button
                  className="btn-teal focus-ring disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={
                    !currentSession.canGenerate || isGenerateSubmitting || status !== 'ready'
                  }
                  onClick={handleGeneratePreviewOpen}
                  type="button"
                >
                  {isGenerateSubmitting ? '정리 중...' : '정리하기'}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 border-t border-[var(--color-border-subtle)] pt-4">
              <button
                className={`tab ${isCanvasTabActive ? 'active' : ''}`}
                onClick={handleCanvasTabClick}
                type="button"
              >
                문서 캔버스
              </button>
              <button
                className={`tab ${isToolsTabActive ? 'active' : ''}`}
                onClick={handleToolsTabClick}
                type="button"
              >
                체크리스트 · 프레임워크
              </button>
              <button
                className={`tab ${isReferencesTabActive ? 'active' : ''}`}
                onClick={handleReferencesTabClick}
                type="button"
              >
                참고 자료
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isCanvasTabActive ? (
            <div className="flex flex-col gap-4">
              {isPreviewMode ? (
                <div className="rounded-[var(--radius-md)] border-2 border-[var(--color-accent)] bg-[var(--color-accent-light)] p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <p className="meta">Preview</p>
                      <h3 className="text-base font-semibold text-[var(--color-text)]">
                        생성 전 확인
                      </h3>
                    </div>
                    <span className={`badge ${readinessBadgeClassName}`}>
                      {readinessPercent}% 준비
                    </span>
                  </div>

                  <div className="mb-4 flex flex-col gap-2">
                    {currentSession.canvas.sections.map((section) => (
                      <div
                        className="flex items-start justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-bg)] px-3 py-2"
                        key={section.name}
                      >
                        <div className="flex flex-1 flex-col gap-1">
                          <p className="text-sm font-semibold text-[var(--color-text)]">
                            {section.name}
                          </p>
                          <p className="text-xs leading-5 text-[var(--color-text-secondary)]">
                            {getPreviewSectionContent(section.content)}
                          </p>
                        </div>
                        <span
                          className={`badge mt-0.5 ${section.status === 'complete' ? 'badge-success' : 'badge-warning'}`}
                        >
                          {section.status === 'complete' ? '준비됨' : '추정'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {hasEmptyPreviewSections ? (
                    <p className="mb-4 text-sm leading-6 text-[var(--color-warning)]">
                      수집되지 않은 섹션은 LLM이 추정으로 작성합니다. 근거가 부족할 수 있습니다.
                    </p>
                  ) : null}

                  <div className="flex items-center justify-end gap-3">
                    <button
                      className="btn-secondary focus-ring"
                      onClick={handleGeneratePreviewCancel}
                      type="button"
                    >
                      더 보충합니다
                    </button>
                    <button
                      className="btn-teal focus-ring disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isGenerateSubmitting}
                      onClick={handleGeneratePreviewConfirm}
                      type="button"
                    >
                      {isGenerateSubmitting ? '정리 중...' : '이대로 정리합니다'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {generateError.length > 0 ? (
                    <div className="border-[var(--color-error)]/20 rounded-[var(--radius-md)] border bg-[var(--color-error-light)] px-4 py-3 text-sm text-[var(--color-error)]">
                      {generateError}
                    </div>
                  ) : null}
                  {generateMessage.length > 0 ? (
                    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-sunken)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                      {generateMessage}
                    </div>
                  ) : null}

                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
                    <article className="doc-card p-5">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="flex flex-col gap-1">
                          <p className="meta">Readiness</p>
                          <h3 className="text-base font-semibold text-[var(--color-text)]">
                            초안 생성 준비도
                          </h3>
                        </div>
                        <span className={`badge ${readinessBadgeClassName}`}>
                          {readinessMessage}
                        </span>
                      </div>
                      <div className="mb-4 flex items-center gap-3">
                        <div className="h-2 flex-1 rounded-full bg-[var(--color-border-subtle)]">
                          <div
                            className="h-2 rounded-full transition-[width] duration-300"
                            style={readinessBarStyle}
                          />
                        </div>
                        <span className="text-sm font-semibold text-[var(--color-text)]">
                          {readinessPercent}%
                        </span>
                      </div>
                      <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                        가중치 기준 준비도입니다. 현황, 근거 같은 핵심 항목이 더 크게 반영되며, 비어
                        있는 항목은 보조 도구 탭에서 바로 확인할 수 있습니다.
                      </p>
                    </article>

                    {hasLatestDeliverable ? (
                      <article className="doc-card p-5">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className="flex flex-col gap-1">
                            <p className="meta">Latest Draft</p>
                            <h3 className="text-base font-semibold text-[var(--color-text)]">
                              {latestDeliverable?.title ?? currentSession.title}
                            </h3>
                          </div>
                          {latestDeliverable ? (
                            <div className="flex items-center gap-2">
                              <span className="badge badge-neutral">
                                {latestDeliverable.status}
                              </span>
                              <span className="badge badge-accent">
                                v{latestDeliverable.version}
                              </span>
                            </div>
                          ) : null}
                        </div>
                        <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                          {latestDeliverable?.preview ?? '방금 생성한 초안을 확인할 수 있습니다.'}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <Link
                            className="btn-secondary focus-ring"
                            href={`/workspace/asset/${latestDeliverable?.id ?? lastGeneratedDeliverableId}`}
                          >
                            산출물 보기
                          </Link>
                        </div>
                      </article>
                    ) : null}
                  </div>

                  {isSessionLoading ? (
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      세션을 불러오는 중입니다...
                    </p>
                  ) : null}

                  <div className="grid gap-4">
                    {currentSession.canvas.sections.map((section) => (
                      <article className="doc-card p-5" key={section.name}>
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h3 className="text-base font-semibold text-[var(--color-text)]">
                            {section.name}
                          </h3>
                          <span
                            className={`badge ${section.status === 'complete' ? 'badge-success' : 'badge-neutral'}`}
                          >
                            {section.status === 'complete' ? '채워짐' : '대기'}
                          </span>
                        </div>
                        <p className="mb-3 text-xs leading-5 text-[var(--color-text-tertiary)]">
                          {section.description}
                        </p>
                        <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--color-text-secondary)]">
                          {section.content.length > 0
                            ? section.content
                            : '아직 정리된 내용이 없습니다.'}
                        </p>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : null}

          {isToolsTabActive ? (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="meta">Checklist</p>
                    <h2 className="mt-2 text-xl font-semibold text-[var(--color-text)]">
                      산파술 진행 상태
                    </h2>
                  </div>
                  <span className="badge badge-accent">
                    {completedChecklistCount} / {currentSession.template.checklist.length}
                  </span>
                </div>

                <div className="grid gap-3">
                  {currentSession.template.checklist.map((item) => {
                    const isChecked = currentSession.checklist[item.id] === true;
                    const isHelpExpanded = expandedHelpItemId === item.id;

                    return (
                      <div
                        className="rounded-[var(--radius-md)] border border-[var(--color-border-subtle)]"
                        key={item.id}
                      >
                        <div className="flex items-start justify-between gap-3 px-4 py-3">
                          <span
                            className={`badge mt-0.5 ${isChecked ? 'badge-success' : 'badge-neutral'}`}
                          >
                            {isChecked ? '완료' : '대기'}
                          </span>
                          <div className="flex flex-1 flex-col gap-1">
                            <p className="text-sm font-semibold text-[var(--color-text)]">
                              {item.label}
                            </p>
                            <p className="text-xs leading-5 text-[var(--color-text-secondary)]">
                              {item.intent}
                            </p>
                          </div>
                          <div className="mt-0.5 flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {renderChecklistWeightDots(item.weight, isChecked)}
                            </div>
                            <button
                              className="text-xs text-[var(--color-text-tertiary)] transition hover:text-[var(--color-accent)]"
                              data-item-id={item.id}
                              onClick={handleChecklistHelpToggle}
                              type="button"
                            >
                              {isHelpExpanded ? '접기' : '도움말'}
                            </button>
                          </div>
                        </div>

                        {isHelpExpanded ? (
                          <div className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-sunken)] px-4 py-3">
                            <p className="mb-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                              {item.helpText}
                            </p>
                            <button
                              className="text-xs font-semibold text-[var(--color-accent)] hover:underline"
                              data-item-label={item.label}
                              onClick={handleChecklistAskClick}
                              type="button"
                            >
                              이 항목에 대해 HARP에게 물어보기
                            </button>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="meta">Methodology</p>
                    <h2 className="mt-2 text-xl font-semibold text-[var(--color-text)]">
                      추천 프레임워크
                    </h2>
                  </div>
                  <span className="badge badge-teal">
                    {currentSession.canvas.methodologySuggestions.length}개
                  </span>
                </div>

                <div className="grid gap-3">
                  {currentSession.canvas.methodologySuggestions.map((methodology) => (
                    <button
                      className="border-[var(--color-teal)]/20 hover:border-[var(--color-teal)]/40 rounded-[var(--radius-md)] border bg-[var(--color-teal-light)] px-4 py-4 text-left transition"
                      data-methodology-name={methodology.name}
                      key={methodology.id}
                      onClick={handleMethodologySuggestionClick}
                      type="button"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-[var(--color-text)]">
                          {methodology.name}
                        </span>
                        <span className="badge badge-teal">{methodology.category}</span>
                      </div>
                      <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                        {methodology.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {isReferencesTabActive ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="meta">References</p>
                  <h2 className="mt-2 text-xl font-semibold text-[var(--color-text)]">
                    이전 참고 산출물
                  </h2>
                </div>
                <span className="badge badge-neutral">{recentReferences.length}개</span>
              </div>

              {recentReferences.length === 0 ? (
                <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                  같은 유형의 이전 산출물이 아직 없습니다. 현재 세션이 첫 기준 문서가 됩니다.
                </p>
              ) : (
                <div className="grid gap-3">
                  {recentReferences.map((reference) => (
                    <Link
                      className="surface-interactive flex flex-col gap-2 p-4"
                      href={`/workspace/asset/${reference.id}`}
                      key={reference.id}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="badge badge-accent">{reference.status}</span>
                        <span className="badge badge-neutral">v{reference.version}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-[var(--color-text)]">
                        {reference.title}
                      </h3>
                      <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                        {reference.preview}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export { SessionCanvas };
export type { SessionCanvasProps };
