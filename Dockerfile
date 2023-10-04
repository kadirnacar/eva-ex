# Run the container with `docker run -p 3000:3000 -t server`.
FROM docker.io/node:16.3.0-alpine

WORKDIR /app

RUN addgroup --system server && \
          adduser --system -G server server

COPY dist/apps/server server
RUN chown -R server:server .

# You can remove this install step if you build with `--bundle` option.
# The bundled output will include external dependencies.
RUN npm --prefix server --omit=dev -f install

CMD [ "node", "server" ]
