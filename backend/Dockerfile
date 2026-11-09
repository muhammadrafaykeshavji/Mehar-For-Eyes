FROM golang:1.26-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /out/api ./cmd/api

FROM alpine:3.21
RUN adduser -D -u 10001 app && mkdir -p /data/uploads && chown app /data/uploads
COPY --from=build /out/api /usr/local/bin/api
USER app
EXPOSE 8080
CMD ["api"]

