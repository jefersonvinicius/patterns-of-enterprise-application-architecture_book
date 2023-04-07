import { startDb } from './db';
import { PersonMapper } from './person-mapper';

async function main() {
  await startDb();
  console.log('---- find');
  const personMapper = new PersonMapper();
  const person = await personMapper.find(1);
  console.log(person);

  console.log('---- findByLastName');
  const people = await personMapper.findByLastName('Santos');
  console.log({ people });

  console.log('---- findByLastName2');
  const people2 = await personMapper.findByLastName2('Santos');
  console.log({ people2 });

  console.log('---- update');
  const personFound = await personMapper.find(1);
  personFound!.firstName = 'Mudou';
  await personMapper.update(personFound!);
  console.log({ updated: await personMapper.find(1) });
}

main();
