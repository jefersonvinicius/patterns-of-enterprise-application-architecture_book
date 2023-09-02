package datasource

import domain.IDataSource
import domain.entities.DomainObject
import kotlin.reflect.KClass

class MapperRegistry: IDataSource {
  val mappers = mutableMapOf<String, Mapper<DomainObject>>()
  
  companion object {
    private val instance = MapperRegistry()
    
    fun getInstance(): MapperRegistry {
      return instance
    }
    
    fun <E: DomainObject> add(domainObjectClass: KClass<E>, mapper: Mapper<E>) {
      println("ADDING ${domainObjectClass.simpleName.toString()}")
      instance.mappers[domainObjectClass.simpleName.toString()] = mapper
    }
    
    fun <E: DomainObject> mapperFor(domainObject: E): Mapper<DomainObject> {
      val className = domainObject::class.simpleName
      val mapper = instance.mappers[className]
      return mapper ?: throw Error("Not found mapper for $className");
    }
    
    fun <E: DomainObject> mapper(domainObjectClass: KClass<E>): Mapper<DomainObject> {
      val className = domainObjectClass.simpleName
      val mapper = instance.mappers[className]
      return mapper ?: throw Error("Not found mapper for $className");
    }
  }

  
  override fun load(domainObject: DomainObject) {
    mapperFor(domainObject).load(domainObject)
  }
}