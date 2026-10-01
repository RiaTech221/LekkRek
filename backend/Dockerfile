# Utiliser l'image officielle Maven pour builder le projet
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
# Télécharger les dépendances (cache docker)
RUN mvn dependency:go-offline -B
COPY src ./src
# Compiler le projet sans lancer les tests pour accélérer le build Docker
RUN mvn clean package -DskipTests

# Étape finale avec l'image JRE légère
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
