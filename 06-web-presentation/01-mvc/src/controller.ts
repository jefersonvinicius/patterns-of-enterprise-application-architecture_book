import { Request, Response } from 'express';
import { Student } from './model';

export class Controller {
  static handle(request: Request, response: Response) {
    const id = request.params.id;
    const student = Student.getById(Number(id));
    return response.render('view', { student: student?.asJson() });
  }
}
