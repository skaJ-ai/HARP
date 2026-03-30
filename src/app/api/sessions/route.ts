import { NextResponse } from 'next/server';

import { requireAuthenticatedApiUser } from '@/lib/auth/middleware';
import { createSessionForWorkspace, listSessionsByWorkspace } from '@/lib/sessions/service';
import { createSessionRequestSchema } from '@/lib/sessions/validators';

async function GET() {
  try {
    const currentUser = await requireAuthenticatedApiUser();
    const sessions = await listSessionsByWorkspace(currentUser.workspaceId);

    return NextResponse.json({
      data: {
        sessions,
      },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown session error';
    const status = message === 'Authentication required.' ? 401 : 500;

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

async function POST(request: Request) {
  try {
    const currentUser = await requireAuthenticatedApiUser();
    const requestBody = await request.json();
    const parsedRequest = createSessionRequestSchema.safeParse(requestBody);

    if (!parsedRequest.success) {
      const validationMessage =
        parsedRequest.error.issues[0]?.message ?? '세션 생성 요청이 올바르지 않습니다.';

      return NextResponse.json(
        {
          message: validationMessage,
          status: 400,
        },
        {
          status: 400,
        },
      );
    }

    const session = await createSessionForWorkspace(
      currentUser.workspaceId,
      parsedRequest.data.templateType,
      parsedRequest.data.exampleText,
    );

    return NextResponse.json(
      {
        data: {
          session,
        },
        message: '새 작업이 생성되었습니다.',
        status: 201,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown session creation error';
    const status = message === 'Authentication required.' ? 401 : 500;

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

export { GET, POST };
