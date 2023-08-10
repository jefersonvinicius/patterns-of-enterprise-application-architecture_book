package org.example;

public class ThreadLocalRegistry {
  private static final ThreadLocal<ThreadLocalRegistry> instances = new ThreadLocal<>();
  private PersonFinder personFinder = new PersonFinder();
  
  public static ThreadLocalRegistry getInstance(){
    return instances.get();
  }
  
  public static void begin() {
    instances.set(new ThreadLocalRegistry());
  }
  
  public static void end() {
    instances.remove();
  }
  
  public static PersonFinder personFinder() {
    return getInstance().personFinder;
  }
}
