plugins {
    kotlin("jvm") version "1.9.0"
    application
}

group = "org.example"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(kotlin("test"));
    testImplementation("org.mockito:mockito-core:1.+")
    testImplementation("org.mockito.kotlin:mockito-kotlin:3.2.0")
    implementation("org.xerial:sqlite-jdbc:3.42.0.0")
}

tasks.test {
    useJUnitPlatform()
}

kotlin {
    jvmToolchain(8)
}

application {
    mainClass.set("MainKt")
}