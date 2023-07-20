package listloaders;

import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;

public class VirtualList<E> implements List<E> {
  private List<E> source;
  private VirtualListLoader<E> loader;
  
  public VirtualList(VirtualListLoader<E> loader) {
    this.loader = loader;  
  }
  
  private List<E> getSource() {
    if (source == null) source = loader.load();
    return source;
  }


  @Override
  public int size() {
    return getSource().size();
  }

  @Override
  public boolean isEmpty() {
    return getSource().isEmpty();
  }

  @Override
  public boolean contains(Object o) {
    return getSource().contains(o);
  }

  @Override
  public Iterator<E> iterator() {
    return getSource().iterator();
  }

  @Override
  public Object[] toArray() {
    return getSource().toArray();
  }

  @Override
  public <E> E[] toArray(E[] ts) {
    return (E[]) getSource().toArray();
  }

  @Override
  public boolean add(E e) {
    return getSource().add(e);
  }

  @Override
  public boolean remove(Object o) {
    return getSource().remove(o);
  }

  @Override
  public boolean containsAll(Collection<?> collection) {
    return getSource().containsAll(collection);
  }

  @Override
  public boolean addAll(Collection<? extends E> collection) {
    return getSource().addAll(collection);
  }

  @Override
  public boolean addAll(int i, Collection<? extends E> collection) {
    return getSource().addAll(i, collection);
  }

  @Override
  public boolean removeAll(Collection<?> collection) {
    return getSource().removeAll(collection);
  }

  @Override
  public boolean retainAll(Collection<?> collection) {
    return getSource().retainAll(collection);
  }

  @Override
  public void clear() {
    getSource().clear();
  }

  @Override
  public E get(int i) {
    return null;
  }

  @Override
  public E set(int i, E e) {
    return null;
  }

  @Override
  public void add(int i, E e) {

  }

  @Override
  public E remove(int i) {
    return null;
  }

  @Override
  public int indexOf(Object o) {
    return 0;
  }

  @Override
  public int lastIndexOf(Object o) {
    return 0;
  }

  @Override
  public ListIterator<E> listIterator() {
    return null;
  }

  @Override
  public ListIterator<E> listIterator(int i) {
    return null;
  }

  @Override
  public List<E> subList(int i, int i1) {
    return null;
  }
}
