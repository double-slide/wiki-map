DROP TABLE IF EXISTS pins CASCADE;
CREATE TABLE pins (
  id SERIAL PRIMARY KEY NOT NULL,
  creator_id INTEGER NOT NULL REFERENCES users(id),
  map_id INTEGER NOT NULL REFERENCES maps(id),
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(255),
  image_url VARCHAR(255)
);
