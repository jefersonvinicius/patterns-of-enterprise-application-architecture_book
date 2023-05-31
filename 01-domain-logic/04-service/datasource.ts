type DataSource = {
  products: { id: number; name: string }[];
  contracts: { id: number; productId: number; revenue: number; whenSigned: Date }[];
  revenueRecognitions: { amount: number; date: Date }[];
};

const dataSource: DataSource = {
  products: [
    { id: 1, name: 'Word' },
    { id: 2, name: 'SpreadSheet' },
    { id: 3, name: 'Database' },
  ],
  contracts: [
    { id: 1, productId: 1, revenue: 1000, whenSigned: new Date('2022-10-23T10:00:00Z') },
    { id: 2, productId: 2, revenue: 1000, whenSigned: new Date('2022-11-23T10:00:00Z') },
    { id: 3, productId: 3, revenue: 1000, whenSigned: new Date('2022-10-26T10:00:00Z') },
  ],
  revenueRecognitions: [],
};

export default dataSource;
