cd stanford
docker stop corenlp
docker rm corenlp
docker build -t nlp .
docker run -dit -p 9000:9000 --restart always --name corenlp nlp