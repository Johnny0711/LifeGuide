# Stage 1: Build the application
FROM gradle:jdk21 AS build
WORKDIR /app
COPY build.gradle settings.gradle ./
COPY src ./src
# Build the application without running tests
RUN gradle build -x test

# Stage 2: Create the runtime image
FROM eclipse-temurin:21-jre
WORKDIR /app

# Expose port 8080 
EXPOSE 8080

# Copy the generated JAR file from the build stage
COPY --from=build /app/build/libs/app.jar app.jar

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
