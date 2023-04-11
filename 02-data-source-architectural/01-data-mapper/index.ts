import { startDb } from './db';
import { Person } from './person';
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

  console.log('---- insert');
  const newPerson = new Person(Person.NO_ID, 'Novo', 'Silva', 3);
  await personMapper.insert(newPerson);
  console.log({ inserted: await personMapper.find(newPerson.id) });
}

main();
