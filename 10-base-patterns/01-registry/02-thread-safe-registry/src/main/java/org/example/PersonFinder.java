package org.example;

public class PersonFinder {
  Person findById(Long id) {
    return new Person(id, "Jeferson");
  }
}
