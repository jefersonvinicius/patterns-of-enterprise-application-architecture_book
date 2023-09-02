import database.Database
import datasource.DepartmentMapper
import datasource.EmployeeMapper
import datasource.MapperRegistry
import domain.entities.Department
import domain.entities.Employee

fun main(args: Array<String>) {
  Database.start()
  val employeeMapper = EmployeeMapper()
  val departmentMapper = DepartmentMapper()
  MapperRegistry.add(Employee::class, employeeMapper)
  MapperRegistry.add(Department::class, departmentMapper)
  val employee = employeeMapper.find(1)
  println(employee.id)
  println(employee.name)
  println(employee.departmentId)
  println(employee.department.name)
  val employee2 = employeeMapper.find(2)
  println(employee2.department.name)
}