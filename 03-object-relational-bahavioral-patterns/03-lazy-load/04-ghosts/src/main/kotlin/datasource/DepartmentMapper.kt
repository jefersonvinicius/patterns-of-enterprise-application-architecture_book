package datasource

import domain.entities.Department
import domain.entities.DomainObject
import domain.entities.Employee
import java.sql.ResultSet

class DepartmentMapper: Mapper<Department>() {
  override val findStatement: String
    get() = "SELECT * FROM departments WHERE id = ?"

  fun find(id: Long): Department {
    return abstractFind(id) as Department
  }
  
  override fun createGhost(id: Long): Department {
    return Department(id)
  }

  override fun doLoadLine(domainObject: DomainObject, resultSet: ResultSet) {
    val department = domainObject as Department
    department.name = resultSet.getString("name")
  }
}