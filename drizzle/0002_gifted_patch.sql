ALTER TABLE "sessions" ADD COLUMN "example_text" text;

UPDATE "sessions"
SET "template_type" = 'planning'
WHERE "template_type" = 'policy_review';

UPDATE "sessions"
SET "template_type" = 'result'
WHERE "template_type" = 'training_summary';

UPDATE "sessions"
SET "template_type" = 'status'
WHERE "template_type" = 'weekly_report';

UPDATE "deliverables"
SET "template_type" = 'planning'
WHERE "template_type" = 'policy_review';

UPDATE "deliverables"
SET "template_type" = 'result'
WHERE "template_type" = 'training_summary';

UPDATE "deliverables"
SET "template_type" = 'status'
WHERE "template_type" = 'weekly_report';

UPDATE "memory_chunks"
SET "template_type" = 'planning'
WHERE "template_type" = 'policy_review';

UPDATE "memory_chunks"
SET "template_type" = 'result'
WHERE "template_type" = 'training_summary';

UPDATE "memory_chunks"
SET "template_type" = 'status'
WHERE "template_type" = 'weekly_report';
