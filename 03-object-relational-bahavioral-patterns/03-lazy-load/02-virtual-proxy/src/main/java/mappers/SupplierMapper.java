package mappers;

import database.Database;
import entities.Product;
import entities.Supplier;
import listloaders.VirtualList;
import listloaders.VirtualListLoader;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

public class SupplierMapper {
  public static class ProductLoader implements VirtualListLoader<Product> {
    private final Long supplierId;
    private final ProductMapper productMapper;
    
    ProductLoader(ProductMapper productMapper, Long supplierId) {
      this.supplierId = supplierId;
      this.productMapper = productMapper;
    }
    
    public List<Product> load() {
      return this.productMapper.findForSupplier(supplierId);
    }
  }
  
  private final ProductMapper productMapper; 
  
  public SupplierMapper(ProductMapper productMapper) {
    this.productMapper = productMapper;
  }

  public Supplier findById(Long supplierId) {
    String sql = "SELECT * FROM suppliers WHERE id = ?;";
    try {
      PreparedStatement stmt = Database.getCurrentConnection().prepareStatement(sql);
      stmt.setLong(1, supplierId);
      ResultSet resultSet = stmt.executeQuery();
      if (!resultSet.isBeforeFirst()) return null;
      resultSet.next();
      return doLoad(resultSet);
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  protected Supplier doLoad(ResultSet rs) throws SQLException {
    Long id = rs.getLong("id");
    String name = rs.getString("name");
    Supplier supplier = new Supplier(id, name);
    ProductLoader loader = new ProductLoader(this.productMapper, supplier.getId());
    supplier.setProducts(new VirtualList<>(loader));
    return supplier;
  }
}
