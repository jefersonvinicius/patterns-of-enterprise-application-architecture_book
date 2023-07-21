package mappers;

import database.Database;
import entities.Product;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ProductMapper {
  
  private static ProductMapper instance;
  
  public static ProductMapper create() {
    if (instance == null) instance = new ProductMapper();
    return instance;
  }

  public List<Product> findForSupplier(Long supplierId) {
    try {
      Connection connection = Database.getCurrentConnection();
      String sql = "SELECT * FROM products WHERE supplier_id = ?";
      PreparedStatement stmt = connection.prepareStatement(sql);
      stmt.setLong(1, supplierId);
      ResultSet resultSet = stmt.executeQuery();
      ArrayList<Product> result = new ArrayList<>();
      while (resultSet.next()) {
        result.add(doLoad(resultSet));
      }
      return result;
    } catch (SQLException e) {
      System.out.println(e);
      return null;
    }
  }
  
  private Product doLoad(ResultSet resultSet) throws SQLException {
    Product product = new Product(
      resultSet.getLong("id"),
      resultSet.getString("name"),
      resultSet.getDouble("price")
    );
    return product;
  }
}
