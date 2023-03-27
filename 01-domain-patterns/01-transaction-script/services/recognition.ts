import { Gateway } from '../database/gateway';
import { addDays } from 'date-fns';

export default class RecognitionService {
  constructor(private gateway: Gateway) {}

  async recognizedRevenue(contractId: number, asOf: Date) {
    const rows = await this.gateway.findRecognitionsFor(contractId, asOf);
    const result = rows.reduce((total, current) => total + current, 0);
    return result;
  }

  async calculateRevenueRecognition(contractId: number) {
    const contract = await this.gateway.findContract(contractId);
    const totalRevenue = contract.revenue;
    const recognitionDate = new Date(contract.dateSigned);
    const type = contract.type;
    switch (type) {
      case 'S':
        const allocation = totalRevenue / 3;
        await this.gateway.insertRecognition(contract.id, allocation, recognitionDate);
        await this.gateway.insertRecognition(contract.id, allocation, addDays(recognitionDate, 60));
        await this.gateway.insertRecognition(contract.id, allocation, addDays(recognitionDate, 90));
        break;
      case 'W':
        await this.gateway.insertRecognition(contract.id, totalRevenue, recognitionDate);
        break;
      case 'D':
        const allocationD = totalRevenue / 3;
        await this.gateway.insertRecognition(contract.id, allocationD, recognitionDate);
        await this.gateway.insertRecognition(contract.id, allocationD, addDays(recognitionDate, 30));
        await this.gateway.insertRecognition(contract.id, allocationD, addDays(recognitionDate, 60));
        break;
      default:
        throw Error(`Contract type "${type}" invalid`);
    }
  }
}
