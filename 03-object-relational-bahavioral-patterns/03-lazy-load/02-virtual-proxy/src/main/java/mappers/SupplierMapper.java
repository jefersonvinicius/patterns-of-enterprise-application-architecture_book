package mappers;

import listloaders.VirtualListLoader;

import java.util.List;

public class SupplierMapper {
  public static class ProductLoader implements VirtualListLoader {
    private Long supplierId;
    
    ProductLoader(Long supplierId) {
      this.supplierId = supplierId;
    }
    
    public List load() {
      return ProductMapper.create().findForSupplier(supplierId);
    }
  }
}
