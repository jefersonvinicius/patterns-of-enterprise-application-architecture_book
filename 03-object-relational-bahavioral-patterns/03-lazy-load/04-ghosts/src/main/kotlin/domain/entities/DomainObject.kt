package domain.entities

import domain.DataSource

enum class LoadStatus {
  Ghost, Loading, Loaded
}

abstract class DomainObject(val id: Long) {
  private var status = LoadStatus.Ghost;
  
  val isGhost get() = status == LoadStatus.Ghost
  val isLoaded get() = status == LoadStatus.Loaded
  
  fun markLoading() {
    status = LoadStatus.Loading
  }
  
  fun markLoaded() {
    status = LoadStatus.Loaded
  }
  
  internal fun load() {
    if (isGhost) DataSource.load(this)
  }
}