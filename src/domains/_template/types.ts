/**
 * Domain types template
 * 도메인의 핵심 엔티티와 값 객체를 정의
 */

/** Example entity - replace with actual domain entity */
interface TemplateEntity {
  createdAt: string;
  id: string;
  name: string;
  updatedAt: string;
}

/** Example value object */
interface TemplateFilter {
  keyword?: string;
  status?: 'active' | 'inactive';
}

export type { TemplateEntity, TemplateFilter };
