package entities;

import java.util.List;

public class Supplier {
  private List products;
  private Long id;
  private String name;
  
  public Supplier(Long id, String name) {
    this.id = id;
    this.name = name;
  }
  
  public void setProducts(List products) {
    this.products = products;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public List getProducts() {
    return products;
  }
}
