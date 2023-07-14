package database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class Database {
  static final Database instance = new Database();
  private Connection connection;
  
  public static Connection getConnection() {
    return Database.instance.getInstance();
  }
  
  Connection getInstance() {
    if (this.connection == null) this.connection = this.connect();
    return this.connection;
  }
  
  private Connection connect() {
    try {
      return DriverManager.getConnection("jdbc:sqlite:database.db");
    } catch (SQLException e) {
      System.out.println(e);
      return null;
    }
  }
}
