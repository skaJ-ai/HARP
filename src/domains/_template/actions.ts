/**
 * Domain actions (mutations)
 * 데이터를 변경하는 작업을 정의
 */

'use server';

import type { Result } from '@/lib/utils';

import type { TemplateEntity } from './types';

async function createTemplateEntity(
  _data: Omit<TemplateEntity, 'createdAt' | 'id' | 'updatedAt'>,
): Promise<Result<TemplateEntity>> {
  // TODO: Implement actual creation logic
  return { success: false, error: 'Not implemented' };
}

async function updateTemplateEntity(
  _id: string,
  _data: Partial<Pick<TemplateEntity, 'name'>>,
): Promise<Result<TemplateEntity>> {
  // TODO: Implement actual update logic
  return { success: false, error: 'Not implemented' };
}

async function deleteTemplateEntity(_id: string): Promise<Result<{ deleted: boolean }>> {
  // TODO: Implement actual deletion logic
  return { success: false, error: 'Not implemented' };
}

export { createTemplateEntity, deleteTemplateEntity, updateTemplateEntity };
