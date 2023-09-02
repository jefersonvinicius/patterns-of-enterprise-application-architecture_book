package domain

import datasource.MapperRegistry
import domain.entities.DomainObject

interface IDataSource {
  fun load(domainObject: DomainObject): Unit;
}

class DataSource: IDataSource {
  override fun load(domainObject: DomainObject) {
    domainObject.load()
  }
  
  companion object {
    private val instance = MapperRegistry.getInstance()
    
    fun load(domainObject: DomainObject) {
      instance.load(domainObject)
    }
  }
}