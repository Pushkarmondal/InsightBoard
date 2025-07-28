import express from 'express';
import routes from './routes/authRoutes';
import boardsRoute from './routes/boards';
import organizationRoute from './routes/organization';
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);
app.use(boardsRoute)
app.use(organizationRoute)

app.listen(3333, () => {
    console.log('Server started on port 3333');
});