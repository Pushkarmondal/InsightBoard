import express from 'express';
import routes from './routes/authRoutes';
import boardsRoute from './routes/boards';
import organizationRoute from './routes/organization';
import feedbackRoute from './routes/feedback';
import commentsRoute from './routes/comments';
import cors from 'cors';
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);
app.use(boardsRoute)
app.use(organizationRoute)
app.use(feedbackRoute)
app.use(commentsRoute)

app.listen(3333, () => {
    console.log('Server started on port 3333');
});