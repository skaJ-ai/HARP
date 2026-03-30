'use client';

import { type ChangeEvent, type MouseEvent, type ReactElement, useState } from 'react';

import { useRouter } from 'next/navigation';

import type { TemplateType } from '@/lib/db/schema';
import type {
  CreateSessionRequestBody,
  SessionSummary,
  SessionTemplateSummary,
} from '@/lib/sessions/types';
import { EXAMPLE_TEXT_MAX_LENGTH } from '@/lib/sessions/validators';
import type { TemplateBadgeColor } from '@/lib/templates';
import { safeFetch } from '@/lib/utils';

interface NewSessionFormProps {
  templates: SessionTemplateSummary[];
}

interface CreateSessionResponse {
  data: {
    session: SessionSummary;
  };
}

const BADGE_COLOR_CLASS_MAP: Record<TemplateBadgeColor, string> = {
  amber: 'badge-amber',
  blue: 'badge-blue',
  gray: 'badge-gray',
  green: 'badge-green',
};

function NewSessionForm({ templates }: NewSessionFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const [exampleText, setExampleText] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTemplateType, setSelectedTemplateType] = useState<TemplateType | null>(null);
  const selectedTemplate =
    templates.find((template) => template.type === selectedTemplateType) ?? null;

  async function handleSessionCreate(includeExample: boolean): Promise<void> {
    if (!selectedTemplateType) {
      return;
    }

    setIsCreating(true);
    setErrorMessage('');

    const requestBody: CreateSessionRequestBody = {
      templateType: selectedTemplateType,
    };

    if (includeExample && exampleText.trim().length > 0) {
      requestBody.exampleText = exampleText.trim();
    }

    const result = await safeFetch<CreateSessionResponse>('/api/sessions', {
      body: JSON.stringify(requestBody),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    });

    if (!result.success) {
      setIsCreating(false);
      setErrorMessage(result.error);
      return;
    }

    router.push(`/workspace/session/${result.data.data.session.id}`);
  }

  function handleExampleConfirm(): void {
    void handleSessionCreate(true);
  }

  function handleExampleSkip(): void {
    void handleSessionCreate(false);
  }

  function handleExampleTextChange(event: ChangeEvent<HTMLTextAreaElement>): void {
    setExampleText(event.target.value);
  }

  function handleTemplateDeselect(): void {
    setErrorMessage('');
    setExampleText('');
    setSelectedTemplateType(null);
  }

  function handleTemplateSelect(event: MouseEvent<HTMLButtonElement>): void {
    const templateType = event.currentTarget.dataset.templateType as TemplateType | undefined;

    if (!templateType) {
      return;
    }

    setErrorMessage('');
    setExampleText('');
    setSelectedTemplateType(templateType);
  }

  function renderTemplateCard(template: SessionTemplateSummary): ReactElement {
    const isSelected = selectedTemplateType === template.type;
    const isDisabled = selectedTemplateType !== null && !isSelected;

    return (
      <button
        className={`surface-interactive flex h-full flex-col items-start gap-4 p-6 text-left ${
          isSelected ? 'ring-2 ring-[var(--color-accent)]' : ''
        } ${isDisabled ? 'opacity-40' : ''}`}
        data-template-type={template.type}
        disabled={isCreating || isDisabled}
        key={template.type}
        onClick={handleTemplateSelect}
        type="button"
      >
        <div className="flex w-full items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">{template.name}</h2>
          <span className={`badge ${BADGE_COLOR_CLASS_MAP[template.badge.color]}`}>
            {template.badge.label}
          </span>
        </div>

        <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
          {template.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {template.exampleTags.map((tag) => (
            <span
              className="rounded-full bg-[var(--color-bg-sunken)] px-2.5 py-0.5 text-xs text-[var(--color-text-secondary)]"
              key={tag}
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="mt-auto flex w-full items-center justify-between gap-3 pt-2">
          <span className="text-sm font-medium text-[var(--color-accent)]">
            {isSelected ? '선택됨' : '이 유형으로 시작'}
          </span>
          <span className="badge badge-neutral">{`${template.estimatedMinutes}분`}</span>
        </div>
      </button>
    );
  }

  return (
    <section className="surface flex flex-col gap-6 p-8 shadow-[var(--shadow-2)]">
      <div className="flex flex-col gap-2">
        <span className="section-label">New Session</span>
        <h1 className="text-3xl font-bold text-[var(--color-text)]">어떤 작업을 하시나요?</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          유형을 고르면 HARP가 먼저 질문을 시작하고, 인터뷰 캔버스와 문서 초안이 함께 열립니다.
        </p>
      </div>

      {errorMessage.length > 0 ? (
        <div className="border-[var(--color-error)]/20 rounded-[var(--radius-md)] border bg-[var(--color-error-light)] px-4 py-3 text-sm text-[var(--color-error)]">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">{templates.map(renderTemplateCard)}</div>

      {selectedTemplate ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-semibold text-[var(--color-text)]">
                  참고할 예시 문서가 있나요?
                </span>
                <span className={`badge ${BADGE_COLOR_CLASS_MAP[selectedTemplate.badge.color]}`}>
                  {selectedTemplate.badge.label}
                </span>
              </div>
              <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                이전에 쓰셨던 비슷한 보고서를 붙여넣으시면 스타일을 맞춰드립니다. 없으면 건너뛰셔도
                됩니다.
              </p>
            </div>

            <button
              className="text-sm text-[var(--color-text-secondary)] underline underline-offset-4"
              disabled={isCreating}
              onClick={handleTemplateDeselect}
              type="button"
            >
              다른 유형 선택
            </button>
          </div>

          <textarea
            className="mb-4 min-h-[180px] w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:outline-none"
            disabled={isCreating}
            maxLength={EXAMPLE_TEXT_MAX_LENGTH}
            onChange={handleExampleTextChange}
            placeholder="예시 보고서 텍스트를 붙여넣어 주세요. 이전 보고서, 메일 초안, 정리해 둔 문단이어도 괜찮습니다."
            value={exampleText}
          />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-[var(--color-text-tertiary)]">
              {`${exampleText.length.toLocaleString()} / ${EXAMPLE_TEXT_MAX_LENGTH.toLocaleString()}자`}
            </span>

            <div className="flex flex-wrap items-center gap-3">
              <button
                className="btn-secondary focus-ring"
                disabled={isCreating}
                onClick={handleExampleSkip}
                type="button"
              >
                건너뛰고 시작
              </button>
              <button
                className="btn-teal focus-ring disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isCreating || exampleText.trim().length === 0}
                onClick={handleExampleConfirm}
                type="button"
              >
                {isCreating ? '생성 중...' : '이 예시로 시작'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export { NewSessionForm };
export type { NewSessionFormProps };
