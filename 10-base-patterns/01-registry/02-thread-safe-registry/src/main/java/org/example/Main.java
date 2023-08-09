package org.example;

public class Main {
  public static void main(String[] args) {
    ThreadLocalRegistry.begin();
    Person person = ThreadLocalRegistry.personFinder().findById(1L);
    System.out.println(person);
    ThreadLocalRegistry.end();
  }
}