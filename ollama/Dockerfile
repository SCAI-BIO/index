FROM ollama/ollama:latest

RUN apt-get update && apt-get install -y curl

COPY ollama_start.sh /ollama_start.sh
RUN chmod +x /ollama_start.sh

EXPOSE 11434

# Override default entrypoint
ENTRYPOINT ["/bin/bash", "-c"]

CMD ["/ollama_start.sh"]
