export class Artist {
  private static artists = [
    new Artist(1, 'The Weeknd', new Date('1990-02-16T00:00:00.000Z'), 45e6),
    new Artist(2, 'Bad Bunny', new Date('1994-03-10T00:00:00.000Z'), 46e6),
    new Artist(3, 'Billie Eilish', new Date('2001-12-18T00:00:00.000Z'), 90e6),
    new Artist(4, 'Drake', new Date('1986-10-24T00:00:00.000Z'), 92e6),
    new Artist(5, 'Taylor Swift', new Date('1989-12-13T00:00:00.000Z'), 240e6),
  ];

  readonly age: number;

  constructor(readonly id: number, readonly name: string, readonly birthDate: Date, readonly followers: number) {
    this.age = this.calculateAge();
  }

  static findById(id: number) {
    return this.artists.find((artist) => artist.id === id);
  }

  static list() {
    return Array.from(this.artists);
  }

  private calculateAge() {
    const today = new Date();

    let age = today.getFullYear() - this.birthDate.getFullYear();
    const monthDiff = today.getMonth() - this.birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < this.birthDate.getDate())) {
      age--;
    }
    return age;
  }
}
