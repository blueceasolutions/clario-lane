alter table "public"."passages" alter column "passage" set default '{}'::jsonb;

alter table "public"."passages" alter column "passage" set not null;

alter table "public"."passages" alter column "passage" set data type jsonb using "passage"::jsonb;


