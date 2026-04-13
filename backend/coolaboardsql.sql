CREATE DATABASE collabboard;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  role ENUM('admin', 'member') DEFAULT 'member'
);
select * from users;

USE collabboard;

SHOW TABLES;


DESCRIBE users;

CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  created_by INT,
  FOREIGN KEY (created_by) REFERENCES users(id)
);


CREATE TABLE project_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT,
  user_id INT,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);


-- kanban enginee 
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  status ENUM('todo', 'inprogress', 'done') DEFAULT 'todo',
  project_id INT,
  assigned_to INT,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id)
);


UPDATE users 
SET role = 'admin' 
WHERE email = 'shubham@gmail.com';


SELECT * FROM projects;

SELECT * FROM project_members;

USE collabboard;

UPDATE users 
SET role = 'admin' 
WHERE email = 'shubham@gmail.com';

SELECT * FROM tasks;

DELETE FROM tasks WHERE id = 2;


ALTER TABLE tasks ADD priority VARCHAR(10) DEFAULT 'medium';
ALTER TABLE tasks ADD due_date DATE;

