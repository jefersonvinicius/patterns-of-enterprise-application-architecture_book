package listloaders;

import java.util.List;

public interface VirtualListLoader<E> {
  List<E> load();
}
