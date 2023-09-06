package datasource

import domain.entities.Department
import domain.entities.DomainObject
import domain.entities.Employee
import java.sql.ResultSet

open class EmployeeMapper: Mapper<Employee>() {
  override val findStatement: String
    get() = "SELECT * FROM employees WHERE id = ?"

  fun find(id: Long): Employee {
    return abstractFind(id) as Employee
  }
  
  override fun createGhost(id: Long): Employee {
    return Employee(id)
  }

  override fun doLoadLine(domainObject: DomainObject, resultSet: ResultSet) {
    val employee = domainObject as Employee
    employee.name = resultSet.getString("name")
    employee.departmentId = resultSet.getLong("department_id")
    val departmentMapper = MapperRegistry.mapper(Department::class) as DepartmentMapper
    val department = departmentMapper.find(employee.departmentId)
    employee.department = department
  }
}