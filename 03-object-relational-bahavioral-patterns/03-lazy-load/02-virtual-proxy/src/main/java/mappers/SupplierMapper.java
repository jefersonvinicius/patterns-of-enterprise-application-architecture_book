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
    private Long supplierId;
    
    ProductLoader(Long supplierId) {
      this.supplierId = supplierId;
    }
    
    public List<Product> load() {
      return ProductMapper.create().findForSupplier(supplierId);
    }
  }
  
  public static SupplierMapper create() {
    return new SupplierMapper();
  }

  public Supplier findById(Long supplierId) {
    String sql = "SELECT * FROM suppliers WHERE id = ?;";
    try {
      PreparedStatement stmt = Database.getCurrentConnection().prepareStatement(sql);
      stmt.setLong(1, supplierId);
      ResultSet resultSet = stmt.executeQuery();
      if (!resultSet.isBeforeFirst()) return null;
      resultSet.next();
      Supplier supplier = doLoad(resultSet);
      return supplier;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  protected Supplier doLoad(ResultSet rs) throws SQLException {
    Long id = rs.getLong("id");
    String name = rs.getString("name");
    Supplier supplier = new Supplier(id, name);
    supplier.setProducts(new VirtualList<>(new ProductLoader(supplier.getId())));
    return supplier;
  }
}
