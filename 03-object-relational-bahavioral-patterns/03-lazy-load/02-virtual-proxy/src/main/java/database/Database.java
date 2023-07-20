package database;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.*;

public class Database {
  static final Database instance = new Database();
  private Connection connection;
  
  public static Connection getCurrentConnection() {
    try {
      return Database.instance.getConnection();
    } catch (Exception e) {
      e.printStackTrace();
      return null;
    }
  }
  
  Connection getConnection() throws Exception {
    if (this.connection == null) throw new Exception("Database not started.");
    return this.connection;
  }

  void setConnection(Connection connection) {
    this.connection = connection;
  }
  
  public static void start() {
    instance.setConnection(connect());
    instance.migrate();
  }
  
  private static Connection connect() {
    try {
      File databaseFile = new File("database.db");
      databaseFile.delete();
      return DriverManager.getConnection("jdbc:sqlite:database.db");
    } catch (SQLException e) {
      System.out.println(e);
      return null;
    }
  }
  
  private void migrate() {
    try {
      Path path = Paths.get("schema.sql");
      String sql = new String(Files.readAllBytes(path));
      Statement stmt = this.connection.createStatement();
      stmt.executeUpdate(sql);
    } catch (SQLException | IOException e) {
      e.printStackTrace();
    }
  }
  
  static final String migrationSQL = "CREATE TABLE products (" 
                                   + "  id INTEGER PRIMARY KEY AUTOINCREMENT"
                                   + "  name VARCHAR(255),"
                                   + "  price DECIMAL,"
                                   + "  supplier_id INTEGER,"
                                   + "  FOREIGN KEY(supplier_id) REFERENCES suppliers(id));";
  
}
