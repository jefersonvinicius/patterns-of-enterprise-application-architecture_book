import entities.Product;
import mappers.ProductMapper;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.util.Arrays;
import java.util.List;

public class ProductMapperTest {
  @Test
  void findForSupplierTest() {
    List<Product> products = ProductMapper.create().findForSupplier(1L);
    List<Product> expected = Arrays.asList(
      new Product(1L, "Xbox", 2000.90),
      new Product(2L, "Xiomi Pro 12", 2350.20),
      new Product(3L, "Monitor", 999.99)
    );
    assertArrayEquals(expected, products);
  }

  private void assertArrayEquals(List<Product> expected, List<Product> products) {
    for (int i = 0; i < expected.size(); i++) {
      assertEquals(expected.get(i), products.get(i));
    }
  }
}
