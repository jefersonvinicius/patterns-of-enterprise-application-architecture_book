import express from 'express';
import { Order } from './entities';
import { OrderRenderer } from './logical-screen';
import { HtmlScreen } from './html-screen';

console.log(Order.orders.map((order) => order.id));

const app = express();

app.get('/orders/:id', async (request, response) => {
  const order = Order.findById(request.params.id);
  if (!order) return response.sendStatus(404);
  const orderScreen = new OrderRenderer(order); // First step - Logical view
  const htmlScreen = new HtmlScreen(orderScreen); // Second step - Final view (html or any other rendering process)
  const content = await htmlScreen.render();
  console.log(content);
  return response.send(content);
});

app.listen(3333, () => {
  console.log('Serving at port 3333');
});
