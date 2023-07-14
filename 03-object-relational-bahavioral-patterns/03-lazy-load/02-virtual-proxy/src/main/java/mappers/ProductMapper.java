package mappers;

import database.Database;
import entities.Product;

import java.sql.Connection;
import java.util.List;

public class ProductMapper {
  static ProductMapper create() {
    return new ProductMapper();
  }

  List<Product> findForSupplier() {
    Connection connection = Database.getConnection();
    
  }
}
