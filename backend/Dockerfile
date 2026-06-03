FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app
COPY backend/pom.xml .
COPY backend/src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/target/crop-disease-prediction-1.0.0.jar app.jar
COPY model.h5 /app/model.h5
COPY backend/scripts /app/scripts

RUN apt-get update && apt-get install -y python3 python3-pip && \
    pip3 install tensorflow numpy pillow && \
    rm -rf /var/lib/apt/lists/*

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
