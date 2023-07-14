package entities;

import java.util.List;

public class Supplier {
  private List products;
  private Long id;
  private String name;
  
  Supplier(Long id, String name) {
    this.id = id;
    this.name = name;
  }
  
  
}
