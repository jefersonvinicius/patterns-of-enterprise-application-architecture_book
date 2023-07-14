import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class App {
  public static void main(String args[]) {
    //try {
      //Connection connection = DriverManager.getConnection("jdbc:sqlite:database.db");
      //Statement stmt = connection.createStatement();
      //System.out.println("Connected");
    //} catch (SQLException e) {
      //System.out.println(e.getMessage());
    //}
    Calculator calculator = new Calculator();
    System.out.println(calculator.sum(1, 3));
  }
}
