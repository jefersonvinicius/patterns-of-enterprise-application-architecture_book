import { startDb } from './db';
import { PersonMapper } from './person-mapper';

async function main() {
  await startDb();
  const personMapper = new PersonMapper();
  const person = await personMapper.find(1);
  console.log(person);

  const people = await personMapper.findByLastName('Santos');
  console.log({ people });
}

main();
