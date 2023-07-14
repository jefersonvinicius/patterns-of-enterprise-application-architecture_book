import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class CalculatorTest {
  
  @Test
  void sumTest() {
    Calculator calc = new Calculator();
    assertEquals(4, calc.sum(1, 3));
  }
}
