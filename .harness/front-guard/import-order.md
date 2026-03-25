# Import Order Specification

> Front Guard: 임포트 순서를 강제하여 어떤 AI든 동일한 파일 상단 구조를 생성하게 한다.

## 5-Group Order

```typescript
// ──────────────────────────────────────────
// Group 1: React / Next.js core
// ──────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react';
import type { ReactNode, MouseEvent } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// ──────────────────────────────────────────
// Group 2: Third-party libraries
// ──────────────────────────────────────────
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { z } from 'zod';

// ──────────────────────────────────────────
// Group 3: Internal imports (@/ alias)
//   순서: types → lib → components → domains
// ──────────────────────────────────────────
import type { User, ApiResponse } from '@/types';
import { formatDate, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/domains/auth/store';

// ──────────────────────────────────────────
// Group 4: Relative imports (../ → ./)
// ──────────────────────────────────────────
import { parentHelper } from '../utils';
import { localConfig } from './config';

// ──────────────────────────────────────────
// Group 5: Style imports
// ──────────────────────────────────────────
import './styles.css';
```

## Rules

1. 각 그룹 사이에 **빈 줄 1개**
2. 그룹 내에서 **알파벳 순** 정렬
3. `type` import는 같은 그룹 내에서 일반 import 뒤에 배치하거나, `import type` 구문 사용
4. Side-effect import (`import './styles.css'`)는 항상 마지막 그룹
5. 사용하지 않는 import는 존재해서는 안 된다

## ESLint Enforcement

```javascript
// eslint.config.mjs 내 관련 설정
{
  'import/order': ['error', {
    'groups': [
      'builtin',        // Node.js built-in
      'external',       // npm packages
      'internal',       // @/ alias
      'parent',         // ../
      'sibling',        // ./
      'index',          // ./index
      'type',           // type imports
    ],
    'pathGroups': [
      { pattern: 'react', group: 'builtin', position: 'before' },
      { pattern: 'react/**', group: 'builtin', position: 'before' },
      { pattern: 'next', group: 'builtin', position: 'before' },
      { pattern: 'next/**', group: 'builtin', position: 'before' },
      { pattern: '@/**', group: 'internal' },
    ],
    'pathGroupsExcludedImportTypes': ['react', 'next'],
    'newlines-between': 'always',
    'alphabetize': { order: 'asc', caseInsensitive: true },
  }],
}
```
