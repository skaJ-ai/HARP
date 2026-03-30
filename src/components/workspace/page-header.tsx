import type { ReactNode } from 'react';

interface WorkspacePageHeaderProps {
  actions?: ReactNode;
  description?: string;
  eyebrow?: string;
  meta?: ReactNode;
  title: string;
  variant?: 'compact' | 'default';
}

function WorkspacePageHeader({
  actions,
  description,
  eyebrow,
  meta,
  title,
  variant = 'default',
}: WorkspacePageHeaderProps) {
  const isCompact = variant === 'compact';

  return (
    <section
      className={`surface overflow-hidden ${
        isCompact
          ? 'px-5 py-5 shadow-[var(--shadow-1)] lg:px-6'
          : 'px-6 py-6 shadow-[var(--shadow-2)] lg:px-8'
      }`}
    >
      <div
        className={`flex flex-col ${
          isCompact
            ? 'gap-4 lg:flex-row lg:items-center lg:justify-between'
            : 'gap-6 lg:flex-row lg:items-end lg:justify-between'
        }`}
      >
        <div className={`flex max-w-4xl flex-col ${isCompact ? 'gap-3' : 'gap-4'}`}>
          {eyebrow ? (
            <span className={isCompact ? 'section-label' : 'badge badge-neutral w-fit'}>
              {eyebrow}
            </span>
          ) : null}
          <div className="flex flex-col gap-2">
            <h1
              className={`font-bold tracking-tight text-[var(--color-text)] ${
                isCompact ? 'text-2xl lg:text-[2rem]' : 'text-3xl lg:text-4xl'
              }`}
            >
              {title}
            </h1>
            {description ? (
              <p
                className={`text-[var(--color-text-secondary)] ${
                  isCompact ? 'max-w-3xl text-sm leading-6' : 'text-sm leading-7 lg:text-base'
                }`}
              >
                {description}
              </p>
            ) : null}
          </div>
          {meta ? <div className="flex flex-wrap gap-2">{meta}</div> : null}
        </div>
        {actions ? (
          <div className={`flex flex-wrap items-center ${isCompact ? 'gap-2.5' : 'gap-3'}`}>
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export { WorkspacePageHeader };
export type { WorkspacePageHeaderProps };
