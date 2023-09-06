
import database.Database
import datasource.DepartmentMapper
import datasource.EmployeeMapper
import datasource.MapperRegistry
import domain.entities.Department
import domain.entities.Employee
import org.junit.jupiter.api.BeforeAll
import org.mockito.Mockito.spy
import org.mockito.Mockito.verify
import org.mockito.Mockito.never
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.times
import kotlin.test.Test
import kotlin.test.assertEquals



class GhostTest {

  
  @Test
  fun testCallingDatabaseOnce() {
    val employeeMapper = spy(EmployeeMapper())
    val departmentMapper = spy(DepartmentMapper())
    MapperRegistry.add(Employee::class, employeeMapper)
    MapperRegistry.add(Department::class, departmentMapper)
    val employee = employeeMapper.find(1)
    
    assertEquals(employee.id, 1)
    verify(employeeMapper, never()).doLoadLine(any(), any())
    verify(departmentMapper, never()).doLoadLine(any(), any())
    
    assertEquals(employee.name, "Jeferson")
    verify(employeeMapper, times(1)).doLoadLine(eq(employee), any())
    verify(departmentMapper, never()).doLoadLine(any(), any())
    
    assertEquals(employee.name, "Jeferson")
    assertEquals(employee.department.name, "TI")
    verify(employeeMapper, times(1)).doLoadLine(eq(employee), any())
    verify(departmentMapper, times(1)).doLoadLine(eq(employee.department), any())
  }

  companion object {
    
    @JvmStatic
    @BeforeAll
    fun setup(): Unit {
      Database.start()
    }
  }

}