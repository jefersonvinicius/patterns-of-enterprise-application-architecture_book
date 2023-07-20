import entities.Supplier;
import mappers.SupplierMapper;
import org.junit.jupiter.api.Test;

public class SupplierMapperTest {
  @Test
  void testFindById() {
    Supplier supplier = SupplierMapper.create().findById(1L);

  }
}
