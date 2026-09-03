up:        ; docker compose up -d --build
down:      ; docker compose down
logs:      ; docker compose logs -f web
migrate:   ; docker compose exec web npx prisma migrate dev
seed:      ; docker compose exec web npx prisma db seed
studio:    ; docker compose exec web npx prisma studio
test:      ; docker compose exec web npm test
stripe:    ; docker compose --profile tools up stripe-cli
reset:     ; docker compose down -v && docker compose up -d --build
