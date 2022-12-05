setup:
	make prepare-env
	npm ci
start:
	heroku local -f Procfile.dev
start-backend:
	npm start -- --watch --verbose-watch --ignore-watch='node_modules .git'
start-frontend:
	npx webpack --watch --progress
lint:
	npm run lint
create-db-migration:
	npx knex --esm migrate:make $(name)
db-migrate:
	npx knex --esm migrate:latest
prepare-env:
	cp -n .env.example .env || true
test-coverage:
	npm test -- --coverage
test:
	npm test
build:
	npm run build