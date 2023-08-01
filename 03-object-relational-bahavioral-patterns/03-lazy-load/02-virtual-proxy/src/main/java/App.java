import database.Database;
import mappers.ProductMapper;
import mappers.SupplierMapper;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class App {
  public static void main(String[] args) {
    Database.start();
    var supplierMapper = new SupplierMapper(ProductMapper.create());
    var supplier = supplierMapper.findById(1L);
    System.out.println("Hello " + supplier.getName());
  }
}
