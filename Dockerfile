FROM python:3.12-slim AS assets
WORKDIR /src
COPY scripts/build-site.py scripts/build-site.py
COPY website website
RUN python scripts/build-site.py --output /site > /tmp/build-manifest.json

FROM node:22-slim
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8080 STATIC_DIR=/app/public
WORKDIR /app
COPY --from=assets /site/dist public
COPY --chown=node:node server server
COPY --chown=node:node package.json package.json
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server/index.mjs"]
