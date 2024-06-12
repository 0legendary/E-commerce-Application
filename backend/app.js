const express = require('express');
const app = express();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


app.use(express.json());

app.use('/', indexRouter);
app.use('/users', usersRouter);

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

