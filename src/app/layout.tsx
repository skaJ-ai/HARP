import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

const metadata: Metadata = {
  title: 'Harness Engineering Template',
  description: 'AI 멱등성 보장을 위한 하네스 엔지니어링 프레임워크',
};

export { metadata };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
