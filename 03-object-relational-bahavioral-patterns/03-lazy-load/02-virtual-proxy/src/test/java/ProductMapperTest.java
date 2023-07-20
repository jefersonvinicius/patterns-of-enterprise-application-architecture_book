import database.Database;
import entities.Product;
import mappers.ProductMapper;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.util.Arrays;
import java.util.List;

public class ProductMapperTest {
  
  @BeforeAll
  static void setup() {
    Database.start();
  }
  
  @Test
  void findForSupplierTest() {
    List<Product> products = ProductMapper.create().findForSupplier(1L);
    List<Product> expected = Arrays.asList(
      new Product(1L, "Xbox One", 2000),
      new Product(2L, "Book", 50),
      new Product(3L, "Laptop", 5000),
      new Product(4L, "MacBook", 10000)
    );
    
    assertEquals(expected.size(), products.size());
    for (int i = 0; i < expected.size(); i++) {
      assertEquals(expected.get(i), products.get(i));
    }
  }
}
