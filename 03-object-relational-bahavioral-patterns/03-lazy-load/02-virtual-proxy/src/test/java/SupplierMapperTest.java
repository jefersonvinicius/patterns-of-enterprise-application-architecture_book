import database.Database;
import entities.Supplier;
import mappers.ProductMapper;
import mappers.SupplierMapper;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;

public class SupplierMapperTest {
  @BeforeAll
  static void setup() { Database.start(); }
  
  @Test
  void testFindById() {
    ProductMapper productMapperSpy = spy(ProductMapper.create());
    SupplierMapper supplierMapper = new SupplierMapper(productMapperSpy);
    Supplier supplier = supplierMapper.findById(1L);
    List products = supplier.getProducts();
    assertEquals(products.size(), 4);
    assertEquals(supplier.getName(), "Jeferson");
    assertEquals(products.size(), 4);
    verify(productMapperSpy).findForSupplier(1L);
  }
}
