package domain.entities

class Employee(id: Long) : DomainObject(id) {
  private lateinit var _name: String;
  private var _departmentId: Long? = null
  private lateinit var _department: Department
  
  var name: String
    get() { 
      load()
      return _name 
    }
    set(value) { 
      load()
      _name = value
    }
  
  var departmentId: Long
    get() {
      load()
      return _departmentId!!
    }
    set(value) {
      load()
      _departmentId = value
    }
  
  var department: Department
    get() {
      load()
      return _department
    }
    set(value) {
      load()
      _department = value
    }
  
  fun withName(value: String): Employee {
    _name = value
    return this
  }
}