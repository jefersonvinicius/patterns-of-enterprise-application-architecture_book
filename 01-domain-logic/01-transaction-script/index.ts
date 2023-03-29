import { startDb } from './database/db';
import CalculateRevenueRecognitionTransactionScript from './scripts/calculate-revenue-recognitions';

async function main() {
  await startDb();
  await new CalculateRevenueRecognitionTransactionScript(1).run();
  await new CalculateRevenueRecognitionTransactionScript(2).run();
  await new CalculateRevenueRecognitionTransactionScript(3).run();
}

main();
