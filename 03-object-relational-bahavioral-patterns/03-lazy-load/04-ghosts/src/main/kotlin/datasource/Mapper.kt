package datasource

import database.Database
import domain.entities.DomainObject
import java.sql.ResultSet

abstract class Mapper<out E: DomainObject> {
  private val loadedMap = mutableMapOf<Long, DomainObject>()
  
  fun abstractFind(id: Long): DomainObject {
    var result = loadedMap[id]
    if (result == null) {
      result = createGhost(id)
      loadedMap[id] = result
    }
    return result
  }

  fun load(domainObject: DomainObject) {
    if (!domainObject.isGhost) return;
    val stmt = Database.currentConnection.prepareStatement(findStatement)
    stmt.setLong(1, domainObject.id)
    val result = stmt.executeQuery()
    loadLine(domainObject, result)
  }
  
  private fun loadLine(domainObject: DomainObject, resultSet: ResultSet) {
    if (domainObject.isGhost) {
      println("Loading ${domainObject::class.simpleName}")
      domainObject.markLoading()
      doLoadLine(domainObject, resultSet)
      domainObject.markLoaded()
    }
  }
  
  abstract val findStatement: String;
  abstract fun createGhost(id: Long): E;
  abstract fun doLoadLine(domainObject: DomainObject, resultSet: ResultSet)
}