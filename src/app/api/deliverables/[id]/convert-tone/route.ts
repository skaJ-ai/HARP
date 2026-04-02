import { NextResponse } from 'next/server';

import { requireAuthenticatedApiUser } from '@/lib/auth/middleware';
import { convertDeliverableTone } from '@/lib/deliverables/service';
import { convertToneRequestSchema } from '@/lib/deliverables/validators';

export const maxDuration = 120;

async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuthenticatedApiUser();
    const requestBody = await request.json();
    const parsedRequest = convertToneRequestSchema.safeParse(requestBody);
    const { id } = await params;

    if (!parsedRequest.success) {
      return NextResponse.json(
        {
          message: parsedRequest.error.issues[0]?.message ?? '톤 변환 요청이 올바르지 않습니다.',
          status: 400,
        },
        {
          status: 400,
        },
      );
    }

    const deliverable = await convertDeliverableTone({
      deliverableId: id,
      tone: parsedRequest.data.tone,
      workspaceId: currentUser.workspaceId,
    });

    return NextResponse.json({
      data: {
        deliverable,
      },
      message: '톤 변환이 완료되었습니다.',
      status: 201,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown tone conversion error';
    const status =
      message === 'Authentication required.'
        ? 401
        : message === '산출물을 찾을 수 없습니다.'
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
