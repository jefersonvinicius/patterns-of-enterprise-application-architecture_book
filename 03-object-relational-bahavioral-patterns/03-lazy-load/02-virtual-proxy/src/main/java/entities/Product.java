package entities;


public class Product {
  private Long id;
  private String name;
  private double price;
  
  public Product(Long id, String name, double price) {
    this.id = id;
    this.name = name;
    this.price = price;
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

  public double getPrice() {
    return price;
  }

  public void setPrice(double price) {
    this.price = price;
  }
  
  @Override
  public boolean equals(Object obj) {
    if (obj == this) return true;
    if (obj == null || obj.getClass() != this.getClass()) return false;
    Product other = (Product) obj;
    return this.id.equals(other.getId()) && this.name.equals(other.getName()) && this.price == other.getPrice(); 
  }
}
