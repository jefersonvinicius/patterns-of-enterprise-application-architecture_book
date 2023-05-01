import { Contract } from './contract';

const contract = new Contract({
  contracts: [
    { id: 1, amount: 1000, dateWhenSigned: new Date() },
    { id: 2, amount: 1600, dateWhenSigned: new Date() },
  ],
});
