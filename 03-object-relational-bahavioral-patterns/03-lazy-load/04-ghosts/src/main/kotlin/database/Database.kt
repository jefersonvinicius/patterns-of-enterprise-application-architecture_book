package database

import java.io.File
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Paths
import java.sql.Connection
import java.sql.DriverManager
import java.sql.SQLException

class Database {
  private var _connection: Connection? = null
  
  var connection: Connection
    get() {
      return _connection ?: throw Exception("Database not started.")
    }
    set(value) {
      _connection = value
    }

  private fun migrate() {
    try {
      val path = Paths.get("schema.sql")
      val sql = String(Files.readAllBytes(path))
      val stmt = connection.createStatement()
      stmt.executeUpdate(sql)
    } catch (e: SQLException) {
      e.printStackTrace()
    } catch (e: IOException) {
      e.printStackTrace()
    }
  }

  companion object {
    val instance = Database()
    val currentConnection: Connection
      get() = instance.connection
    
    fun start() {
      instance.connection = connect()!!
      instance.migrate()
    }

    private fun connect(): Connection? {
      return try {
        Class.forName("org.sqlite.JDBC")
        val databaseFile = File("database.db")
        databaseFile.delete()
        return DriverManager.getConnection("jdbc:sqlite:database.db")
      } catch (e: SQLException) {
        println(e)
        null
      }
    }
  }
}
