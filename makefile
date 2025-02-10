migrate:
	npx prisma migrate dev --name $(name)
	npx prisma generate

migrate-reset:
	npx prisma migrate reset --force
	npx prisma generate

migrate-deploy:
	npx prisma migrate deploy

studio:
	npx prisma studio