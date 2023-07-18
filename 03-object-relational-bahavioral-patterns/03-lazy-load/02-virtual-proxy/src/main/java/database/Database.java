package database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class Database {
  static final Database instance = new Database();
  private Connection connection;
  
  public static Connection getConnection() {
    try {
      return Database.instance.getInstance();
    } catch (Exception e) {
      System.out.println(e);
      return null;
    }
  }
  
  Connection getInstance() throws Exception {
    if (this.connection == null) throw new Exception("Database not started.");
    return this.connection;
  }
  
  void start() {
    this.connection = this.connect();
    this.migrate();
  }
  
  private Connection connect() {
    try {
      return DriverManager.getConnection("jdbc:sqlite:database.db");
    } catch (SQLException e) {
      System.out.println(e);
      return null;
    }
  }
  
  private void migrate() {
    try {
      PreparedStatement stmt = this.connection.prepareStatement(migrationSQL);
      stmt.executeUpdate();  
    } catch (SQLException e) {
      System.out.println(e);
    }
  }
  
  static final String migrationSQL = "CREATE TABLE products (" 
                                   + "  name";
}
