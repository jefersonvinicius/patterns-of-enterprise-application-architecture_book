package domain.entities

class Department(id: Long) : DomainObject(id) {
  private lateinit var _name: String;
  
  var name: String
    get() {
      load()
      return _name
    }
    set(value) {
      load()
      _name = value
    }

  fun withName(value: String): Department {
    _name = value
    return this
  }
}