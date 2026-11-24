
# Build stage
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY . .

RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

RUN set -eux; \
    JAR="$(find target -maxdepth 1 -type f -name '*.jar' ! -name '*.jar.original' | head -n 1)"; \
    test -n "$JAR"; \
    cp "$JAR" app.jar

# Run stage
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/app.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
