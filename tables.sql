CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  username varchar(64) UNIQUE NOT NULL,
  password varchar(64) NOT NULL,
  image varchar(64)
);

CREATE TABLE chats(
  id SERIAL PRIMARY KEY,
  username varchar(64) NOT NULL,
  message text NOT NULL,
  date varchar(20) NOT NULL
);