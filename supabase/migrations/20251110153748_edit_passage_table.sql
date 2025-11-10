alter table "public"."passages" drop constraint "passages_content_type_id_fkey";

alter table "public"."passages" drop column "content_type_id";

alter table "public"."passages" drop column "difficulty";

alter table "public"."passages" drop column "questions";

alter table "public"."passages" drop column "title";

alter table "public"."passages" alter column "passage" set default '{}'::text;

alter table "public"."passages" alter column "passage" drop not null;


