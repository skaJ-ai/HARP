import { NextResponse } from 'next/server';

import mammoth from 'mammoth';

import { requireAuthenticatedApiUser } from '@/lib/auth/middleware';
import { createSourceForSession } from '@/lib/sessions/service';

const mammothWithMarkdown = mammoth as unknown as typeof mammoth & {
  convertToMarkdown: (input: { buffer: Buffer }) => Promise<{ value: string }>;
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.txt', '.md', '.docx'];

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');

  if (lastDot === -1) {
    return '';
  }

  return filename.slice(lastDot).toLowerCase();
}

async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuthenticatedApiUser();
    const { id } = await params;

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          message: '파일이 포함되지 않았습니다.',
          status: 400,
        },
        {
          status: 400,
        },
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          message: '파일 크기는 5MB 이하만 허용됩니다.',
          status: 400,
        },
        {
          status: 400,
        },
      );
    }

    const extension = getFileExtension(file.name);

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        {
          message: '지원하지 않는 파일 형식입니다. .txt, .md, .docx만 업로드할 수 있습니다.',
          status: 400,
        },
        {
          status: 400,
        },
      );
    }

    let content: string;

    if (extension === '.docx') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammothWithMarkdown.convertToMarkdown({
        buffer: Buffer.from(arrayBuffer),
      });
      content = result.value;
    } else {
      content = await file.text();
    }

    if (content.trim().length === 0) {
      return NextResponse.json(
        {
          message: '파일 내용이 비어 있습니다.',
          status: 400,
        },
        {
          status: 400,
        },
      );
    }

    const label = file.name.replace(/\.[^.]+$/, '');

    await createSourceForSession({
      content: content.trim(),
      label,
      sessionId: id,
      type: 'text',
      workspaceId: currentUser.workspaceId,
    });

    return NextResponse.json(
      {
        message: '파일이 업로드되어 근거자료로 저장되었습니다.',
        status: 201,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown upload error';
    const status =
      message === 'Authentication required.'
        ? 401
        : message === '세션을 찾을 수 없습니다.'
          ? 404
          : 500;

    return NextResponse.json(
      {
        message,
        status,
      },
      {
        status,
      },
    );
  }
}

export { POST };
